const seccionModel =
  require("../models/seccionModel");

async function listar(req, res) {
  try {
    const secciones =
      await seccionModel.listarSecciones();

    return res.status(200).json({
      secciones
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener las secciones"
    });
  }
}

async function crear(req, res) {
  const { nombre, descripcion } = req.body || {};

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      mensaje: "El nombre de la sección es obligatorio"
    });
  }

  try {
    const existente =
      await seccionModel.buscarPorNombre(
        nombre.trim()
      );

    if (existente) {
      return res.status(409).json({
        mensaje: "Ya existe una sección con ese nombre"
      });
    }

    const idSeccion =
      await seccionModel.crearSeccion(
        nombre.trim(),
        descripcion?.trim()
      );

    return res.status(201).json({
      mensaje: "Sección creada correctamente",
      id_seccion: idSeccion
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al crear la sección"
    });
  }
}

async function actualizar(req, res) {
  const idSeccion = Number(req.params.id);

  const { nombre, descripcion } = req.body || {};

  if (!Number.isInteger(idSeccion)) {
    return res.status(400).json({
      mensaje: "Sección inválida"
    });
  }

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      mensaje: "El nombre es obligatorio"
    });
  }

  try {
    const actualizado =
      await seccionModel.actualizarSeccion(
        idSeccion,
        nombre.trim(),
        descripcion?.trim()
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Sección no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Sección actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar la sección"
    });
  }
}

async function cambiarEstado(req, res) {
  const idSeccion = Number(req.params.id);
  const { estado } = req.body || {};

  if (!Number.isInteger(idSeccion)) {
    return res.status(400).json({
      mensaje: "Sección inválida"
    });
  }

  if (typeof estado !== "boolean") {
    return res.status(400).json({
      mensaje: "Estado inválido"
    });
  }

  try {
    const actualizado =
      await seccionModel.actualizarEstadoSeccion(
        idSeccion,
        estado
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Sección no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: estado
        ? "Sección activada correctamente"
        : "Sección desactivada correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al cambiar el estado"
    });
  }
}

module.exports = {
  listar,
  crear,
  actualizar,
  cambiarEstado
};