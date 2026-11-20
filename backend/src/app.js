require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const autenticacionRoutes = require("./routes/estudiante/autenticacionRoutes");
const perfilRoutes = require("./routes/estudiante/perfilRoutes");
const propuestaRoutes = require("./routes/estudiante/propuestaRoutes");
const curriculumRoutes = require("./routes/estudiante/curriculumRoutes");
const iaRoutes = require("./routes/estudiante/iaRoutes");
const configuracionInicialRoutes = require("./routes/estudiante/configuracionInicialRoutes");
const detalleCurriculumRoutes = require("./routes/estudiante/detalleCurriculumRoutes");
const landingCurriculumRoutes = require("./routes/estudiante/landingCurriculumRoutes");
const pdfRoutes = require("./routes/estudiante/pdfRoutes");

const usuarioAdministradorRoutes = require("./routes/administrador/usuarioAdministradorRoutes");
const seccionAdministradorRoutes = require("./routes/administrador/seccionAdministradorRoutes");
const plantillaAdministradorRoutes = require("./routes/administrador/plantillaAdministradorRoutes");
const propuestaAdministradorRoutes = require("./routes/administrador/propuestaAdministradorRoutes");
const estadisticaAdministradorRoutes = require("./routes/administrador/estadisticaAdministradorRoutes");
const perfilAdministradorRoutes = require("./routes/administrador/perfilAdministradorRoutes");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));

app.use("/api/auth",autenticacionRoutes);

app.use("/api/perfil",perfilRoutes);
app.use("/api/configuracion-inicial",configuracionInicialRoutes);
app.use("/api/propuestas",propuestaRoutes);
app.use("/api/curriculums",curriculumRoutes);
app.use("/api/curriculums",detalleCurriculumRoutes);
app.use("/api/curriculums",pdfRoutes);
app.use("/api/ia",iaRoutes);
app.use("/api/landing", landingCurriculumRoutes);

app.use("/api/admin/perfil",perfilAdministradorRoutes);
app.use("/api/admin/usuarios",usuarioAdministradorRoutes);
app.use("/api/admin/secciones",seccionAdministradorRoutes);
app.use("/api/admin/plantillas",plantillaAdministradorRoutes);
app.use("/api/admin/propuestas",propuestaAdministradorRoutes);
app.use("/api/admin/estadisticas",estadisticaAdministradorRoutes);

app.get("/", (req,res) => {
  res.status(200).json({
    nombre:"TalentoESFOT API",
    estado:"Servidor funcionando"
  });
});

app.get("/api/health", (req,res) => {
  res.status(200).json({
    mensaje:"Servidor TalentoESFOT funcionando correctamente"
  });
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await pool.query("SELECT 1");

    console.log("Conexión exitosa con MySQL");

    app.listen(PORT,() => {
      console.log(
        `Servidor TalentoESFOT ejecutándose en http://localhost:${PORT}`
      );
    });
  } catch(error) {
    console.error(
      "Error al conectar con MySQL:",
      error.message
    );

    process.exit(1);
  }
}

iniciarServidor();
