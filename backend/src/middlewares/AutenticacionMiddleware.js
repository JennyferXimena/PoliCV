const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion?.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje:"Token de acceso requerido" });
  }

  const token = autorizacion.split(" ")[1];

  try {
    const datosToken = jwt.verify(token, process.env.JWT_SECRET);

    const [filas] = await pool.execute(
      `SELECT u.id_usuario,u.id_rol,u.estado,u.correo_verificado,r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?
       LIMIT 1`,
      [datosToken.id_usuario]
    );

    const usuario = filas[0];

    if (!usuario) {
      return res.status(401).json({ mensaje:"La cuenta ya no existe" });
    }

    if (!usuario.estado) {
      return res.status(403).json({ mensaje:"La cuenta se encuentra desactivada" });
    }

    if (!usuario.correo_verificado) {
      return res.status(403).json({ mensaje:"La cuenta requiere verificación de correo" });
    }

    req.usuario = {
      id_usuario:usuario.id_usuario,
      id_rol:usuario.id_rol,
      rol:usuario.rol
    };

    next();
  } catch {
    return res.status(401).json({ mensaje:"Token inválido o expirado" });
  }
}

module.exports = { verificarToken };