const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/registro", authController.registrar);
router.post("/login", authController.login);
router.post("/recuperar-password", authController.solicitarRecuperacion);
router.post("/restablecer-password", authController.restablecerPassword);

module.exports = router;