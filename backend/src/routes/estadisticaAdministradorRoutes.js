const express = require("express");

const adminEstadisticaController =
  require("../controllers/estadisticaAdministradorController");

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
  adminEstadisticaController.obtenerResumen
);

module.exports = router;