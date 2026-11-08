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
    "../middlewares/AutenticacionMiddleware"
  );

const {
  verificarRol
} =
  require(
    "../middlewares/RolMiddleware"
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