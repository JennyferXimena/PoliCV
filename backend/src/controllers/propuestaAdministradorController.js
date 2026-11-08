const propuestaModel =
  require("../models/propuestaModel");

const ESTADOS_VALIDOS = [
  "pendiente",
  "en_revision",
  "aceptada",
  "rechazada"
];

async function listar(req, res) {
  try {
    const propuestas =
      await propuestaModel.listarTodas();

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

async function actualizar(req, res) {
  const idPropuesta = Number(req.params.id);

  const {
    estado,
    respuesta_admin
  } = req.body || {};

  if (!Number.isInteger(idPropuesta)) {
    return res.status(400).json({
      mensaje: "Propuesta inválida"
    });
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      mensaje: "Estado inválido"
    });
  }

  try {
    const actualizado =
      await propuestaModel.actualizarEstado(
        idPropuesta,
        estado,
        respuesta_admin?.trim()
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Propuesta no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Propuesta actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar la propuesta"
    });
  }
}

module.exports = {
  listar,
  actualizar
};