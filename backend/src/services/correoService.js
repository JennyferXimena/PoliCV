const nodemailer = require("nodemailer");

const transportador = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

transportador.verify()
  .then(() => console.log("SMTP de Gmail conectado correctamente"))
  .catch((error) => console.error("Error SMTP:", error.message));

async function enviarCodigoVerificacion(correo, codigo) {
  return transportador.sendMail({
    from: `"TalentoESFOT" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: "Código de verificación - TalentoESFOT",
    text:
`TalentoESFOT

Tu código de verificación es:

${codigo}

Este código es válido durante 5 minutos.

Si no creaste una cuenta en TalentoESFOT, puedes ignorar este mensaje.`
  });
}

async function enviarCodigoRecuperacion(correo, codigo) {
  return transportador.sendMail({
    from: `"TalentoESFOT" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: "Recuperación de contraseña - TalentoESFOT",
    text: `TalentoESFOT

Recibimos una solicitud para cambiar tu contraseña.
Tu código de recuperación es: ${codigo}
Este código es válido durante 5 minutos.

Si no solicitaste este cambio, puedes ignorar este mensaje.`
  });
}

module.exports = { enviarCodigoVerificacion, enviarCodigoRecuperacion };