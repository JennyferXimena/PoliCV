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
      mensaje: "Error al obtener las plantillas"
    });
  }
}

async function crear(req, res) {
  const {
    nombre,
    codigo,
    descripcion,
    imagen_url
  } = req.body || {};

  if (!nombre?.trim() || !codigo?.trim()) {
    return res.status(400).json({
      mensaje: "Nombre y código son obligatorios"
    });
  }

  const codigoNormalizado = codigo
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  try {
    const existente =
      await plantillaModel.buscarPorNombreOCodigo(
        nombre.trim(),
        codigoNormalizado
      );

    if (existente) {
      return res.status(409).json({
        mensaje:
          "Ya existe una plantilla con ese nombre o código"
      });
    }

    const idPlantilla =
      await plantillaModel.crearPlantilla(
        nombre.trim(),
        codigoNormalizado,
        descripcion?.trim(),
        imagen_url?.trim()
      );

    return res.status(201).json({
      mensaje: "Plantilla creada correctamente",
      id_plantilla: idPlantilla
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al crear la plantilla"
    });
  }
}

async function actualizar(req, res) {
  const idPlantilla = Number(req.params.id);

  const {
    nombre,
    codigo,
    descripcion,
    imagen_url
  } = req.body || {};

  if (!Number.isInteger(idPlantilla)) {
    return res.status(400).json({
      mensaje: "Plantilla inválida"
    });
  }

  if (!nombre?.trim() || !codigo?.trim()) {
    return res.status(400).json({
      mensaje: "Nombre y código son obligatorios"
    });
  }

  const codigoNormalizado = codigo
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  try {
    const actualizado =
      await plantillaModel.actualizarPlantilla(
        idPlantilla,
        nombre.trim(),
        codigoNormalizado,
        descripcion?.trim(),
        imagen_url?.trim()
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Plantilla no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Plantilla actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje:
          "Ya existe una plantilla con ese nombre o código"
      });
    }

    return res.status(500).json({
      mensaje: "Error al actualizar la plantilla"
    });
  }
}

async function cambiarEstado(req, res) {
  const idPlantilla = Number(req.params.id);
  const { estado } = req.body || {};

  if (!Number.isInteger(idPlantilla)) {
    return res.status(400).json({
      mensaje: "Plantilla inválida"
    });
  }

  if (typeof estado !== "boolean") {
    return res.status(400).json({
      mensaje: "Estado inválido"
    });
  }

  try {
    const actualizado =
      await plantillaModel.actualizarEstadoPlantilla(
        idPlantilla,
        estado
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Plantilla no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: estado
        ? "Plantilla activada correctamente"
        : "Plantilla desactivada correctamente"
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