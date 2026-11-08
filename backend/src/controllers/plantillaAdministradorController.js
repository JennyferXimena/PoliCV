const plantillaModel =
  require("../models/plantillaModel");


async function listar(req, res) {
  try {
    const plantillas =
      await plantillaModel.listarPlantillas();

    return res.status(200).json({
      plantillas
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje:
        "Error al obtener las plantillas"
    });
  }
}


async function cambiarEstado(req, res) {
  const idPlantilla =
    Number(req.params.id);

  const {
    estado
  } = req.body || {};


  if (
    !Number.isInteger(idPlantilla)
  ) {
    return res.status(400).json({
      mensaje:
        "Plantilla inválida"
    });
  }


  if (
    typeof estado !== "boolean"
  ) {
    return res.status(400).json({
      mensaje:
        "Estado inválido"
    });
  }


  try {
    const actualizado =
      await plantillaModel
        .actualizarEstadoPlantilla(
          idPlantilla,
          estado
        );


    if (!actualizado) {
      return res.status(404).json({
        mensaje:
          "Plantilla no encontrada"
      });
    }


    return res.status(200).json({
      mensaje:
        estado
          ? "Plantilla activada correctamente"
          : "Plantilla desactivada correctamente"
    });


  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje:
        "Error al cambiar el estado"
    });
  }
}


module.exports = {
  listar,
  cambiarEstado
};