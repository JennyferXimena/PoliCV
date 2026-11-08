const express = require("express");

const propuestaController =
  require("../controllers/propuestaController");

const {
  verificarToken
} = require("../middlewares/AutenticacionMiddleware");

const {
  verificarRol
} = require("../middlewares/RolMiddleware");

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol("Estudiante"));

router.get(
  "/",
  propuestaController.listarMisPropuestas
);

router.post(
  "/",
  propuestaController.crear
);

module.exports = router;