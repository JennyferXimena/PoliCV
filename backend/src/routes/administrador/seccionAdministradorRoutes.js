const express = require("express");
const controlador = require("../../controllers/administrador/seccionAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken,verificarRol("Administrador"));

router.get("/",controlador.listarSecciones);
router.get("/estadisticas",controlador.obtenerEstadisticas);

module.exports = router;