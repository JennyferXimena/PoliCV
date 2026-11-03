const express = require("express");

const curriculumController =
  require("../controllers/curriculumController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const {
  verificarRol
} = require("../middlewares/roleMiddleware");


const router = express.Router();


/* =========================================================
   SOLO ESTUDIANTES AUTENTICADOS
========================================================= */

router.use(
  verificarToken,
  verificarRol("Estudiante")
);


/* =========================================================
   LISTAR CURRÍCULUMS
========================================================= */

router.get(
  "/",
  curriculumController.listar
);


/* =========================================================
   CREAR CURRÍCULUM
========================================================= */

router.post(
  "/",
  curriculumController.crear
);


/* =========================================================
   OBTENER UN CURRÍCULUM
========================================================= */

router.get(
  "/:id",
  curriculumController.obtenerPorId
);


/* =========================================================
   ACTUALIZAR CURRÍCULUM
========================================================= */

router.put(
  "/:id",
  curriculumController.actualizar
);


/* =========================================================
   ELIMINAR / DESACTIVAR CURRÍCULUM
========================================================= */

router.delete(
  "/:id",
  curriculumController.eliminar
);


module.exports = router;