import nodemailer from 'nodemailer';

const TIMEOUT_MS = 10_000; // 10 segundos

const sendEmail = async (options) => {
  // Configurar el transportador (SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: TIMEOUT_MS,
  });

  // Definir las opciones del correo
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Enviar el correo con timeout manual como respaldo
  const envio = transporter.sendMail(message);
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Tiempo de espera agotado al enviar el correo (10s)')), TIMEOUT_MS)
  );

  await Promise.race([envio, timeout]);
};

export default sendEmail;
