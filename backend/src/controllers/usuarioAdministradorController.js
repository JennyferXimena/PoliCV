const usuarioModel = require("../models/usuarioModel");

async function listarUsuarios(req, res) {
  try {
    const buscar = req.query.buscar || "";

    const usuarios =
      await usuarioModel.listarUsuarios(buscar);

    return res.status(200).json({
      usuarios
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener los usuarios"
    });
  }
}

async function cambiarEstado(req, res) {
  const idUsuario = Number(req.params.id);

  const { estado } = req.body || {};

  if (!Number.isInteger(idUsuario)) {
    return res.status(400).json({
      mensaje: "Usuario inválido"
    });
  }

  if (typeof estado !== "boolean") {
    return res.status(400).json({
      mensaje: "El estado debe ser verdadero o falso"
    });
  }

  // Evitamos que el administrador se desactive a sí mismo.
  if (idUsuario === req.usuario.id_usuario) {
    return res.status(400).json({
      mensaje: "No puede cambiar el estado de su propia cuenta"
    });
  }

  try {
    const actualizado =
      await usuarioModel.actualizarEstadoUsuario(
        idUsuario,
        estado
      );

    if (!actualizado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: estado
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar el usuario"
    });
  }
}

module.exports = {
  listarUsuarios,
  cambiarEstado
};