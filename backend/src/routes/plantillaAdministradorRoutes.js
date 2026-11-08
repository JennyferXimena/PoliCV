const express = require("express");

const adminPlantillaController =
  require("../controllers/plantillaAdministradorController");

const {
  verificarToken
} = require("../middlewares/AutenticacionMiddleware");

const {
  verificarRol
} = require("../middlewares/RolMiddleware");


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