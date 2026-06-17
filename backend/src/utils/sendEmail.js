import nodemailer from 'nodemailer';

const TIMEOUT_MS = 10_000;

const createTransportOptions = (port) => ({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS.trim()
  },
  tls: {
    // No fallar si el certificado es auto-firmado (común en nodos de nube)
    rejectUnauthorized: false
  },
  connectionTimeout: TIMEOUT_MS,
  socketTimeout: TIMEOUT_MS,
});

const trySendMail = async (options, transportOptions) => {
  const transporter = nodemailer.createTransport(transportOptions);
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

  return Promise.race([envio, timeout]);
};

const sendEmail = async (options) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] ⚠️ Credenciales SMTP incompletas:');
    console.warn('  SMTP_HOST:', process.env.SMTP_HOST ? '✓' : '❌');
    console.warn('  SMTP_USER:', process.env.SMTP_USER ? '✓' : '❌');
    console.warn('  SMTP_PASS:', process.env.SMTP_PASS ? '✓' : '❌');
    console.warn('  Destinatario:', options.email);
    return Promise.resolve();
  }

  const preferredPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const portsToTry = [preferredPort];
  if (preferredPort === 465) portsToTry.push(587);
  if (preferredPort === 587) portsToTry.push(465);

  let lastError;

  for (const port of portsToTry) {
    try {
      console.log(`[EMAIL] 📧 Intentando enviar por SMTP ${process.env.SMTP_HOST}:${port}...`);
      await trySendMail(options, createTransportOptions(port));
      console.log('[EMAIL] ✓ Correo enviado exitosamente');
      return;
    } catch (error) {
      lastError = error;
      console.error(`[EMAIL] ❌ Error en puerto ${port}:`, error.message);
      if (port === portsToTry[portsToTry.length - 1]) break;
      console.log('[EMAIL] 🔁 Reintentando con el otro puerto...');
    }
  }

  console.error('[EMAIL] ❌ No se pudo enviar el correo. Último error:', lastError?.message);
};

export default sendEmail;
