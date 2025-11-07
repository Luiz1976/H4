// Serviço para envio de e-mails automático
// Este arquivo será integrado com um provedor de e-mail posteriormente

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  attachments?: { filename: string; content: string }[];
}

export interface EmailResult {
  sucesso: boolean;
  messageId?: string;
  erro?: string;
}

class EmailService {
  private readonly baseUrl = process.env.VITE_APP_URL || 'http://localhost:8080';

  // Template para convite de empresa
  private gerarTemplateConviteEmpresa(nomeEmpresa: string, codigoConvite: string, dataExpiracao?: Date): EmailTemplate {
    const linkConvite = `${this.baseUrl}/convite/${codigoConvite}`;
    const dataExpiracaoFormatada = dataExpiracao 
      ? dataExpiracao.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : null;

    const subject = `Convite para Testes Psicossociais - ${nomeEmpresa}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .content {
            margin-bottom: 30px;
          }
          .highlight {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
            background: rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .button:hover {
            background: #059669;
          }
          .info-box {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6b7280;
            font-size: 14px;
          }
          .steps {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .step {
            display: flex;
            align-items: center;
            margin: 10px 0;
          }
          .step-number {
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🧠 HumaniQ</div>
            <div class="subtitle">Plataforma de Testes Psicossociais</div>
          </div>

          <div class="content">
            <h2>Olá! Você foi convidado para participar</h2>
            <p>A <strong>${nomeEmpresa}</strong> está realizando uma avaliação psicossocial para melhorar o ambiente de trabalho e o bem-estar dos colaboradores.</p>

            <div class="highlight">
              <h3>Seu Código de Acesso</h3>
              <div class="code">${codigoConvite}</div>
              <p>Use este código para acessar os testes</p>
            </div>

            <div class="info-box">
              <h4>📋 Sobre os Testes</h4>
              <p>Os testes psicossociais avaliam aspectos como clima organizacional, estresse ocupacional, qualidade de vida no trabalho e outros fatores importantes para seu bem-estar profissional.</p>
            </div>

            <div class="steps">
              <h4>Como Participar:</h4>
              <div class="step">
                <div class="step-number">1</div>
                <span>Clique no botão abaixo ou acesse o link</span>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <span>Insira o código de acesso fornecido</span>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <span>Preencha seus dados básicos</span>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <span>Realize os testes com sinceridade</span>
              </div>
              <div class="step">
                <div class="step-number">5</div>
                <span>Visualize seus resultados</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${linkConvite}" class="button">🚀 Iniciar Testes Agora</a>
            </div>

            ${dataExpiracaoFormatada ? `
              <div class="warning-box">
                <h4>⏰ Prazo Importante</h4>
                <p>Este convite é válido até <strong>${dataExpiracaoFormatada}</strong>. Não perca a oportunidade de participar!</p>
              </div>
            ` : ''}

            <div class="info-box">
              <h4>🔒 Privacidade e Segurança</h4>
              <p>Seus dados são protegidos e utilizados apenas para fins de análise psicossocial. Os resultados são confidenciais e seguem as normas da LGPD.</p>
            </div>
          </div>

          <div class="footer">
            <p>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:</p>
            <p><a href="${linkConvite}">${linkConvite}</a></p>
            <br>
            <p>Este é um e-mail automático. Em caso de dúvidas, entre em contato com o RH da sua empresa.</p>
            <p>© 2024 HumaniQ - Plataforma de Testes Psicossociais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
HumaniQ - Convite para Testes Psicossociais

Olá!

A ${nomeEmpresa} está realizando uma avaliação psicossocial para melhorar o ambiente de trabalho e o bem-estar dos colaboradores.

SEU CÓDIGO DE ACESSO: ${codigoConvite}

Para participar:
1. Acesse: ${linkConvite}
2. Insira o código: ${codigoConvite}
3. Preencha seus dados básicos
4. Realize os testes com sinceridade
5. Visualize seus resultados

${dataExpiracaoFormatada ? `IMPORTANTE: Este convite é válido até ${dataExpiracaoFormatada}.` : ''}

PRIVACIDADE: Seus dados são protegidos e utilizados apenas para fins de análise psicossocial. Os resultados são confidenciais e seguem as normas da LGPD.

Em caso de dúvidas, entre em contato com o RH da sua empresa.

© 2024 HumaniQ - Plataforma de Testes Psicossociais
    `;

    return { subject, htmlContent, textContent };
  }

