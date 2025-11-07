import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { empresas, convitesEmpresa } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const router = Router();

// Verificar se a chave do Stripe está configurada
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe operations will fail.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development', {
  apiVersion: '2025-09-30.clover',
});

const PLANS = {
  essencial: {
    name: 'Essencial',
    pricePerEmployee: 15,
    stripePriceId: process.env.STRIPE_PRICE_ESSENCIAL || '',
  },
  profissional: {
    name: 'Profissional',
    pricePerEmployee: 25,
    stripePriceId: process.env.STRIPE_PRICE_PROFISSIONAL || '',
  },
  enterprise: {
    name: 'Enterprise',
    pricePerEmployee: 35,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
  },
};

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planType, employeeCount, empresaId, email, nomeEmpresa } = req.body;

    if (!planType || !employeeCount || !email) {
      return res.status(400).json({
        error: 'planType, employeeCount e email são obrigatórios',
      });
    }

    const plan = PLANS[planType as keyof typeof PLANS];
    if (!plan) {
      return res.status(400).json({
        error: 'Plano inválido. Use: essencial, profissional ou enterprise',
      });
    }

    let customerId: string | undefined;

    if (empresaId) {
      const [empresa] = await db
        .select()
        .from(empresas)
        .where(eq(empresas.id, empresaId))
        .limit(1);

      if (empresa?.stripeCustomerId) {
        customerId = empresa.stripeCustomerId;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          empresaId: empresaId || '',
          nomeEmpresa: nomeEmpresa || '',
        },
      });
      customerId = customer.id;

      if (empresaId) {
        await db
          .update(empresas)
          .set({ stripeCustomerId: customerId })
          .where(eq(empresas.id, empresaId));
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `HumaniQ AI - Plano ${plan.name}`,
              description: `${employeeCount} colaboradores × R$ ${plan.pricePerEmployee}/mês`,
            },
            unit_amount: plan.pricePerEmployee * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: employeeCount,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || req.headers.origin}/checkout/cancelado`,
      metadata: {
        empresaId: empresaId || '',
        planType,
        employeeCount: employeeCount.toString(),
      },
      subscription_data: {
        metadata: {
          empresaId: empresaId || '',
          planType,
          employeeCount: employeeCount.toString(),
        },
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({
      error: 'Erro ao criar sessão de pagamento',
      details: error.message,
    });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Assinatura ausente' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Erro ao verificar webhook:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { empresaId, planType, employeeCount } = session.metadata || {};

        if (session.subscription) {
          const token = randomBytes(16).toString('hex');
          const nomeEmpresa = session.customer_details?.name || 'Nova Empresa';
          const emailContato = session.customer_details?.email || '';
          const dataExpiracao = new Date();
          dataExpiracao.setDate(dataExpiracao.getDate() + 90);

          const [convite] = await db
            .insert(convitesEmpresa)
            .values({
              token,
              nomeEmpresa,
              emailContato,
              numeroColaboradores: parseInt(employeeCount || '0'),
              diasAcesso: 90,
              validade: dataExpiracao,
              status: 'pendente',
              metadados: {
                stripeSessionId: session.id,
                stripeCustomerId: session.customer,
                planType,
              },
            })
            .returning();

          if (empresaId) {
            await db
              .update(empresas)
              .set({
                stripeSubscriptionId: session.subscription as string,
                plano: planType,
                statusAssinatura: 'ativa',
                tokenConvite: token,
                updatedAt: new Date(),
              })
              .where(eq(empresas.id, empresaId));
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const empresaId = subscription.metadata.empresaId;

        if (empresaId) {
          await db
            .update(empresas)
            .set({
              statusAssinatura: subscription.status === 'active' ? 'ativa' : subscription.status,
              updatedAt: new Date(),
            })
            .where(eq(empresas.id, empresaId));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const empresaId = subscription.metadata.empresaId;

        if (empresaId) {
          await db
            .update(empresas)
            .set({
              statusAssinatura: 'cancelada',
              updatedAt: new Date(),
            })
            .where(eq(empresas.id, empresaId));
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof (invoice as any).subscription === 'string' 
          ? (invoice as any).subscription 
          : (invoice as any).subscription?.id;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const empresaId = sub.metadata.empresaId;

          if (empresaId) {
            await db
              .update(empresas)
              .set({
                statusAssinatura: 'pagamento_falhou',
                updatedAt: new Date(),
              })
              .where(eq(empresas.id, empresaId));
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar evento' });
  }
});

router.get('/subscription-status/:empresaId', async (req, res) => {
  try {
    const { empresaId } = req.params;

    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    let subscriptionData: any = null;

    if (empresa.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          empresa.stripeSubscriptionId
        );
        subscriptionData = {
          status: subscription.status,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          plan: empresa.plano,
        };
      } catch (error) {
        console.error('Erro ao recuperar assinatura do Stripe:', error);
      }
    }

    res.json({
      empresaId: empresa.id,
      plano: empresa.plano,
      statusAssinatura: empresa.statusAssinatura,
      stripeCustomerId: empresa.stripeCustomerId,
      stripeSubscriptionId: empresa.stripeSubscriptionId,
      subscription: subscriptionData,
    });
  } catch (error: any) {
    console.error('Erro ao buscar status de assinatura:', error);
    res.status(500).json({
      error: 'Erro ao buscar status de assinatura',
      details: error.message,
    });
  }
});

router.post('/cancel-subscription/:empresaId', async (req, res) => {
  try {
    const { empresaId } = req.params;

    const [empresa] = await db
      .select()
      .from(empresas)
      .where(eq(empresas.id, empresaId))
      .limit(1);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    if (!empresa.stripeSubscriptionId) {
      return res.status(400).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    const subscription = await stripe.subscriptions.update(
      empresa.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    await db
      .update(empresas)
      .set({
        statusAssinatura: 'cancelamento_agendado',
        updatedAt: new Date(),
      })
      .where(eq(empresas.id, empresaId));

    res.json({
      success: true,
      message: 'Assinatura será cancelada ao final do período',
      cancelAt: new Date((subscription as any).current_period_end * 1000),
    });
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao cancelar assinatura',
      details: error.message,
    });
  }
});

router.get('/convite-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [convite] = await db
      .select()
      .from(convitesEmpresa)
      .where(eq(convitesEmpresa.metadados, { stripeSessionId: sessionId }))
      .limit(1);

    if (!convite) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      const metadados = session.metadata as any;
      const token = randomBytes(16).toString('hex');
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 90);

      const [novoConvite] = await db
        .insert(convitesEmpresa)
        .values({
          token,
          nomeEmpresa: session.customer_details?.name || 'Nova Empresa',
          emailContato: session.customer_details?.email || '',
          numeroColaboradores: parseInt(metadados.employeeCount || '0'),
          diasAcesso: 90,
          validade: dataExpiracao,
          status: 'pendente',
          metadados: {
            stripeSessionId: sessionId,
            stripeCustomerId: session.customer,
            planType: metadados.planType,
          },
        })
        .returning();

      return res.json({
        success: true,
        convite: novoConvite,
        url: `${process.env.FRONTEND_URL || req.headers.origin}/convite/${novoConvite.token}`,
      });
    }

    res.json({
      success: true,
      convite,
      url: `${process.env.FRONTEND_URL || req.headers.origin}/convite/${convite.token}`,
    });
  } catch (error: any) {
    console.error('Erro ao buscar convite:', error);
    res.status(500).json({
      error: 'Erro ao buscar convite',
      details: error.message,
    });
  }
});

export default router;
