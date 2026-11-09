const express = require("express");
const controlador = require("../../controllers/administrador/estadisticaAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken,verificarRol("Administrador"));

router.get("/",controlador.obtenerResumen);
router.get("/curriculums",controlador.obtenerCurriculums);

module.exports = router;