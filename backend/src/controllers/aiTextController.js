const {
  enviarMensajeIA
} = require("../services/aiService");


const TIPOS_PERMITIDOS = [
  "experiencia",
  "practica",
  "proyecto",
  "general"
];


async function mejorarTexto(req, res) {
  try {
    const {
      texto,
      tipo = "general"
    } = req.body;

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

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      return res.status(400).json({
        mensaje:
          "Tipo de texto no válido"
      });
    }

    if (texto.length > 4000) {
      return res.status(400).json({
        mensaje:
          "El texto es demasiado extenso"
      });
    }

    const contextoTipo = {
      experiencia:
        "una experiencia laboral",

      practica:
        "una práctica o pasantía",

      proyecto:
        "un proyecto académico o profesional",

      general:
        "una sección de un currículum"
    };

    const mensajes = [
      {
        role: "user",

        content: `
El estudiante escribió informalmente la descripción de
${contextoTipo[tipo]}.

Texto original:

"${texto.trim()}"

Tu tarea es únicamente mejorar la redacción del texto
sin modificar los hechos expresados por el estudiante.

Reglas obligatorias:

- Corrige errores ortográficos y gramaticales.
- Comprende expresiones informales.
- Organiza las ideas con claridad.
- Utiliza lenguaje profesional pero natural.
- Conserva exactamente el significado original.
- No agregues ninguna actividad que no aparezca
  explícitamente en el texto.
- No inventes responsabilidades.
- No inventes logros.
- No inventes tecnologías.
- No inventes herramientas.
- No inventes experiencia.
- No inventes resultados obtenidos.
- No exageres el nivel de responsabilidad.
- No conviertas "ayudé" en "lideré".
- No conviertas "arreglé errores" en
  "optimicé el sistema".
- No agregues palabras como liderazgo,
  optimización, arquitectura, coordinación,
  implementación o gestión si el estudiante
  no expresó esa actividad.
- Puedes cambiar "arreglaba errores" por
  "realicé corrección de errores", porque
  conserva exactamente el mismo hecho.
- Puedes cambiar "conecté una API" por
  "realicé la integración de una API".
- Mantén una redacción apropiada para un
  estudiante o profesional junior.
- Si una frase no puede mejorarse sin añadir
  información, conserva su significado original.
- Devuelve únicamente el texto mejorado.
- No utilices Markdown.
- No escribas explicaciones adicionales.
        `
      }
    ];

    const textoMejorado =
      await enviarMensajeIA(
        mensajes
      );

    return res.status(200).json({
      mensaje:
        "Texto mejorado correctamente",

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