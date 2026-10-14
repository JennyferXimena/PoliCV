const express = require("express");

const adminPropuestaController =
  require("../controllers/adminPropuestaController");

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
  adminPropuestaController.listar
);

router.patch(
  "/:id",
  adminPropuestaController.actualizar
);

module.exports = router;