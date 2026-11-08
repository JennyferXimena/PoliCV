const curriculumModel =
  require("../models/curriculumModel");

const {
  enviarMensajeIA
} = require("../services/aiService");


/* =========================================================
   GENERAR DESCRIPCIÓN PROFESIONAL DESDE BORRADOR
========================================================= */

async function generarResumenBorrador(
  req,
  res
) {
  try {
    const {
      titulo_profesional,

      formacion = [],
      experiencias = [],
      proyectos = [],
      practicas = [],
      habilidades = [],
      idiomas = [],
      cursos = []
    } = req.body || {};


    /* =====================================================
       VALIDACIÓN
    ===================================================== */

    if (
      !titulo_profesional ||
      !titulo_profesional.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "El título o perfil profesional es obligatorio"
      });
    }


    /* =====================================================
       CONTEXTO REAL PROPORCIONADO POR EL ESTUDIANTE
    ===================================================== */

    const contexto = JSON.stringify(
      {
        titulo_profesional:
          titulo_profesional.trim(),

        formacion,
        experiencias,
        proyectos,
        practicas,
        habilidades,
        idiomas,
        cursos
      },
      null,
      2
    );


    /* =====================================================
       PROMPT
    ===================================================== */

    const mensajes = [
      {
        role: "user",

        content: `
Estoy creando mi currículum vitae.

Utiliza únicamente la información proporcionada
para redactar una descripción personal o profesional
de entre 40 y 120 palabras.

Reglas obligatorias:

- Corrige errores ortográficos.
- Corrige errores gramaticales.
- Comprende expresiones informales.
- Organiza las ideas de manera clara.
- Utiliza un tono profesional pero natural.
- Mantén una redacción apropiada para un estudiante,
  recién graduado o profesional junior.

- No inventes información.
- No inventes experiencia laboral.
- No inventes prácticas.
- No inventes estudios.
- No inventes proyectos.
- No inventes habilidades.
- No inventes tecnologías.
- No inventes idiomas.
- No inventes certificaciones.
- No inventes logros.
- No inventes porcentajes ni resultados.

- No exageres las responsabilidades.
- No conviertas participación en liderazgo.
- No conviertas apoyo en gestión.
- No agregues conocimientos que no aparezcan
  en los datos proporcionados.

- Si existe poca información, redacta una
  descripción más sencilla en lugar de inventar.

- Devuelve únicamente la descripción profesional.
- No utilices Markdown.
- No escribas títulos.
- No incluyas explicaciones adicionales.
        `
      }
    ];


    /* =====================================================
       CONSULTAR IA
    ===================================================== */

    const resumen =
      await enviarMensajeIA(
        mensajes,
        contexto
      );


    if (
      !resumen ||
      typeof resumen !== "string"
    ) {
      return res.status(502).json({
        mensaje:
          "La IA no devolvió una descripción válida"
      });
    }


    return res.status(200).json({
      mensaje:
        "Descripción generada correctamente",

      resumen:
        resumen.trim()
    });


  } catch (error) {
    console.error(
      "Error al generar descripción profesional:",
      error
    );


    return res.status(502).json({
      mensaje:
        "No se pudo generar la descripción con IA"
    });
  }
}


/* =========================================================
   CREAR CURRÍCULUM BASE DESDE EL ASISTENTE
========================================================= */

async function crearCVDesdeIA(
  req,
  res
) {
  try {
    const {
      nombre,
      titulo_profesional,
      resumen_profesional
    } = req.body || {};


    /* =====================================================
       VALIDAR NOMBRE
    ===================================================== */

    if (
      !nombre ||
      !nombre.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "El nombre del currículum es obligatorio"
      });
    }


    /* =====================================================
       CREAR ÚNICAMENTE EL CURRÍCULUM PRINCIPAL

       Las 10 secciones NO se guardan aquí.

       Después se utilizarán los mismos endpoints
       de contenido-fijo que utiliza Mis currículums.
    ===================================================== */

    const idCurriculum =
      await curriculumModel.crearCurriculum(
        req.usuario.id_usuario,

        nombre.trim(),

        titulo_profesional
          ?.trim() || null,

        resumen_profesional
          ?.trim() || null,

        null
      );


    return res.status(201).json({
      mensaje:
        "Currículum iniciado correctamente desde el asistente",

      id_curriculum:
        idCurriculum,

      siguiente_paso:
        "Completar las secciones del currículum"
    });


  } catch (error) {
    console.error(
      "Error al iniciar CV desde IA:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudo iniciar el currículum"
    });
  }
}


module.exports = {
  generarResumenBorrador,
  crearCVDesdeIA
};