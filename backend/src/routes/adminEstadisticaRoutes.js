const express = require("express");

const adminEstadisticaController =
  require("../controllers/adminEstadisticaController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const {
  verificarRol
} = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol("Administrador"));

router.get(
  "/",
  adminEstadisticaController.obtenerResumen
);

module.exports = router;