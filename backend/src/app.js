// Servidor principal
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

// Rutas de autenticación
const rutasAutenticacion = require("./routes/autenticacionRoutes");

// Rutas del estudiante
const rutasPerfil = require("./routes/perfilRoutes");
const rutasPropuestas = require("./routes/propuestaRoutes");
const rutasCurriculum = require("./routes/curriculumRoutes");
const rutasIA = require("./routes/iaRoutes");
const rutasConfiguracionInicial = require("./routes/configuracionInicialRoutes");
const rutasDetalleCurriculum = require("./routes/detalleCurriculumRoutes");
const rutasPDF = require("./routes/pdfRoutes");

// Rutas del administrador
const rutasUsuariosAdministrador = require("./routes/usuarioAdministradorRoutes");
const rutasSeccionesAdministrador = require("./routes/seccionAdministradorRoutes");
const rutasPlantillasAdministrador = require("./routes/plantillaAdministradorRoutes");
const rutasPropuestasAdministrador = require("./routes/propuestaAdministradorRoutes");
const rutasEstadisticasAdministrador = require("./routes/estadisticaAdministradorRoutes");

const app = express();

/* =========================
   MIDDLEWARES GENERALES
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   AUTENTICACIÓN
========================= */

app.use("/api/auth", rutasAutenticacion);

/* =========================
   ESTUDIANTE
========================= */

app.use("/api/perfil", rutasPerfil);

app.use(
  "/api/configuracion-inicial",
  rutasConfiguracionInicial
);

app.use("/api/propuestas", rutasPropuestas);

app.use("/api/curriculums", rutasCurriculum);
app.use("/api/curriculums", rutasDetalleCurriculum);
app.use("/api/curriculums", rutasPDF);

app.use("/api/ia", rutasIA);

/* =========================
   ADMINISTRADOR
========================= */

app.use(
  "/api/admin/usuarios",
  rutasUsuariosAdministrador
);

app.use(
  "/api/admin/secciones",
  rutasSeccionesAdministrador
);

app.use(
  "/api/admin/plantillas",
  rutasPlantillasAdministrador
);

app.use(
  "/api/admin/propuestas",
  rutasPropuestasAdministrador
);

app.use(
  "/api/admin/estadisticas",
  rutasEstadisticasAdministrador
);

/* =========================
   RUTAS GENERALES
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    nombre: "TalentoESFOT API",
    estado: "Servidor funcionando"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    mensaje: "Servidor TalentoESFOT funcionando correctamente"
  });
});

/* =========================
   INICIAR SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await pool.query("SELECT 1");

    console.log("Conexión exitosa con MySQL");

    app.listen(PORT, () => {
      console.log(
        `Servidor TalentoESFOT ejecutándose en http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Error al conectar con MySQL:",
      error.message
    );

    process.exit(1);
  }
}

iniciarServidor();