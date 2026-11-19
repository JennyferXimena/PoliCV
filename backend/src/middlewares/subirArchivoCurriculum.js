const multer = require("multer");
const path = require("path");
const fs = require("fs");

const extensionesPermitidas = [".pdf", ".jpg", ".jpeg", ".png", ".apk"];

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    const idCurriculum = String(req.params.id || "").replace(/\D/g, "");
    const carpeta = path.join(__dirname, "../../uploads/curriculums", idCurriculum);

    fs.mkdirSync(carpeta, { recursive: true });
    cb(null, carpeta);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const nombreBase = path
      .basename(file.originalname, extension)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 80);

    cb(null, `${Date.now()}-${nombreBase}${extension}`);
  }
});

const filtroArchivo = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!extensionesPermitidas.includes(extension)) {
    return cb(
      new Error("El archivo debe ser PDF, JPG, JPEG, PNG o APK")
    );
  }

  cb(null, true);
};

const subirArchivoCurriculum = multer({
  storage: almacenamiento,
  fileFilter: filtroArchivo,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = subirArchivoCurriculum;
