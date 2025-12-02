const nodemailer = require("nodemailer");

let transporter;

async function initTransporter() {
  if (transporter) return transporter;

  if (process.env.USUARIO_CORREO && process.env.CONTRASENA_CORREO) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USUARIO_CORREO,
        pass: process.env.CONTRASENA_CORREO,
      },
    });
    console.log("📧 Usando SMTP configurado:", process.env.USUARIO_CORREO);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📧 Usando Ethereal Email (desarrollo)");
    console.log("   Usuario:", testAccount.user);
    console.log("   Ver emails en: https://ethereal.email/messages");
  }

  return transporter;
}

async function enviarCorreo(destino, asunto, texto) {
  const transport = await initTransporter();

  const info = await transport.sendMail({
    from: `"Loteria Digital" <${process.env.USUARIO_CORREO || "noreply@loteria.com"}>`,
    to: destino,
    subject: asunto,
    text: texto,
  });

  if (nodemailer.getTestMessageUrl(info)) {
    console.log("📬 Email enviado! Ver en:", nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = enviarCorreo;
