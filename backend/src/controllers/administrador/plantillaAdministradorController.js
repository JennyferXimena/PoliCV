const plantillaModel = require("../../models/plantillaModel");

const normalizar = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase();

async function listar(req,res) {
  try {
    const resultado = await plantillaModel.listarPlantillas();

    return res.status(200).json(resultado);
  } catch(error) {
    console.error("Error al obtener plantillas:",error);

    return res.status(500).json({
      mensaje:"Error al obtener las plantillas"
    });
  }
}

async function cambiarEstado(req,res) {
  const idPlantilla = Number(req.params.id);
  const { estado } = req.body || {};

  if (!Number.isInteger(idPlantilla) || idPlantilla <= 0) {
    return res.status(400).json({
      mensaje:"Plantilla inválida"
    });
  }

  if (typeof estado !== "boolean") {
    return res.status(400).json({
      mensaje:"Estado inválido"
    });
  }

  try {
    const plantilla =
      await plantillaModel.buscarPlantillaPorId(idPlantilla);

    if (!plantilla) {
      return res.status(404).json({
        mensaje:"Plantilla no encontrada"
      });
    }

    const clasica =
      normalizar(plantilla.codigo) === "clasica" ||
      normalizar(plantilla.nombre) === "clasica";

    if (clasica && !estado) {
      return res.status(400).json({
        mensaje:"La plantilla Clásica es la plantilla base y debe permanecer activa"
      });
    }

    if (Boolean(plantilla.estado) === estado) {
      return res.status(200).json({
        mensaje:estado
          ? "La plantilla ya está activa"
          : "La plantilla ya está inactiva"
      });
    }

    await plantillaModel.actualizarEstadoPlantilla(
      idPlantilla,
      estado
    );

    return res.status(200).json({
      mensaje:estado
        ? "Plantilla activada correctamente"
        : "Plantilla desactivada correctamente"
    });
  } catch(error) {
    console.error("Error al cambiar plantilla:",error);

    return res.status(500).json({
      mensaje:"Error al cambiar el estado de la plantilla"
    });
  }
}

module.exports = {
  listar,
  cambiarEstado
};