const express = require("express");

const adminPropuestaController =
  require("../controllers/propuestaAdministradorController");

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
  adminPropuestaController.listar
);

router.patch(
  "/:id",
  adminPropuestaController.actualizar
);

module.exports = router;