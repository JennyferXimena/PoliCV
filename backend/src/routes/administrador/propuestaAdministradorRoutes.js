const express = require("express");
const controlador = require("../../controllers/administrador/propuestaAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken, verificarRol("Administrador"));
router.get("/", controlador.listar);
router.patch("/:id", controlador.actualizar);

module.exports = router;