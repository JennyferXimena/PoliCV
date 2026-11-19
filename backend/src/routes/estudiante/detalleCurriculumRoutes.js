const express = require("express");
const { obtenerContenido, guardarSeccion, subirArchivo } = require("../../controllers/estudiante/detalleCurriculumController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");
const subirArchivoCurriculum = require("../../middlewares/subirArchivoCurriculum");

const router = express.Router();

router.use(verificarToken, verificarRol("Estudiante"));

/* =========================================================
   OBTENER LAS 10 SECCIONES + DATOS
========================================================= */

router.get("/:id/contenido-fijo", obtenerContenido);

/* =========================================================
   SUBIR EVIDENCIA DESDE EL COMPUTADOR
========================================================= */

router.post(
  "/:id/archivo/:seccion",
  subirArchivoCurriculum.single("archivo"),
  subirArchivo
);

/* =========================================================
   GUARDAR UNA SECCIÓN
========================================================= */

router.put("/:id/contenido-fijo/:seccion", guardarSeccion);

module.exports = router;
