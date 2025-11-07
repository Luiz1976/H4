import { Router } from 'express';
import { enviarEmail, enviarConviteEmpresa, enviarConviteColaborador, enviarBoasVindas } from '../services/emailService';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Endpoint de teste para envio de emails
 * Apenas para admin em ambiente de desenvolvimento
 */
router.post('/test-email', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { tipo, emailDestino } = req.body;

    if (!emailDestino) {
      return res.status(400).json({ error: 'Email de destino é obrigatório' });
    }

    let resultado = false;
    let mensagem = '';

    switch (tipo) {
      case 'convite-empresa':
        resultado = await enviarConviteEmpresa(
          emailDestino,
          'Empresa Teste LTDA',
          'https://humaniq.ai/convite/empresa/token123'
        );
        mensagem = 'Email de convite para empresa';
        break;

      case 'convite-colaborador':
        resultado = await enviarConviteColaborador(
          emailDestino,
          'João Silva',
          'Empresa Teste LTDA',
          'https://humaniq.ai/convite/colaborador/token456'
        );
        mensagem = 'Email de convite para colaborador';
        break;

      case 'boas-vindas-empresa':
        resultado = await enviarBoasVindas(
          emailDestino,
          'Empresa Teste LTDA',
          'empresa'
        );
        mensagem = 'Email de boas-vindas para empresa';
        break;

      case 'boas-vindas-colaborador':
        resultado = await enviarBoasVindas(
          emailDestino,
          'João Silva',
          'colaborador'
        );
        mensagem = 'Email de boas-vindas para colaborador';
        break;

      case 'teste-simples':
        resultado = await enviarEmail({
          to: emailDestino,
          subject: '✅ Teste de Email - HumaniQ AI',
          html: `
            <h1>🎉 Email de Teste</h1>
            <p>Este é um email de teste enviado pelo sistema HumaniQ AI.</p>
            <p>Se você recebeu esta mensagem, o sistema de emails está funcionando corretamente!</p>
            <hr>
            <small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small>
          `,
        });
        mensagem = 'Email de teste simples';
        break;

      default:
        return res.status(400).json({
          error: 'Tipo inválido. Use: convite-empresa, convite-colaborador, boas-vindas-empresa, boas-vindas-colaborador, ou teste-simples'
        });
    }

    if (resultado) {
      res.json({
        success: true,
        message: `${mensagem} enviado com sucesso para ${emailDestino}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Falha ao enviar ${mensagem}`,
      });
    }
  } catch (error: any) {
    console.error('❌ Erro no endpoint de teste de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar envio de email',
      details: error.message,
    });
  }
});

/**
 * Endpoint para verificar status da configuração SendGrid
 */
router.get('/email-status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Tentar obter configurações sem enviar email
    const hasRequiredEnv = !!(
      process.env.REPLIT_CONNECTORS_HOSTNAME &&
      (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL)
    );

    res.json({
      configured: hasRequiredEnv,
      connectorHostname: !!process.env.REPLIT_CONNECTORS_HOSTNAME,
      hasReplIdentity: !!process.env.REPL_IDENTITY,
      hasWebReplRenewal: !!process.env.WEB_REPL_RENEWAL,
      message: hasRequiredEnv 
        ? '✅ SendGrid está configurado e pronto para uso'
        : '❌ SendGrid não está configurado corretamente',
    });
  } catch (error: any) {
    res.status(500).json({
      configured: false,
      error: error.message,
    });
  }
});

export default router;
