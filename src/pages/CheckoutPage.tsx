import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Removido loadStripe para evitar inicialização sem chave válida
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Função util para obter base da API de forma segura
function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || '';
  const trimmed = raw.replace(/\/+$/, '');
  const base = trimmed.replace(/\/api$/, '');
  return base;
}

const PLANOS = {
  essencial: {
    nome: 'Essencial',
    precoColaborador: 15,
    recursos: ['QVT', 'RPO', 'Estresse', 'Análise IA Básica', 'Relatórios Básicos'],
  },
  profissional: {
    nome: 'Profissional',
    precoColaborador: 25,
    recursos: [
      'Todos do Essencial',
      'Karasek-Siegrist',
      'PAS',
      'MGRP',
      'Análise IA Avançada',
      'Relatórios Detalhados',
      'Suporte Prioritário',
    ],
  },
  enterprise: {
    nome: 'Enterprise',
    precoColaborador: 35,
    recursos: [
      'Todos do Profissional',
      'Clima e Bem-Estar',
      'Integração ERP',
      'API Personalizada',
      'Consultoria Especializada',
      'Suporte 24/7',
    ],
  },
};

export default function CheckoutPage() {
  const { planType } = useParams<{ planType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const planKey = (planType as keyof typeof PLANOS) || 'profissional';
  const plano = PLANOS[planKey];

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [quantidadeColaboradores, setQuantidadeColaboradores] = useState(10);
  const [loading, setLoading] = useState(false);

  const precoTotal = plano.precoColaborador * quantidadeColaboradores;

  const handleCheckout = async () => {
    if (!nomeEmpresa || !email) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o nome da empresa e e-mail',
        variant: 'destructive',
      });
      return;
    }

    if (quantidadeColaboradores < 1) {
      toast({
        title: 'Quantidade inválida',
        description: 'É necessário ter pelo menos 1 colaborador',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const apiBase = getApiBase();
      if (!apiBase) {
        throw new Error('Configuração ausente: VITE_API_URL não definida');
      }

      const response = await fetch(`${apiBase}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planType: planKey,
          employeeCount: quantidadeColaboradores,
          email,
          nomeEmpresa,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      if (!data.url) {
        throw new Error('URL de checkout não foi retornada');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout - Plano {plano.nome}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados para iniciar sua assinatura
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card data-testid="card-checkout-form">
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure sua conta e quantidade de colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  data-testid="input-nome-empresa"
                  placeholder="Sua Empresa Ltda"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="contato@suaempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colaboradores">Quantidade de Colaboradores</Label>
                <Input
                  id="colaboradores"
                  data-testid="input-colaboradores"
                  type="number"
                  min="1"
                  value={quantidadeColaboradores}
                  onChange={(e) => setQuantidadeColaboradores(parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  R$ {plano.precoColaborador},00 por colaborador/mês
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>Total Mensal:</span>
                  <span className="text-blue-600 dark:text-blue-400" data-testid="text-preco-total">
                    R$ {precoTotal},00
                  </span>
                </div>

                <Button
                  data-testid="button-continuar-pagamento"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Continuar para Pagamento'
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                  Pagamento seguro processado pelo Stripe
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-resumo-plano">
            <CardHeader>
              <CardTitle>Resumo do Plano</CardTitle>
              <CardDescription>
                O que está incluído no Plano {plano.nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plano.recursos.map((recurso, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`item-recurso-${index}`}>
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{recurso}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Cancelamento Flexível</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Cancele a qualquer momento. Sem taxas de cancelamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button
                  data-testid="button-voltar"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Voltar para Planos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}