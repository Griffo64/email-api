import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, nome, url, tipo } = req.body;

  if (!email || !nome || !url || !tipo) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Personalização dinâmica por tipo
  let subject = 'Confirme seu acesso';
  let title = 'Grupo exclusivo, conforto garantido,<br />experiências inesquecíveis';
  let buttonText = 'Confirmar Acesso';
  let messageIntro = 'Para seguir com seu acesso à plataforma exclusiva da DaniNegro Viagens e Turismo, clique no botão abaixo:';

  if (tipo === 'redefinicao') {
    subject = 'Redefina sua senha';
    title = 'Redefinição de senha';
    buttonText = 'Redefinir Senha';
    messageIntro = 'Clique no botão abaixo para redefinir sua senha de acesso à plataforma DaniNegro:';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
              Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
            padding: 40px;
            color: #333;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .logo {
            width: 120px;
            margin: 0 auto 30px;
            display: block;
          }
          .title {
            text-align: center;
            font-size: 22px;
            color: #b00020;
            margin-bottom: 24px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .cta-button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #b00020;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            text-align: center;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="https://daninegro.tur.br/DNLogoEmail.png" alt="DaniNegro Viagens e Turismo" />
          <h2 class="title">${title}</h2>
          <div class="message">
            <p>Olá <strong>${nome}</strong>,</p>
            <p>${messageIntro}</p>
            <p style="text-align: center; margin-top: 32px;">
              <a href="${url}" class="cta-button">${buttonText}</a>
            </p>
            <p style="margin-top: 32px;">Se não foi você quem solicitou, apenas ignore este e-mail.</p>
          </div>
          <div class="footer">
            &copy; 2025 DaniNegro Viagens e Turismo Ltda<br />
            Todos os direitos reservados.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'DaniNegro <noreply@daninegro.tur.br>',
      to: email,
      subject,
      html: htmlContent,
    });

    return res.status(200).json({ message: 'E-mail enviado com sucesso.', data });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ message: 'Erro ao enviar e-mail', error });
  }
}
