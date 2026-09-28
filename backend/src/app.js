// Servidor base real 
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database"); 

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    nombre: "PoliCV API",
    estado: "Servidor funcionando"
  });
});

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