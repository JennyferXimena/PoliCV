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


router.use(
  verificarToken,
  verificarRol("Administrador")
);


/* =========================================================
   LISTAR LAS 3 PLANTILLAS PREDETERMINADAS
========================================================= */

router.get(
  "/",
  adminPlantillaController.listar
);


/* =========================================================
   ACTIVAR / DESACTIVAR PLANTILLA
========================================================= */

router.patch(
  "/:id/estado",
  adminPlantillaController.cambiarEstado
);


module.exports = router;