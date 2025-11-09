const nodemailer = require('nodemailer');
const {USUARIO_CORREO, CONTRASENA_CORREO} = process.env;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // ejemplo smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.USUARIO_CORREO,
    pass: process.env.CONTRASENA_CORREO,
  },
});

async function enviarCorreo(destino, asunto, texto) {
  await transporter.sendMail({
    from: `"Loteria Digital" <${process.env.USUARIO_CORREO}>`,
    to: destino,
    subject: asunto,
    text: texto,
  });
}

module.exports = enviarCorreo;
