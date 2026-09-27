// Servidor base real 
require("dotenv").config();

const express = require("express");
const cors = require("cors");

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

app.listen(PORT, () => {
  console.log(`Servidor PoliCV ejecutándose en http://localhost:${PORT}`);
}); 