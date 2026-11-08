const express = require("express");

const {
  obtenerConfiguracion,
  listarCarreras,
  completarConfiguracion
} = require(
  "../controllers/configuracionInicialController"
);

const {
  verificarToken
} = require(
  "../middlewares/AutenticacionMiddleware"
);

const {
  verificarRol
} = require(
  "../middlewares/RolMiddleware"
);

const router = express.Router();


/* =========================================================
   SOLO ESTUDIANTES AUTENTICADOS
========================================================= */

router.use(
  verificarToken,
  verificarRol("Estudiante")
);


/* =========================================================
   OBTENER CONFIGURACIÓN DEL ESTUDIANTE
========================================================= */

router.get(
  "/",
  obtenerConfiguracion
);


/* =========================================================
   LISTAR CARRERAS
========================================================= */

router.get(
  "/carreras",
  listarCarreras
);


/* =========================================================
   COMPLETAR CONFIGURACIÓN INICIAL
========================================================= */

router.put(
  "/",
  completarConfiguracion
);


module.exports = router;