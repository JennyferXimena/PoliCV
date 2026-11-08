const express = require("express");

const adminUsuarioController =
  require("../controllers/usuarioAdministradorController");

const {
  verificarToken
} = require("../middlewares/AutenticacionMiddleware");

const {
  verificarRol
} = require("../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol("Administrador"));

router.get(
  "/",
  adminUsuarioController.listarUsuarios
);

router.patch(
  "/:id/estado",
  adminUsuarioController.cambiarEstado
);

module.exports = router;