const MISTRAL_URL =
  "https://api.mistral.ai/v1/chat/completions";

const SYSTEM_PROMPT = `
Eres el asistente virtual de PoliCV, una plataforma
orientada a estudiantes de la Escuela Politécnica Nacional.

Tu objetivo es ayudar al estudiante a completar,
organizar y mejorar la información de su currículum vitae.

Reglas obligatorias:

- Responde siempre en español.
- Haz preguntas claras, breves y de una en una.
- No inventes información sobre el estudiante.
- No inventes estudios, trabajos, proyectos,
  habilidades, idiomas ni certificaciones.
- Utiliza únicamente la información proporcionada
  por el estudiante o la información existente en su CV.
- Puedes mejorar la redacción para que sea profesional.
- Si falta información, pregunta antes de asumirla.
- No cambies datos importantes sin autorización.
- Cuando propongas una mejora, explica claramente
  cuál sería el texto sugerido.
- El estudiante siempre debe decidir si desea
  aplicar una sugerencia.
- Mantén las respuestas relativamente breves.
- Concéntrate únicamente en currículum,
  formación, experiencia, proyectos,
  habilidades, idiomas, cursos,
  perfil profesional y empleabilidad.
`;

async function enviarMensajeIA(
  historial = [],
  contextoCV = ""
) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error(
      "MISTRAL_API_KEY no está configurada"
    );
  }

  const mensajes = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    }
  ];

  if (contextoCV) {
    mensajes.push({
      role: "system",
      content: `
Esta es la información actualmente registrada
en el currículum del estudiante:

${contextoCV}

Utiliza esta información únicamente como contexto.
No inventes datos que no aparezcan aquí.
      `
    });
  }

  historial.forEach((mensaje) => {
    if (
      mensaje &&
      ["user", "assistant"].includes(mensaje.role) &&
      typeof mensaje.content === "string"
    ) {
      mensajes.push({
        role: mensaje.role,
        content: mensaje.content
      });
    }
  });

  try {
    const respuesta = await fetch(MISTRAL_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${process.env.MISTRAL_API_KEY}`
      },

      body: JSON.stringify({
        model:
          process.env.MISTRAL_MODEL ||
          "ministral-8b-latest",

        messages: mensajes,

        temperature: 0.4,

        max_tokens: 500
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      console.error(
        "Error Mistral:",
        datos
      );

      throw new Error(
        datos.message ||
        "Error al comunicarse con Mistral"
      );
    }

    const contenido =
      datos.choices?.[0]?.message?.content;

    if (!contenido) {
      throw new Error(
        "La IA no devolvió una respuesta"
      );
    }

    return contenido;

  } catch (error) {
    console.error(
      "Error en aiService:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  enviarMensajeIA
};