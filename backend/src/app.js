// Servidor base real 
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database"); 
const authRoutes = require("./routes/authRoutes"); 
const perfilRoutes = require("./routes/perfilRoutes");
const adminUsuarioRoutes = require("./routes/adminUsuarioRoutes");
const app = express();
const adminSeccionRoutes = require("./routes/adminSeccionRoutes");
const adminPlantillaRoutes = require("./routes/adminPlantillaRoutes");
const propuestaRoutes = require("./routes/propuestaRoutes");
const adminPropuestaRoutes = require("./routes/adminPropuestaRoutes");
const adminEstadisticaRoutes = require("./routes/adminEstadisticaRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Middlewares generales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/admin/usuarios", adminUsuarioRoutes);
app.use("/api/admin/secciones",adminSeccionRoutes);
app.use("/api/admin/plantillas",adminPlantillaRoutes);
app.use("/api/propuestas",propuestaRoutes);
app.use("/api/admin/propuestas",adminPropuestaRoutes);
app.use("/api/admin/estadisticas",adminEstadisticaRoutes);
app.use("/api/curriculums",curriculumRoutes);
app.use("/api/ia", aiRoutes);

// Rutas principales 
app.get("/", (req, res) => {
  res.status(200).json({
    nombre: "PoliCV API",
    estado: "Servidor funcionando"
  });
});

// Rutas de comprobacion 
app.get("/api/health", (req, res) => {
  res.status(200).json({
    mensaje: "Servidor PoliCV funcionando correctamente"
  });
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor(){
  try{
    await pool.query("SELECT 1");
    console.log("Conexion exitosa con MySQL");
    app.listen(PORT, () => {
      console.log(
        `Servidor PoliCV ejecutandose en http://localhost:${PORT}` 
      );
    });
  } catch (error){
    console.error("Error al conectar con MySQL:", error.message);
    process.exit(1);
  }
}

iniciarServidor(); 