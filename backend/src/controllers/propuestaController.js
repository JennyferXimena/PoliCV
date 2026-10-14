const propuestaModel =
  require("../models/propuestaModel");

async function crear(req, res) {
  const { titulo, descripcion } = req.body || {};

  if (!titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({
      mensaje: "Título y descripción son obligatorios"
    });
  }

  try {
    const idPropuesta =
      await propuestaModel.crearPropuesta(
        req.usuario.id_usuario,
        titulo.trim(),
        descripcion.trim()
      );

    return res.status(201).json({
      mensaje: "Propuesta enviada correctamente",
      id_propuesta: idPropuesta
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al enviar la propuesta"
    });
  }
}

async function listarMisPropuestas(req, res) {
  try {
    const propuestas =
      await propuestaModel.listarPorUsuario(
        req.usuario.id_usuario
      );

    return res.status(200).json({
      propuestas
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener las propuestas"
    });
  }
}

module.exports = {
  crear,
  listarMisPropuestas
};