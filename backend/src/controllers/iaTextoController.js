const {
  enviarMensajeIA
} = require("../services/aiService");


/* =========================================================
   TIPOS DE TEXTO QUE LA IA PUEDE MEJORAR
========================================================= */

const TIPOS_PERMITIDOS = [
  "perfil_profesional",
  "formacion",
  "experiencia",
  "practica",
  "logro_practica",
  "proyecto",
  "general"
];


/* =========================================================
   CONTEXTO SEGÚN LA SECCIÓN
========================================================= */

const CONTEXTOS = {
  perfil_profesional:
    "una descripción personal o profesional para un currículum",

  formacion:
    "una descripción de logros o actividades académicas",

  experiencia:
    "una experiencia laboral",

  practica:
    "una práctica o pasantía",

  logro_practica:
    "un logro o aprendizaje obtenido durante una práctica",

  proyecto:
    "un proyecto académico, personal o profesional",

  general:
    "una sección de un currículum"
};


/* =========================================================
   MEJORAR TEXTO
========================================================= */

async function mejorarTexto(
  req,
  res
) {
  try {
    const {
      texto,
      tipo = "general"
    } = req.body;


    /* =====================================================
       VALIDAR TEXTO
    ===================================================== */

    if (
      !texto ||
      typeof texto !== "string" ||
      !texto.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "Debes escribir un texto para mejorar"
      });
    }


    /* =====================================================
       VALIDAR TIPO
    ===================================================== */

    if (
      !TIPOS_PERMITIDOS.includes(
        tipo
      )
    ) {
      return res.status(400).json({
        mensaje:
          "Tipo de texto no válido"
      });
    }


    /* =====================================================
       LONGITUD MÁXIMA
    ===================================================== */

    if (
      texto.trim().length >
      4000
    ) {
      return res.status(400).json({
        mensaje:
          "El texto es demasiado extenso"
      });
    }


    /* =====================================================
       CONTEXTO
    ===================================================== */

    const contexto =
      CONTEXTOS[tipo];


    /* =====================================================
       REGLAS ESPECIALES
    ===================================================== */

    let reglasEspeciales = "";


    if (
      tipo ===
      "perfil_profesional"
    ) {
      reglasEspeciales = `
- El resultado debe ser apropiado para una descripción
  profesional de un estudiante o recién graduado.
- Intenta mantener el texto entre 40 y 120 palabras.
- No agregues conocimientos, experiencia, tecnologías,
  cargos ni habilidades que el estudiante no haya escrito.
      `;
    }


    if (
      tipo ===
      "experiencia"
    ) {
      reglasEspeciales = `
- Redacta las funciones y actividades de forma profesional.
- Puedes comenzar frases con verbos de acción únicamente
  cuando reflejen exactamente lo escrito por el estudiante.
- No conviertas apoyo o colaboración en liderazgo.
- No inventes resultados cuantificables.
      `;
    }


    if (
      tipo ===
      "practica"
    ) {
      reglasEspeciales = `
- Mantén una redacción apropiada para una práctica
  comunitaria, preprofesional o laboral.
- No conviertas actividades de aprendizaje o apoyo en
  responsabilidades de un empleado permanente.
      `;
    }


    if (
      tipo ===
      "logro_practica"
    ) {
      reglasEspeciales = `
- Mejora únicamente la forma de expresar el aprendizaje
  o logro indicado por el estudiante.
- No agregues porcentajes, métricas o resultados que
  no aparezcan en el texto original.
      `;
    }


    if (
      tipo ===
      "proyecto"
    ) {
      reglasEspeciales = `
- La redacción debe explicar claramente qué se realizó,
  cómo se realizó y cuál fue el propósito del proyecto,
  únicamente cuando esos datos aparezcan en el texto.
- No inventes tecnologías, herramientas, usuarios,
  resultados ni impacto.
      `;
    }


    if (
      tipo ===
      "formacion"
    ) {
      reglasEspeciales = `
- Limítate a mejorar actividades, logros o participación
  académica expresados por el estudiante.
- No inventes reconocimientos, promedios, premios,
  proyectos o certificaciones.
      `;
    }


    /* =====================================================
       PROMPT
    ===================================================== */

    const mensajes = [
      {
        role: "user",

        content: `
El estudiante escribió informalmente el contenido de
${contexto}.

Texto original:

"${texto.trim()}"

Tu tarea es mejorar únicamente la redacción del texto
sin modificar los hechos expresados por el estudiante.

Reglas obligatorias:

- Corrige errores ortográficos.
- Corrige errores gramaticales.
- Interpreta errores comunes de escritura.
- Comprende expresiones informales.
- Organiza las ideas con claridad.
- Utiliza lenguaje profesional pero natural.
- Mantén una redacción apropiada para un estudiante
  o profesional junior.
- Conserva exactamente el significado original.
- No agregues ninguna actividad que no aparezca
  explícitamente en el texto.
- No inventes responsabilidades.
- No inventes logros.
- No inventes conocimientos.
- No inventes tecnologías.
- No inventes herramientas.
- No inventes experiencia.
- No inventes resultados obtenidos.
- No inventes porcentajes ni métricas.
- No exageres el nivel de responsabilidad.
- No conviertas "ayudé" en "lideré".
- No conviertas "participé" en "dirigí".
- No conviertas "arreglé errores" en
  "optimicé el sistema".
- No conviertas "apoyé" en "gestioné".
- No agregues palabras como liderazgo,
  coordinación, arquitectura, optimización,
  administración o gestión si el estudiante
  no expresó esa actividad.
- Puedes cambiar "arreglaba errores" por
  "realicé corrección de errores".
- Puedes cambiar "conecté una API" por
  "realicé la integración de una API".
- Puedes corregir palabras mal escritas aunque
  sea necesario interpretar el error ortográfico.
- Si una oración es ambigua, utiliza únicamente
  la interpretación más cercana a lo escrito.
- Si no puedes mejorar una frase sin inventar
  información, conserva su significado original.

${reglasEspeciales}

Formato de respuesta:

- Devuelve únicamente el texto mejorado.
- No utilices Markdown.
- No coloques títulos.
- No coloques viñetas adicionales.
- No expliques los cambios realizados.
        `
      }
    ];


    /* =====================================================
       CONSULTAR IA
    ===================================================== */

    const textoMejorado =
      await enviarMensajeIA(
        mensajes
      );


    if (
      !textoMejorado ||
      typeof textoMejorado !==
        "string"
    ) {
      return res.status(502).json({
        mensaje:
          "La IA no devolvió una respuesta válida"
      });
    }


    /* =====================================================
       RESPUESTA
    ===================================================== */

    return res.status(200).json({
      mensaje:
        "Texto mejorado correctamente",

      tipo,

      original:
        texto.trim(),

      sugerencia:
        textoMejorado.trim()
    });


  } catch (error) {
    console.error(
      "Error al mejorar texto:",
      error
    );


    return res.status(502).json({
      mensaje:
        "No se pudo mejorar el texto con IA"
    });
  }
}


module.exports = {
  mejorarTexto
};