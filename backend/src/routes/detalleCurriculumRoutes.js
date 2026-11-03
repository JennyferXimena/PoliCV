const express =
  require("express");


const {
  obtenerContenido,
  guardarSeccion
} =
  require(
    "../controllers/detalleCurriculumController"
  );


const {
  verificarToken
} =
  require(
    "../middlewares/authMiddleware"
  );


const {
  verificarRol
} =
  require(
    "../middlewares/roleMiddleware"
  );


const router =
  express.Router();


router.use(
  verificarToken,
  verificarRol(
    "Estudiante"
  )
);


/* =========================================================
   OBTENER LAS 10 SECCIONES + DATOS
========================================================= */

router.get(
  "/:id/contenido-fijo",
  obtenerContenido
);


/* =========================================================
   GUARDAR UNA SECCIÓN
========================================================= */

router.put(
  "/:id/contenido-fijo/:seccion",
  guardarSeccion
);


module.exports =
  router;