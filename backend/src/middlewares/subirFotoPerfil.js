const multer = require("multer");
const path = require("path");
const fs = require("fs");

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    const idUsuario = String(req.usuario.id_usuario);
    const carpeta = path.join(
      __dirname,
      "../../uploads/perfiles",
      idUsuario
    );

    fs.mkdirSync(carpeta, { recursive: true });
    cb(null, carpeta);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(null, `perfil-${Date.now()}${extension}`);
  }
});

const filtro = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const permitidas = [
    ".jpg",
    ".jpeg",
    ".png"
  ];

  if (!permitidas.includes(extension)) {
    return cb(
      new Error(
        "La fotografía debe ser JPG, JPEG o PNG"
      )
    );
  }

  cb(null, true);
};

const subirFotoPerfil = multer({
  storage: almacenamiento,
  fileFilter: filtro,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = subirFotoPerfil;
