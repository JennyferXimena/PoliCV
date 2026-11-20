const detalleCurriculumModel = require("../../models/detalleCurriculumModel");
const { generarPDFGeneral } = require("../../services/pdfService");

function limpiarNombreArchivo(texto) {
  return String(texto || "curriculum")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_");
}

/* =========================================================
   GENERAR PDF DEL CURRÍCULUM
========================================================= */

async function generarPDF(req, res) {
  const idCurriculum =
    Number(req.params.id);

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  try {
    const datos =
      await detalleCurriculumModel.obtenerContenidoCompleto(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!datos) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    if (
      !datos.curriculum?.id_plantilla ||
      !datos.curriculum?.plantilla_codigo
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona una plantilla antes de generar el PDF"
      });
    }

    if (
      Number(datos.curriculum.plantilla_estado) !== 1
    ) {
      return res.status(400).json({
        mensaje:
          "La plantilla seleccionada ya no está disponible. Elige otra plantilla activa."
      });
    }

    const nombrePersona =
      `${datos.perfil?.nombres || ""}_${datos.perfil?.apellidos || ""}`;

    const nombreArchivo =
      limpiarNombreArchivo(
        nombrePersona ||
        datos.curriculum?.nombre
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CV_${nombreArchivo}.pdf"`
    );

    generarPDFGeneral(
      datos,
      res
    );
  } catch (error) {
    console.error(
      "Error al generar PDF:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        mensaje:
          "No se pudo generar el PDF"
      });
    }
  }
}

module.exports = {
  generarPDF
};
