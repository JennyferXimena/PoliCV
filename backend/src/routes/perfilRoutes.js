const express = require("express");

const perfilController =
  require("../controllers/perfilController");

const {
  verificarToken
} = require("../middlewares/AutenticacionMiddleware");

const router = express.Router();

router.get(
  "/",
  verificarToken,
  perfilController.obtenerPerfil
);

router.put(
  "/",
  verificarToken,
  perfilController.actualizarPerfil
);

module.exports = router;