import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia email usando SendGrid
 */
export async function enviarEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback para texto puro
      html: options.html,
    };

    await client.send(msg);
    console.log('✅ [EmailService] Email enviado com sucesso para:', options.to);
    return true;
  } catch (error) {
    console.error('❌ [EmailService] Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Envia convite para empresa
 */
export async function enviarConviteEmpresa(
  emailDestino: string,
  nomeEmpresa: string,
  linkConvite: string
): Promise<boolean> {
  const assunto = '🎯 Convite para HumaniQ AI - Gestão de Saúde Psicossocial';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .content h2 { color: #667eea; margin-top: 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
        .logo { font-size: 36px; font-weight: 800; letter-spacing: -1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HQ</div>
          <h1>HumaniQ AI</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Plataforma de Avaliação Psicossocial</p>
        </div>
        
        <div class="content">
          <h2>🎉 Você foi convidado!</h2>
          <p>Olá,</p>
          <p>A empresa <strong>${nomeEmpresa}</strong> foi convidada para usar a <strong>HumaniQ AI</strong>, nossa plataforma completa de avaliação e gestão de riscos psicossociais no ambiente de trabalho.</p>
          
          <div class="info-box">
            <strong>🔹 O que é HumaniQ AI?</strong><br>
            Plataforma especializada em testes psicológicos, análise de clima organizacional, gestão de riscos psicossociais (NR1/ISO 45003) e relatórios com inteligência artificial.
          </div>
          
          <p><strong>Para começar:</strong></p>
          <ol>
            <li>Clique no botão abaixo para aceitar o convite</li>
            <li>Crie sua senha de acesso</li>
            <li>Configure sua empresa e comece a convidar colaboradores</li>
          </ol>
          
          <center>
            <a href="${linkConvite}" class="button">✨ Aceitar Convite e Começar</a>
          </center>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Link direto:</strong><br>
            <a href="${linkConvite}" style="color: #667eea; word-break: break-all;">${linkConvite}</a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            Se você não esperava este convite, pode ignorar este email com segurança.
          </p>
        </div>
        
        <div class="footer">
          <strong>HumaniQ AI</strong><br>
          Tecnologia e Inovação em Saúde Mental Corporativa<br>
          © 2025 - Todos os direitos reservados
        </div>
      </div>
    </body>
    </html>
  `;

  return await enviarEmail({
    to: emailDestino,
    subject: assunto,
    html: html,
  });
}

/**
 * Envia convite para colaborador
 */
export async function enviarConviteColaborador(
  emailDestino: string,
  nomeColaborador: string,
  nomeEmpresa: string,
  linkConvite: string
): Promise<boolean> {
  const assunto = `🎯 ${nomeEmpresa} convidou você para HumaniQ AI`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .content h2 { color: #667eea; margin-top: 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .benefits { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefits ul { margin: 10px 0; padding-left: 20px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
        .logo { font-size: 36px; font-weight: 800; letter-spacing: -1px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HQ</div>
          <h1>HumaniQ AI</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Bem-estar no Trabalho</p>
        </div>
        
        <div class="content">
          <h2>👋 Olá${nomeColaborador ? ', ' + nomeColaborador : ''}!</h2>
          <p><strong>${nomeEmpresa}</strong> se preocupa com seu bem-estar e convidou você para participar de avaliações psicológicas através da plataforma <strong>HumaniQ AI</strong>.</p>
          
          <div class="benefits">
            <strong>✨ Por que participar?</strong>
            <ul>
              <li>Autoconhecimento profissional</li>
              <li>Avaliação de clima organizacional</li>
              <li>Identificação de riscos psicossociais</li>
              <li>Contribuir para um ambiente de trabalho mais saudável</li>
              <li>100% confidencial e seguro</li>
            </ul>
          </div>
          
          <p><strong>Como funciona:</strong></p>
          <ol>
            <li>Clique no botão abaixo para aceitar o convite</li>
            <li>Crie sua senha de acesso pessoal</li>
            <li>Responda aos testes disponibilizados</li>
            <li>Visualize seus resultados individuais</li>
          </ol>
          
          <center>
            <a href="${linkConvite}" class="button">🚀 Começar Agora</a>
          </center>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Link direto:</strong><br>
            <a href="${linkConvite}" style="color: #667eea; word-break: break-all;">${linkConvite}</a>
          </p>
          
          <p style="margin-top: 30px; font-size: 13px; color: #666; background: #fff9e6; padding: 15px; border-radius: 6px; border-left: 3px solid #ffc107;">
            <strong>🔒 Privacidade Garantida:</strong> Suas respostas são totalmente confidenciais. A empresa receberá apenas dados agregados e anônimos para melhorar o ambiente de trabalho.
          </p>
        </div>
        
        <div class="footer">
          <strong>HumaniQ AI</strong><br>
          Tecnologia e Inovação em Saúde Mental Corporativa<br>
          © 2025 - Todos os direitos reservados
        </div>
      </div>
    </body>
    </html>
  `;

  return await enviarEmail({
    to: emailDestino,
    subject: assunto,
    html: html,
  });
}

/**
 * Envia email de boas-vindas após aceitar convite
 */
export async function enviarBoasVindas(
  emailDestino: string,
  nome: string,
  tipo: 'empresa' | 'colaborador'
): Promise<boolean> {
  const assunto = tipo === 'empresa' 
    ? '🎉 Bem-vindo à HumaniQ AI!' 
    : '🎉 Cadastro Confirmado - HumaniQ AI';
  
  const html = tipo === 'empresa' ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo à HumaniQ AI!</h1>
        </div>
        <div class="content">
          <p>Olá ${nome},</p>
          <p>Seu cadastro foi concluído com sucesso! Agora você pode começar a convidar colaboradores e iniciar a jornada de gestão de saúde psicossocial na sua empresa.</p>
          <p><strong>Próximos passos:</strong></p>
          <ol>
            <li>Acesse o dashboard da sua empresa</li>
            <li>Configure os testes que deseja aplicar</li>
            <li>Comece a convidar seus colaboradores</li>
            <li>Acompanhe os resultados em tempo real</li>
          </ol>
          <p>Qualquer dúvida, estamos à disposição!</p>
        </div>
        <div class="footer">
          <strong>HumaniQ AI</strong> - © 2025
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">✅ Cadastro Confirmado!</h1>
        </div>
        <div class="content">
          <p>Olá ${nome},</p>
          <p>Seu cadastro na HumaniQ AI foi confirmado com sucesso!</p>
          <p>Agora você pode acessar a plataforma e realizar os testes psicológicos disponibilizados pela sua empresa.</p>
          <p>Seus resultados serão confidenciais e você poderá acompanhá-los a qualquer momento no seu painel pessoal.</p>
        </div>
        <div class="footer">
          <strong>HumaniQ AI</strong> - © 2025
        </div>
      </div>
    </body>
    </html>
  `;

  return await enviarEmail({
    to: emailDestino,
    subject: assunto,
    html: html,
  });
}
