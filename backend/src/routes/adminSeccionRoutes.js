const express = require("express");

const adminSeccionController =
  require("../controllers/adminSeccionController");

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
  adminSeccionController.listar
);

router.post(
  "/",
  adminSeccionController.crear
);

router.put(
  "/:id",
  adminSeccionController.actualizar
);

router.patch(
  "/:id/estado",
  adminSeccionController.cambiarEstado
);

module.exports = router;