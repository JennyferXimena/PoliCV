const seccionModel =
  require(
    "../models/seccionModel"
  );


async function listarSecciones(
  req,
  res
) {
  try {
    const secciones =
      await seccionModel
        .listarSeccionesCompletas();

    return res.status(200).json({
      total:
        secciones.length,

      secciones
    });

  } catch (error) {
    console.error(
      "Error al listar secciones:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudieron obtener las secciones"
    });
  }
}


async function cambiarOrden(
  req,
  res
) {
  try {
    const { orden } =
      req.body;


    if (
      !Array.isArray(orden)
    ) {
      return res.status(400).json({
        mensaje:
          "El orden debe ser una lista"
      });
    }


    const idsActuales =
      await seccionModel
        .obtenerIdsSecciones();


    if (
      orden.length !==
      idsActuales.length
    ) {
      return res.status(400).json({
        mensaje:
          "Debe enviar todas las secciones"
      });
    }


    const idsRecibidos =
      orden.map(Number);


    const unicos =
      new Set(
        idsRecibidos
      );


    if (
      unicos.size !==
      idsActuales.length
    ) {
      return res.status(400).json({
        mensaje:
          "No se pueden repetir secciones"
      });
    }


    const contieneTodas =
      idsActuales.every(
        (id) =>
          unicos.has(id)
      );


    if (!contieneTodas) {
      return res.status(400).json({
        mensaje:
          "El orden contiene secciones inválidas"
      });
    }


    await seccionModel
      .actualizarOrden(
        idsRecibidos
      );


    const secciones =
      await seccionModel
        .listarSeccionesCompletas();


    return res.status(200).json({
      mensaje:
        "Orden actualizado correctamente",

      secciones
    });


  } catch (error) {
    console.error(
      "Error al cambiar orden:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el orden"
    });
  }
}


async function listarCarreras(
  req,
  res
) {
  try {
    const carreras =
      await seccionModel
        .listarCarreras();

    return res.status(200).json({
      carreras
    });

  } catch (error) {
    console.error(
      "Error al listar carreras:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudieron obtener las carreras"
    });
  }
}


async function estadisticasPorCarrera(
  req,
  res
) {
  try {
    const idCarrera =
      Number(
        req.query.carrera
      );


    if (
      !Number.isInteger(
        idCarrera
      ) ||
      idCarrera <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona una carrera válida"
      });
    }


    const estadisticas =
      await seccionModel
        .obtenerEstadisticasPorCarrera(
          idCarrera
        );


    if (!estadisticas) {
      return res.status(404).json({
        mensaje:
          "La carrera no existe"
      });
    }


    return res.status(200).json(
      estadisticas
    );


  } catch (error) {
    console.error(
      "Error al consultar estadísticas:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudieron obtener las estadísticas"
    });
  }
}


module.exports = {
  listarSecciones,
  cambiarOrden,
  listarCarreras,
  estadisticasPorCarrera
};