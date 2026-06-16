import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Configurar el transportador (SMTP)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Definir las opciones del correo
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Enviar el correo
  await transporter.sendMail(message);
};

export default sendEmail;
