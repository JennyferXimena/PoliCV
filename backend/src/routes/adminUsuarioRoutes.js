const express = require("express");

const adminUsuarioController =
  require("../controllers/adminUsuarioController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const {
  verificarRol
} = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol("Administrador"));

router.get(
  "/",
  adminUsuarioController.listarUsuarios
);

router.patch(
  "/:id/estado",
  adminUsuarioController.cambiarEstado
);

module.exports = router;