const curriculumModel =
  require("../models/curriculumModel");

const detalleModel =
  require("../models/detalleCurriculumModel");

async function comprobarCurriculum(
  idCurriculum,
  idUsuario
) {
  return await curriculumModel.obtenerPorId(
    idCurriculum,
    idUsuario
  );
}

function validarDatos(seccion, datos) {
  const config =
    detalleModel.obtenerConfiguracion(seccion);

  if (!config) {
    return "Sección inválida";
  }

  for (const campo of config.obligatorios) {
    if (
      datos[campo] === undefined ||
      datos[campo] === null ||
      String(datos[campo]).trim() === ""
    ) {
      return `El campo ${campo} es obligatorio`;
    }
  }

  return null;
}

async function listar(req, res) {
  const idCurriculum =
    Number(req.params.idCurriculum);

  const { seccion } = req.params;

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  try {
    const curriculum =
      await comprobarCurriculum(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    const datos =
      await detalleModel.listar(
        seccion,
        idCurriculum
      );

    return res.status(200).json({
      datos
    });

  } catch (error) {
    if (error.message === "SECCION_INVALIDA") {
      return res.status(400).json({
        mensaje: "Sección inválida"
      });
    }

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener la información"
    });
  }
}

async function crear(req, res) {
  const idCurriculum =
    Number(req.params.idCurriculum);

  const { seccion } = req.params;

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  const errorValidacion =
    validarDatos(seccion, req.body || {});

  if (errorValidacion) {
    return res.status(400).json({
      mensaje: errorValidacion
    });
  }

  try {
    const curriculum =
      await comprobarCurriculum(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    const id =
      await detalleModel.crear(
        seccion,
        idCurriculum,
        req.body
      );

    return res.status(201).json({
      mensaje: "Información agregada correctamente",
      id
    });

  } catch (error) {
    if (error.message === "SECCION_INVALIDA") {
      return res.status(400).json({
        mensaje: "Sección inválida"
      });
    }

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al guardar la información"
    });
  }
}

async function actualizar(req, res) {
  const idCurriculum =
    Number(req.params.idCurriculum);

  const idItem =
    Number(req.params.idItem);

  const { seccion } = req.params;

  if (
    !Number.isInteger(idCurriculum) ||
    !Number.isInteger(idItem)
  ) {
    return res.status(400).json({
      mensaje: "Identificador inválido"
    });
  }

  const errorValidacion =
    validarDatos(seccion, req.body || {});

  if (errorValidacion) {
    return res.status(400).json({
      mensaje: errorValidacion
    });
  }

  try {
    const curriculum =
      await comprobarCurriculum(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    const actualizado =
      await detalleModel.actualizar(
        seccion,
        idItem,
        idCurriculum,
        req.body
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Registro no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Información actualizada correctamente"
    });

  } catch (error) {
    if (error.message === "SECCION_INVALIDA") {
      return res.status(400).json({
        mensaje: "Sección inválida"
      });
    }

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar la información"
    });
  }
}

async function eliminar(req, res) {
  const idCurriculum =
    Number(req.params.idCurriculum);

  const idItem =
    Number(req.params.idItem);

  const { seccion } = req.params;

  if (
    !Number.isInteger(idCurriculum) ||
    !Number.isInteger(idItem)
  ) {
    return res.status(400).json({
      mensaje: "Identificador inválido"
    });
  }

  try {
    const curriculum =
      await comprobarCurriculum(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    const eliminado =
      await detalleModel.eliminar(
        seccion,
        idItem,
        idCurriculum
      );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Registro no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Información eliminada correctamente"
    });

  } catch (error) {
    if (error.message === "SECCION_INVALIDA") {
      return res.status(400).json({
        mensaje: "Sección inválida"
      });
    }

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al eliminar la información"
    });
  }
}

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar
};
