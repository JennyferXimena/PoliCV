const curriculumModel =
  require("../models/curriculumModel");

// Crear currículum
async function crear(req, res) {
  const {
    nombre,
    titulo_profesional,
    resumen_profesional,
    id_plantilla
  } = req.body || {};

  if (!nombre?.trim()) {
    return res.status(400).json({
      mensaje: "El nombre del currículum es obligatorio"
    });
  }

  if (
    id_plantilla !== null &&
    id_plantilla !== undefined &&
    !Number.isInteger(Number(id_plantilla))
  ) {
    return res.status(400).json({
      mensaje: "La plantilla seleccionada no es válida"
    });
  }

  try {
    const idCurriculum =
      await curriculumModel.crearCurriculum(
        req.usuario.id_usuario,
        nombre.trim(),
        titulo_profesional?.trim(),
        resumen_profesional?.trim(),
        id_plantilla || null
      );

    return res.status(201).json({
      mensaje: "Currículum creado correctamente",
      id_curriculum: idCurriculum
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al crear el currículum"
    });
  }
}


// Listar currículums del estudiante
async function listar(req, res) {
  try {
    const curriculums =
      await curriculumModel.listarPorUsuario(
        req.usuario.id_usuario
      );

    return res.status(200).json({
      curriculums
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener los currículums"
    });
  }
}


// Obtener un currículum específico
async function obtenerPorId(req, res) {
  const idCurriculum = Number(req.params.id);

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  try {
    const curriculum =
      await curriculumModel.obtenerPorId(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    return res.status(200).json({
      curriculum
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener el currículum"
    });
  }
}


// Actualizar currículum
async function actualizar(req, res) {
  const idCurriculum = Number(req.params.id);

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  const {
    nombre,
    titulo_profesional,
    resumen_profesional,
    id_plantilla
  } = req.body || {};

  if (!nombre?.trim()) {
    return res.status(400).json({
      mensaje: "El nombre del currículum es obligatorio"
    });
  }

  try {
    // Primero comprobamos que pertenezca al estudiante
    const curriculum =
      await curriculumModel.obtenerPorId(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    await curriculumModel.actualizarCurriculum(
      idCurriculum,
      req.usuario.id_usuario,
      {
        nombre: nombre.trim(),
        titulo_profesional:
          titulo_profesional?.trim() || null,

        resumen_profesional:
          resumen_profesional?.trim() || null,

        id_plantilla:
          id_plantilla || null
      }
    );

    return res.status(200).json({
      mensaje: "Currículum actualizado correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar el currículum"
    });
  }
}


// Desactivar currículum
async function eliminar(req, res) {
  const idCurriculum = Number(req.params.id);

  if (!Number.isInteger(idCurriculum)) {
    return res.status(400).json({
      mensaje: "Currículum inválido"
    });
  }

  try {
    const curriculum =
      await curriculumModel.obtenerPorId(
        idCurriculum,
        req.usuario.id_usuario
      );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "Currículum no encontrado"
      });
    }

    await curriculumModel.desactivarCurriculum(
      idCurriculum,
      req.usuario.id_usuario
    );

    return res.status(200).json({
      mensaje: "Currículum eliminado correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al eliminar el currículum"
    });
  }
}


module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  eliminar
};