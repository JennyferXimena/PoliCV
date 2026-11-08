const express =
  require("express");

const {
  listarSecciones,
  cambiarOrden,
  listarCarreras,
  estadisticasPorCarrera
} =
  require(
    "../controllers/seccionAdministradorController"
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