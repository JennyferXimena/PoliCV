const configuracionInicialModel = require("../../models/configuracionInicialModel");

async function obtenerConfiguracion(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const perfil =
      await configuracionInicialModel.obtenerPorUsuario(
        idUsuario
      );

    if (!perfil) {
      return res.status(404).json({
        mensaje:
          "No se encontró el perfil del estudiante"
      });
    }

    return res.status(200).json({
      perfil: {
        ...perfil,
        perfil_completado:
          Boolean(perfil.perfil_completado)
      }
    });
  } catch (error) {
    console.error(
      "Error al obtener configuración inicial:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo obtener la configuración inicial"
    });
  }
}

async function listarCarreras(req, res) {
  try {
    const carreras =
      await configuracionInicialModel.listarCarreras();

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

async function completarConfiguracion(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const {
      nombres,
      apellidos,
      telefono,
      ciudad_pais,
      id_carrera,
      estado_academico,
      titulo_profesional,
      fotografia_url,
      linkedin_url,
      github_url,
      sitio_web
    } = req.body;

    if (
      !nombres?.trim() ||
      !apellidos?.trim() ||
      !telefono?.trim() ||
      !ciudad_pais?.trim() ||
      !id_carrera ||
      !estado_academico ||
      !titulo_profesional?.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "Completa todos los campos obligatorios"
      });
    }

    const idCarrera = Number(id_carrera);

    if (
      !Number.isInteger(idCarrera) ||
      idCarrera <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona una carrera válida"
      });
    }

    const carrera =
      await configuracionInicialModel
        .buscarCarreraPorId(idCarrera);

    if (!carrera) {
      return res.status(400).json({
        mensaje:
          "La carrera seleccionada no es válida"
      });
    }

    const estadosPermitidos = [
      "cursando",
      "graduado"
    ];

    if (
      !estadosPermitidos.includes(
        estado_academico
      )
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona un estado académico válido"
      });
    }

    const telefonoLimpio =
      telefono.trim();

    if (
      telefonoLimpio.length < 7 ||
      telefonoLimpio.length > 20
    ) {
      return res.status(400).json({
        mensaje:
          "Ingresa un número de teléfono válido"
      });
    }

    const tituloLimpio =
      titulo_profesional.trim();

    if (
      tituloLimpio.length < 5 ||
      tituloLimpio.length > 150
    ) {
      return res.status(400).json({
        mensaje:
          "El título profesional debe tener entre 5 y 150 caracteres"
      });
    }

    const perfil =
      await configuracionInicialModel
        .completarConfiguracion(
          idUsuario,
          {
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            telefono: telefonoLimpio,
            ciudad_pais: ciudad_pais.trim(),
            id_carrera: idCarrera,
            estado_academico,
            titulo_profesional:
              tituloLimpio,
            fotografia_url:
              fotografia_url?.trim() || null,
            linkedin_url:
              linkedin_url?.trim() || null,
            github_url:
              github_url?.trim() || null,
            sitio_web:
              sitio_web?.trim() || null
          }
        );

    return res.status(200).json({
      mensaje:
        "Perfil actualizado correctamente",
      perfil: {
        ...perfil,
        perfil_completado:
          Boolean(perfil.perfil_completado)
      }
    });
  } catch (error) {
    console.error(
      "Error al actualizar perfil:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo actualizar el perfil"
    });
  }
}

async function subirFotografia(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    if (!req.file) {
      return res.status(400).json({
        mensaje:
          "Selecciona una fotografía"
      });
    }

    const fotografiaUrl =
      `/uploads/perfiles/${idUsuario}/${req.file.filename}`;

    await configuracionInicialModel
      .actualizarFotografia(
        idUsuario,
        fotografiaUrl
      );

    return res.status(200).json({
      mensaje:
        "Fotografía cargada correctamente",
      fotografia_url:
        fotografiaUrl
    });
  } catch (error) {
    console.error(
      "Error al subir fotografía:",
      error
    );

    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        mensaje:
          "La fotografía no puede superar 5 MB"
      });
    }

    return res.status(500).json({
      mensaje:
        error.message ||
        "No se pudo cargar la fotografía"
    });
  }
}

module.exports = {
  obtenerConfiguracion,
  listarCarreras,
  completarConfiguracion,
  subirFotografia
};
