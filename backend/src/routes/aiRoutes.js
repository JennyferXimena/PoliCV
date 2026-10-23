const express = require("express");

const router = express.Router();

const {
  chatIA,
  sugerirResumen,
  aplicarResumen
} = require(
  "../controllers/aiController"
);

const {
  verificarToken
} = require(
  "../middlewares/authMiddleware"
);

const {
  verificarRol
} = require(
  "../middlewares/roleMiddleware"
);

const {
  generarResumenBorrador,
  crearCVDesdeIA
} = require(
  "../controllers/aiCvController"
);

const {
  mejorarTexto
} = require(
  "../controllers/aiTextController"
);

router.post(
  "/chat",
  verificarToken,
  verificarRol("Estudiante"),
  chatIA
);

router.post(
  "/curriculums/:idCurriculum/resumen/sugerir",
  verificarToken,
  verificarRol("Estudiante"),
  sugerirResumen
);

router.put(
  "/curriculums/:idCurriculum/resumen/aplicar",
  verificarToken,
  verificarRol("Estudiante"),
  aplicarResumen
);

router.post(
  "/curriculums/crear-desde-ia",
  verificarToken,
  verificarRol("Estudiante"),
  crearCVDesdeIA
);

router.post(
  "/curriculums/borrador/resumen",
  verificarToken,
  verificarRol("Estudiante"),
  generarResumenBorrador
);

router.post(
  "/mejorar-texto",
  verificarToken,
  verificarRol("Estudiante"),
  mejorarTexto
);

module.exports = router;