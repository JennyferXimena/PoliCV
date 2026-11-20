const landingCurriculumModel = require("../../models/landingCurriculumModel");
const detalleCurriculumModel = require("../../models/detalleCurriculumModel");

function crearSlug(texto, idCurriculum) {
  const base = String(texto || "curriculum")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 130);

  return `${base || "curriculum"}-${idCurriculum}`;
}

async function obtenerOCrearLanding(
  idCurriculum,
  idUsuario,
  datosCurriculum
) {
  let landing =
    await landingCurriculumModel.obtenerPorCurriculum(
      idCurriculum,
      idUsuario
    );

  if (landing) {
    return landing;
  }

  const slug = crearSlug(
    datosCurriculum.curriculum?.nombre,
    idCurriculum
  );

  await landingCurriculumModel.crear(
    idCurriculum,
    slug
  );

  landing =
    await landingCurriculumModel.obtenerPorCurriculum(
      idCurriculum,
      idUsuario
    );

  return landing;
}

async function obtenerLanding(req, res) {
  try {
    const idCurriculum = Number(req.params.id);
    const idUsuario = req.usuario.id_usuario;

    if (!Number.isInteger(idCurriculum)) {
      return res.status(400).json({
        mensaje: "Currículum inválido"
      });
    }

    const datos =
      await detalleCurriculumModel.obtenerContenidoCompleto(
        idCurriculum,
        idUsuario
      );

    if (!datos) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    const landing =
      await obtenerOCrearLanding(
        idCurriculum,
        idUsuario,
        datos
      );

    return res.status(200).json({
      landing: {
        ...landing,
        publicada: Boolean(landing.publicada)
      },
      datos
    });
  } catch (error) {
    console.error(
      "Error obteniendo Landing Page:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener la Landing Page"
    });
  }
}

async function actualizarLanding(req, res) {
  try {
    const idCurriculum = Number(req.params.id);
    const idUsuario = req.usuario.id_usuario;

    const tema = String(req.body?.tema || "");
    const paleta = String(req.body?.paleta || "");

    const temas = ["claro", "oscuro"];
    const paletas = [
      "verde",
      "azul",
      "amarillo",
      "rosa",
      "morado"
    ];

    if (!temas.includes(tema)) {
      return res.status(400).json({
        mensaje: "Selecciona un tema válido"
      });
    }

    if (!paletas.includes(paleta)) {
      return res.status(400).json({
        mensaje: "Selecciona una paleta válida"
      });
    }

    const datos =
      await detalleCurriculumModel.obtenerContenidoCompleto(
        idCurriculum,
        idUsuario
      );

    if (!datos) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    await obtenerOCrearLanding(
      idCurriculum,
      idUsuario,
      datos
    );

    const landing =
      await landingCurriculumModel.actualizarConfiguracion(
        idCurriculum,
        idUsuario,
        tema,
        paleta
      );

    return res.status(200).json({
      mensaje:
        "Diseño de la Landing Page actualizado",
      landing: {
        ...landing,
        publicada: Boolean(landing.publicada)
      }
    });
  } catch (error) {
    console.error(
      "Error actualizando Landing Page:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar la Landing Page"
    });
  }
}

async function cambiarPublicacion(req, res) {
  try {
    const idCurriculum = Number(req.params.id);
    const idUsuario = req.usuario.id_usuario;
    const publicada = Boolean(req.body?.publicada);

    const datos =
      await detalleCurriculumModel.obtenerContenidoCompleto(
        idCurriculum,
        idUsuario
      );

    if (!datos) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    await obtenerOCrearLanding(
      idCurriculum,
      idUsuario,
      datos
    );

    const landing =
      await landingCurriculumModel.actualizarPublicacion(
        idCurriculum,
        idUsuario,
        publicada
      );

    return res.status(200).json({
      mensaje: publicada
        ? "Landing Page publicada correctamente"
        : "Landing Page despublicada correctamente",
      landing: {
        ...landing,
        publicada: Boolean(landing.publicada)
      }
    });
  } catch (error) {
    console.error(
      "Error cambiando publicación:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo cambiar el estado de publicación"
    });
  }
}

async function obtenerLandingPublica(req, res) {
  try {
    const slug = String(req.params.slug || "").trim();

    const landing =
      await landingCurriculumModel.obtenerPublicaPorSlug(
        slug
      );

    if (!landing) {
      return res.status(404).json({
        mensaje:
          "La Landing Page no existe o no está publicada"
      });
    }

    const datos =
      await detalleCurriculumModel.obtenerContenidoCompleto(
        landing.id_curriculum,
        landing.id_usuario
      );

    if (!datos) {
      return res.status(404).json({
        mensaje:
          "No se pudo obtener el currículum publicado"
      });
    }

    return res.status(200).json({
      landing: {
        ...landing,
        publicada: true
      },
      datos
    });
  } catch (error) {
    console.error(
      "Error obteniendo Landing pública:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener la Landing Page pública"
    });
  }
}

module.exports = {
  obtenerLanding,
  actualizarLanding,
  cambiarPublicacion,
  obtenerLandingPublica
};
