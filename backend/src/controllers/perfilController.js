const perfilModel = require("../models/perfilModel");

async function obtenerPerfil(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    const perfil = await perfilModel.obtenerPorUsuario(idUsuario);

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado"
      });
    }

    return res.status(200).json({
      perfil
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener el perfil"
    });
  }
}

async function actualizarPerfil(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;

    await perfilModel.actualizarPerfil(
      idUsuario,
      req.body
    );

    const perfilActualizado =
      await perfilModel.obtenerPorUsuario(idUsuario);

    return res.status(200).json({
      mensaje: "Perfil actualizado correctamente",
      perfil: perfilActualizado
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al actualizar el perfil"
    });
  }
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil
};