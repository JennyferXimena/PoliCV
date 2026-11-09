const estadisticaModel = require("../../models/estadisticaModel");

async function obtenerResumen(req,res) {
  try {
    const estadisticas = await estadisticaModel.obtenerResumen();
    return res.status(200).json({ estadisticas });
  } catch(error) {
    console.error("Error al obtener estadísticas:",error);
    return res.status(500).json({
      mensaje:"Error al obtener las estadísticas"
    });
  }
}

async function obtenerCurriculums(req,res) {
  try {
    const estadisticas =
      await estadisticaModel.obtenerEstadisticasCurriculums();

    return res.status(200).json({ estadisticas });
  } catch(error) {
    console.error("Error al obtener estadísticas de currículums:",error);
    return res.status(500).json({
      mensaje:"Error al obtener las estadísticas de currículums"
    });
  }
}

module.exports = {
  obtenerResumen,
  obtenerCurriculums
};