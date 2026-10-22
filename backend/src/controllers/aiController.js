const {
  enviarMensajeIA
} = require("../services/aiService");

const curriculumModel =
  require("../models/curriculumModel");

const detalleCurriculumModel =
  require("../models/detalleCurriculumModel");

const aiSuggestionModel =
  require("../models/aiSuggestionModel");


async function obtenerContextoCV(
  idCurriculum,
  idUsuario
) {
  const curriculum =
    await curriculumModel.obtenerPorId(
      idCurriculum,
      idUsuario
    );

  if (!curriculum) {
    return null;
  }

  const [
    formacion,
    experiencias,
    proyectos,
    habilidades,
    idiomas,
    cursos
  ] = await Promise.all([
    detalleCurriculumModel.listar(
      "formacion",
      idCurriculum
    ),

    detalleCurriculumModel.listar(
      "experiencias",
      idCurriculum
    ),

    detalleCurriculumModel.listar(
      "proyectos",
      idCurriculum
    ),

    detalleCurriculumModel.listar(
      "habilidades",
      idCurriculum
    ),

    detalleCurriculumModel.listar(
      "idiomas",
      idCurriculum
    ),

    detalleCurriculumModel.listar(
      "cursos",
      idCurriculum
    )
  ]);

  const datos = {
    curriculum: {
      nombre:
        curriculum.nombre,

      titulo_profesional:
        curriculum.titulo_profesional,

      resumen_profesional:
        curriculum.resumen_profesional
    },

    formacion_academica:
      formacion,

    experiencia_laboral:
      experiencias,

    proyectos,

    habilidades,

    idiomas,

    cursos_certificaciones:
      cursos
  };

  return {
    curriculum,
    contexto:
      JSON.stringify(
        datos,
        null,
        2
      )
  };
}


async function chatIA(req, res) {
  try {
    const {
      mensaje,
      historial = [],
      id_curriculum
    } = req.body;

    if (
      !mensaje ||
      typeof mensaje !== "string" ||
      !mensaje.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "Debes escribir un mensaje"
      });
    }

    if (!id_curriculum) {
      return res.status(400).json({
        mensaje:
          "Debes seleccionar un currículum"
      });
    }

    const idCurriculum =
      Number(id_curriculum);

    if (!Number.isInteger(idCurriculum)) {
      return res.status(400).json({
        mensaje:
          "Currículum inválido"
      });
    }

    if (
      !Array.isArray(historial) ||
      historial.length > 30
    ) {
      return res.status(400).json({
        mensaje:
          "El historial no es válido"
      });
    }

    const resultado =
      await obtenerContextoCV(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!resultado) {
      return res.status(404).json({
        mensaje:
          "Currículum no encontrado"
      });
    }

    const mensajes = [
      ...historial,
      {
        role: "user",
        content: mensaje.trim()
      }
    ];

    const respuesta =
      await enviarMensajeIA(
        mensajes,
        resultado.contexto
      );

    return res.status(200).json({
      mensaje:
        "Respuesta generada correctamente",

      respuesta
    });

  } catch (error) {
    console.error(
      "Error en chatIA:",
      error
    );

    return res.status(502).json({
      mensaje:
        "No se pudo obtener una respuesta de la IA"
    });
  }
}


async function sugerirResumen(req, res) {
  try {
    const idCurriculum =
      Number(req.params.idCurriculum);

    if (!Number.isInteger(idCurriculum)) {
      return res.status(400).json({
        mensaje:
          "Currículum inválido"
      });
    }

    const resultado =
      await obtenerContextoCV(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!resultado) {
      return res.status(404).json({
        mensaje:
          "Currículum no encontrado"
      });
    }

    const instrucciones = [
      {
        role: "user",
        content: `
Analiza la información de mi currículum.

Genera una propuesta de resumen profesional
de aproximadamente 3 a 5 líneas.

Reglas:
- Utiliza únicamente datos existentes en mi CV.
- No inventes experiencia, tecnologías,
  conocimientos ni habilidades.
- Redacta de manera profesional y clara.
- No escribas explicaciones adicionales.
- No utilices Markdown.
- No escribas títulos.
- Devuelve únicamente el texto del resumen profesional.
        `
      }
    ];

    const sugerencia =
      await enviarMensajeIA(
        instrucciones,
        resultado.contexto
      );

    return res.status(200).json({
      mensaje:
        "Sugerencia generada correctamente",

      sugerencia:
        sugerencia.trim()
    });

  } catch (error) {
    console.error(
      "Error al generar sugerencia:",
      error
    );

    return res.status(502).json({
      mensaje:
        "No se pudo generar la sugerencia"
    });
  }
}


async function aplicarResumen(req, res) {
  try {
    const idCurriculum =
      Number(req.params.idCurriculum);

    const {
      resumen
    } = req.body;

    if (!Number.isInteger(idCurriculum)) {
      return res.status(400).json({
        mensaje:
          "Currículum inválido"
      });
    }

    if (
      !resumen ||
      typeof resumen !== "string" ||
      !resumen.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "La sugerencia es obligatoria"
      });
    }

    if (resumen.length > 2000) {
      return res.status(400).json({
        mensaje:
          "La sugerencia es demasiado extensa"
      });
    }

    const actualizado =
      await aiSuggestionModel
        .actualizarResumenProfesional(
          idCurriculum,
          req.usuario.id_usuario,
          resumen.trim()
        );

    if (!actualizado) {
      return res.status(404).json({
        mensaje:
          "Currículum no encontrado"
      });
    }

    return res.status(200).json({
      mensaje:
        "Sugerencia aplicada correctamente"
    });

  } catch (error) {
    console.error(
      "Error al aplicar sugerencia:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo aplicar la sugerencia"
    });
  }
}


module.exports = {
  chatIA,
  sugerirResumen,
  aplicarResumen
};