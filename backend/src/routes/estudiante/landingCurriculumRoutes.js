const express = require("express");
const { obtenerLanding, actualizarLanding, cambiarPublicacion, obtenerLandingPublica } = require("../../controllers/estudiante/landingCurriculumController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

/* =========================================================
   RUTA PÚBLICA
========================================================= */

router.get(
  "/publica/:slug",
  obtenerLandingPublica
);

/* =========================================================
   RUTAS DEL ESTUDIANTE
========================================================= */

router.use(
  verificarToken,
  verificarRol("Estudiante")
);

router.get(
  "/:id",
  obtenerLanding
);

router.put(
  "/:id",
  actualizarLanding
);

router.patch(
  "/:id/publicacion",
  cambiarPublicacion
);

module.exports = router;
