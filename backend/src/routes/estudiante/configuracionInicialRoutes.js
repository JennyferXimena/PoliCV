const express = require("express");
const { obtenerConfiguracion, listarCarreras, completarConfiguracion, subirFotografia } = require("../../controllers/estudiante/configuracionInicialController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");
const subirFotoPerfil = require("../../middlewares/subirFotoPerfil");

const router = express.Router();

router.use(
  verificarToken,
  verificarRol("Estudiante")
);

router.get("/", obtenerConfiguracion);
router.get("/carreras", listarCarreras);

router.post(
  "/fotografia",
  subirFotoPerfil.single("fotografia"),
  subirFotografia
);

router.put("/", completarConfiguracion);

module.exports = router;
