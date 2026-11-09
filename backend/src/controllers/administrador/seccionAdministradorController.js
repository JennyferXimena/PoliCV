const seccionModel = require("../../models/seccionModel");

async function listarSecciones(req,res) {
  try {
    const secciones = await seccionModel.listarSeccionesCompletas();

    return res.status(200).json({
      total:secciones.length,
      secciones
    });
  } catch(error) {
    console.error("Error al obtener secciones:",error);

    return res.status(500).json({
      mensaje:"No se pudieron obtener las secciones"
    });
  }
}

async function obtenerEstadisticas(req,res) {
  const carrera = req.query.carrera
    ? Number(req.query.carrera)
    : null;

  if (
    carrera !== null &&
    (!Number.isInteger(carrera) || carrera <= 0)
  ) {
    return res.status(400).json({
      mensaje:"Carrera inválida"
    });
  }

  try {
    const estadisticas =
      await seccionModel.obtenerEstadisticasUso(carrera);

    return res.status(200).json(estadisticas);
  } catch(error) {
    console.error("Error al obtener estadísticas de secciones:",error);

    return res.status(500).json({
      mensaje:"No se pudieron obtener las estadísticas de las secciones"
    });
  }
}

module.exports = {
  listarSecciones,
  obtenerEstadisticas
};