const express = require("express");
const router = express.Router();
const controladorAutenticacion = require("../controllers/AutenticacionController");

router.post("/registro", controladorAutenticacion.registrarUsuario);
router.post("/login", controladorAutenticacion.iniciarSesion);
router.post("/verificar-correo", controladorAutenticacion.verificarCorreo);
router.post("/reenviar-verificacion", controladorAutenticacion.reenviarVerificacion);
router.post("/recuperar", controladorAutenticacion.solicitarRecuperacion);
router.post("/restablecer", controladorAutenticacion.restablecerContrasena);

module.exports = router;