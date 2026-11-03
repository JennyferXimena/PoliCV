const express =
  require("express");

const {
  listarSecciones,
  cambiarOrden,
  listarCarreras,
  estadisticasPorCarrera
} =
  require(
    "../controllers/adminSeccionController"
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
  verificarRol(
    "Administrador"
  )
);


router.get(
  "/",
  listarSecciones
);


router.put(
  "/orden",
  cambiarOrden
);


router.get(
  "/carreras",
  listarCarreras
);


router.get(
  "/estadisticas",
  estadisticasPorCarrera
);


module.exports =
  router;