  // Template para lembrete de convite próximo ao vencimento
  private gerarTemplateLembreteVencimento(nomeEmpresa: string, codigoConvite: string, diasRestantes: number): EmailTemplate {
    const linkConvite = `${this.baseUrl}/convite/${codigoConvite}`;
    const subject = `⏰ Lembrete: Convite expira em ${diasRestantes} dias - ${nomeEmpresa}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fef3c7;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 2px solid #f59e0b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f59e0b;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #f59e0b;
            margin-bottom: 10px;
          }
          .urgency {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⏰ HumaniQ</div>
            <div>Lembrete Importante</div>
          </div>

          <div class="urgency">
            Seu convite expira em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}!
          </div>

          <p>Olá!</p>
          <p>Este é um lembrete de que seu convite para participar dos testes psicossociais da <strong>${nomeEmpresa}</strong> está próximo do vencimento.</p>

          <p><strong>Código de Acesso:</strong> ${codigoConvite}</p>

          <div style="text-align: center;">
            <a href="${linkConvite}" class="button">🚨 Participar Agora</a>
          </div>

          <p>Não perca esta oportunidade de contribuir para um ambiente de trabalho melhor!</p>

          <div class="footer">
            <p>Link direto: <a href="${linkConvite}">${linkConvite}</a></p>
            <p>© 2024 HumaniQ - Plataforma de Testes Psicossociais</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
HumaniQ - Lembrete Importante

⏰ SEU CONVITE EXPIRA EM ${diasRestantes} ${diasRestantes === 1 ? 'DIA' : 'DIAS'}!

Olá!

Este é um lembrete de que seu convite para participar dos testes psicossociais da ${nomeEmpresa} está próximo do vencimento.

Código de Acesso: ${codigoConvite}
Link: ${linkConvite}

Não perca esta oportunidade de contribuir para um ambiente de trabalho melhor!

© 2024 HumaniQ - Plataforma de Testes Psicossociais
    `;

    return { subject, htmlContent, textContent };
  }

  // Enviar e-mail de convite
  async enviarConviteEmpresa(
    emailDestino: string, 
    nomeEmpresa: string, 
    codigoConvite: string, 
    dataExpiracao?: Date
  ): Promise<EmailResult> {
    try {
      const template = this.gerarTemplateConviteEmpresa(nomeEmpresa, codigoConvite, dataExpiracao);
      
      const emailData: EmailData = {
        to: emailDestino,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent
      };

      // Simular envio de e-mail (será substituído por integração real)
      await this.simularEnvioEmail(emailData);

      return {
        sucesso: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido ao enviar e-mail'
      };
    }
  }

  // Enviar lembrete de vencimento
  async enviarLembreteVencimento(
    emailDestino: string,
    nomeEmpresa: string,
    codigoConvite: string,
    diasRestantes: number
  ): Promise<EmailResult> {
    try {
      const template = this.gerarTemplateLembreteVencimento(nomeEmpresa, codigoConvite, diasRestantes);
      
      const emailData: EmailData = {
        to: emailDestino,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent
      };

      await this.simularEnvioEmail(emailData);

      return {
        sucesso: true,
        messageId: `reminder_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido ao enviar lembrete'
      };
    }
  }

  // Enviar múltiplos convites
  async enviarConvitesEmLote(
    emails: string[],
    nomeEmpresa: string,
    codigoConvite: string,
    dataExpiracao?: Date
  ): Promise<{ sucessos: number; falhas: number; detalhes: EmailResult[] }> {
    const resultados: EmailResult[] = [];
    let sucessos = 0;
    let falhas = 0;

    for (const email of emails) {
      const resultado = await this.enviarConviteEmpresa(email, nomeEmpresa, codigoConvite, dataExpiracao);
      resultados.push(resultado);
      
      if (resultado.sucesso) {
        sucessos++;
      } else {
        falhas++;
      }

      // Delay entre envios para evitar spam
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sucessos, falhas, detalhes: resultados };
  }

  // Simular envio de e-mail (será substituído por integração real)
  private async simularEnvioEmail(emailData: EmailData): Promise<void> {
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simular falha ocasional (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Falha temporária no servidor de e-mail');
    }

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 E-mail simulado enviado:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Validar endereço de e-mail
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Configurar integração com provedor de e-mail real
  // Esta função será implementada quando integrar com SendGrid, AWS SES, etc.
  async configurarProvedor(config: {
    provider: 'sendgrid' | 'aws-ses' | 'mailgun';
    apiKey: string;
    fromEmail: string;
    fromName?: string;
  }): Promise<void> {
    // Implementação futura para integração com provedores reais
    console.log('Configuração de provedor de e-mail:', config.provider);
  }
}

// Instância singleton do serviço
export const emailService = new EmailService();