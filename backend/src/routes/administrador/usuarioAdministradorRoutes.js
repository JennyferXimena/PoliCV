const express = require("express");
const controlador = require("../../controllers/administrador/usuarioAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken, verificarRol("Administrador"));
router.get("/", controlador.listarUsuarios);
router.patch("/:id/estado", controlador.cambiarEstado);

module.exports = router;