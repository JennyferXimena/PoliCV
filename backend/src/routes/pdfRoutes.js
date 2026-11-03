const express =
  require("express");

const {
  generarPDF
} =
  require(
    "../controllers/pdfController"
  );

const {
  verificarToken
} =
  require(
    "../middlewares/authMiddleware"
  );

const {
  verificarRol
} =
  require(
    "../middlewares/roleMiddleware"
  );


const router =
  express.Router();


router.use(
  verificarToken,
  verificarRol("Estudiante")
);


router.get(
  "/:id/pdf",
  generarPDF
);


module.exports =
  router;