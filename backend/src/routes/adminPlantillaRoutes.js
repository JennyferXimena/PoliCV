const express = require("express");

const adminPlantillaController =
  require("../controllers/adminPlantillaController");

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
  adminPlantillaController.listar
);

router.post(
  "/",
  adminPlantillaController.crear
);

router.put(
  "/:id",
  adminPlantillaController.actualizar
);

router.patch(
  "/:id/estado",
  adminPlantillaController.cambiarEstado
);

module.exports = router;