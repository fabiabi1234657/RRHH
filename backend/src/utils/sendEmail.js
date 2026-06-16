import nodemailer from 'nodemailer';

const TIMEOUT_MS = 10_000;

const sendEmail = async (options) => {
  // Si no hay credenciales SMTP, devolver éxito (log silencioso en producción)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] Credenciales SMTP no configuradas. Email no enviado para:', options.email);
    return Promise.resolve(); // No bloquear el flujo
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465', // true para puerto 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: TIMEOUT_MS,
      socketTimeout: TIMEOUT_MS,
    });

    const message = {
      from: `${process.env.FROM_NAME || 'CorpHR'} <${process.env.FROM_EMAIL || 'noreply@corphr.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    const envio = transporter.sendMail(message);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP timeout (10s)')), TIMEOUT_MS)
    );

    await Promise.race([envio, timeout]);
  } catch (error) {
    console.error('[EMAIL] Error enviando correo:', error.message);
    // No relanzar error — permitir que el flujo continúe
  }
};

export default sendEmail;
