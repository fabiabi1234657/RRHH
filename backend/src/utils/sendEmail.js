import nodemailer from 'nodemailer';

const TIMEOUT_MS = 10_000;

const sendEmail = async (options) => {
  // Validar credenciales SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] ⚠️ Credenciales SMTP incompletas:');
    console.warn('  SMTP_HOST:', process.env.SMTP_HOST ? '✓' : '❌');
    console.warn('  SMTP_USER:', process.env.SMTP_USER ? '✓' : '❌');
    console.warn('  SMTP_PASS:', process.env.SMTP_PASS ? '✓' : '❌');
    console.warn('  Destinatario:', options.email);
    return Promise.resolve(); // No bloquear
  }

  try {
    console.log('[EMAIL] 📧 Configurando transporte SMTP...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465' || process.env.SMTP_PORT === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.trim() // Importante: trim para espacios
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

    console.log('[EMAIL] Enviando a:', options.email);
    
    const envio = transporter.sendMail(message);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP timeout (10s)')), TIMEOUT_MS)
    );

    await Promise.race([envio, timeout]);
    console.log('[EMAIL] ✓ Correo enviado exitosamente');
  } catch (error) {
    console.error('[EMAIL] ❌ Error:', error.message);
    // No relanzar — permitir que el flujo continúe
  }
};

export default sendEmail;
