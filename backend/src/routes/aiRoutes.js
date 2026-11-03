const express =
  require("express");


const router =
  express.Router();


/* =========================================================
   MIDDLEWARES
========================================================= */

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


/* =========================================================
   CONTROLADORES GENERALES IA
========================================================= */

const {
  chatIA,
  sugerirResumen,
  aplicarResumen
} =
  require(
    "../controllers/aiController"
  );


/* =========================================================
   CONTROLADOR CREACIÓN CV CON IA
========================================================= */

const {
  generarResumenBorrador,
  crearCVDesdeIA
} =
  require(
    "../controllers/aiCvController"
  );


/* =========================================================
   CONTROLADOR MEJORAR REDACCIÓN
========================================================= */

const {
  mejorarTexto
} =
  require(
    "../controllers/aiTextController"
  );


/* =========================================================
   TODAS LAS RUTAS REQUIEREN ESTUDIANTE AUTENTICADO
========================================================= */

router.use(
  verificarToken,
  verificarRol(
    "Estudiante"
  )
);


/* =========================================================
   CHAT IA
========================================================= */

router.post(
  "/chat",
  chatIA
);


/* =========================================================
   MEJORAR CUALQUIER TEXTO DEL CV
========================================================= */

router.post(
  "/mejorar-texto",
  mejorarTexto
);


/* =========================================================
   SUGERIR RESUMEN DE UN CV EXISTENTE
========================================================= */

router.post(
  "/curriculums/:idCurriculum/resumen/sugerir",
  sugerirResumen
);


/* =========================================================
   APLICAR RESUMEN
========================================================= */

router.put(
  "/curriculums/:idCurriculum/resumen/aplicar",
  aplicarResumen
);


/* =========================================================
   CREAR CV DESDE CERO CON IA
========================================================= */

router.post(
  "/curriculums/crear-desde-ia",
  crearCVDesdeIA
);


/* =========================================================
   GENERAR BORRADOR DE RESUMEN
========================================================= */

router.post(
  "/curriculums/borrador/resumen",
  generarResumenBorrador
);


module.exports =
  router;