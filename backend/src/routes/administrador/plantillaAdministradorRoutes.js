const express = require("express");
const controlador = require("../../controllers/administrador/plantillaAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken,verificarRol("Administrador"));

router.get("/",controlador.listar);
router.patch("/:id/estado",controlador.cambiarEstado);

module.exports = router;