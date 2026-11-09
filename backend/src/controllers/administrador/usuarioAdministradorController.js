const usuarioModel = require("../../models/usuarioModel");

const ROLES_VALIDOS = ["Estudiante","Administrador"];

async function listarUsuarios(req, res) {
  const buscar = String(req.query.buscar || "").trim();
  const estado = String(req.query.estado || "");
  const verificacion = String(req.query.verificacion || "");
  const rol = String(req.query.rol || "");
  const carrera = req.query.carrera ? Number(req.query.carrera) : null;

  if (buscar.length > 100) {
    return res.status(400).json({ mensaje:"La búsqueda es demasiado larga" });
  }

  if (estado && !["activo","inactivo"].includes(estado)) {
    return res.status(400).json({ mensaje:"Filtro de estado inválido" });
  }

  if (verificacion && !["verificado","pendiente"].includes(verificacion)) {
    return res.status(400).json({ mensaje:"Filtro de verificación inválido" });
  }

  if (rol && !ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ mensaje:"Filtro de rol inválido" });
  }

  if (carrera !== null && (!Number.isInteger(carrera) || carrera <= 0)) {
    return res.status(400).json({ mensaje:"Carrera inválida" });
  }

  try {
    const filtros = {
      buscar,
      estado:estado ? estado === "activo" : undefined,
      verificado:verificacion ? verificacion === "verificado" : undefined,
      rol:rol || undefined,
      idCarrera:carrera || undefined
    };

    const [usuarios,resumen,carreras] = await Promise.all([
      usuarioModel.listarUsuarios(filtros),
      usuarioModel.obtenerResumenUsuarios(),
      usuarioModel.listarCarrerasUsuarios()
    ]);

    return res.status(200).json({
      usuarios,
      resumen,
      carreras,
      total_filtrados:usuarios.length
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ mensaje:"Error al obtener los usuarios" });
  }
}

async function cambiarEstado(req, res) {
  const idUsuario = Number(req.params.id);
  const { estado } = req.body || {};

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    return res.status(400).json({ mensaje:"Usuario inválido" });
  }

  if (typeof estado !== "boolean") {
    return res.status(400).json({ mensaje:"El estado debe ser verdadero o falso" });
  }

  if (idUsuario === req.usuario.id_usuario) {
    return res.status(400).json({ mensaje:"No puedes desactivar tu propia cuenta" });
  }

  try {
    const usuario = await usuarioModel.buscarUsuarioPorId(idUsuario);

    if (!usuario) {
      return res.status(404).json({ mensaje:"Usuario no encontrado" });
    }

    if (Boolean(usuario.estado) === estado) {
      return res.status(200).json({
        mensaje:estado ? "La cuenta ya se encuentra activa" : "La cuenta ya se encuentra inactiva"
      });
    }

    if (!estado && usuario.rol === "Administrador") {
      const administradoresActivos = await usuarioModel.contarAdministradoresActivos();

      if (administradoresActivos <= 1) {
        return res.status(400).json({
          mensaje:"No se puede desactivar el último administrador activo"
        });
      }
    }

    await usuarioModel.actualizarEstadoUsuario(idUsuario,estado);

    return res.status(200).json({
      mensaje:estado ? "Usuario activado correctamente" : "Usuario desactivado correctamente"
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return res.status(500).json({ mensaje:"Error al actualizar el usuario" });
  }
}

module.exports = { listarUsuarios,cambiarEstado }; 