const express = require("express");

const curriculumController =
  require("../controllers/curriculumController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const {
  verificarRol
} = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol("Estudiante"));

router.get(
  "/",
  curriculumController.listar
);

router.post(
  "/",
  curriculumController.crear
);

router.get(
  "/:id",
  curriculumController.obtenerPorId
);

router.put(
  "/:id",
  curriculumController.actualizar
);

router.delete(
  "/:id",
  curriculumController.eliminar
);

module.exports = router;