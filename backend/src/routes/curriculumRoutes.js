const express = require("express");

const curriculumController =
  require("../controllers/curriculumController");

const {
  verificarToken
} = require("../middlewares/authMiddleware");

const {
  verificarRol
} = require("../middlewares/roleMiddleware");

const detalleCurriculumController =
  require("../controllers/detalleCurriculumController");

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

router.get(
  "/:idCurriculum/secciones/:seccion",
  detalleCurriculumController.listar
);

router.post(
  "/:idCurriculum/secciones/:seccion",
  detalleCurriculumController.crear
);

router.put(
  "/:idCurriculum/secciones/:seccion/:idItem",
  detalleCurriculumController.actualizar
);

router.delete(
  "/:idCurriculum/secciones/:seccion/:idItem",
  detalleCurriculumController.eliminar
);

module.exports = router;