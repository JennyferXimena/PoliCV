const estadisticaModel =
  require("../models/estadisticaModel");

async function obtenerResumen(req, res) {
  try {
    const estadisticas =
      await estadisticaModel.obtenerResumen();

    return res.status(200).json({
      estadisticas
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener las estadísticas"
    });
  }
}

module.exports = {
  obtenerResumen
};