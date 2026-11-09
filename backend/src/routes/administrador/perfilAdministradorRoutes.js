const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controlador = require("../../controllers/administrador/perfilAdministradorController");
const { verificarToken } = require("../../middlewares/AutenticacionMiddleware");
const { verificarRol } = require("../../middlewares/RolMiddleware");

const router = express.Router();
const carpeta = path.join(__dirname,"../../../uploads/perfiles");

if (!fs.existsSync(carpeta)) {
  fs.mkdirSync(carpeta,{ recursive:true });
}

const almacenamiento = multer.diskStorage({
  destination:(req,file,cb) => cb(null,carpeta),
  filename:(req,file,cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null,`admin-${req.usuario.id_usuario}-${Date.now()}${extension}`);
  }
});

const subir = multer({
  storage:almacenamiento,
  limits:{ fileSize:5 * 1024 * 1024 },
  fileFilter:(req,file,cb) => {
    const permitidos = ["image/jpeg","image/png"];

    if (!permitidos.includes(file.mimetype)) {
      return cb(new Error("Solo se permiten imágenes JPG, JPEG o PNG"));
    }

    cb(null,true);
  }
});

function subirFotografia(req,res,next) {
  subir.single("fotografia")(req,res,(error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensaje:"La fotografía no puede superar 5 MB"
      });
    }

    return res.status(400).json({
      mensaje:error.message || "No se pudo subir la fotografía"
    });
  });
}

router.use(verificarToken,verificarRol("Administrador"));

router.get("/",controlador.obtener);
router.put("/",controlador.actualizar);
router.post("/fotografia",subirFotografia,controlador.actualizarFotografia);

module.exports = router;