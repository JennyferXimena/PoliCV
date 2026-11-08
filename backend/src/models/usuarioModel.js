const pool = require("../config/database");

async function buscarPorEmail(email, db = pool) {
  const [filas] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
  return filas[0];
}

async function buscarPorEmailConRol(email, db = pool) {
  const [filas] = await db.execute(
    `SELECT u.id_usuario,u.id_rol,u.email,u.password_hash,u.estado,u.correo_verificado,r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.email = ?`,
    [email]
  );

  return filas[0];
}

async function crearUsuario(idRol, email, passwordHash, db = pool) {
  const [resultado] = await db.execute(
    `INSERT INTO usuarios (id_rol,email,password_hash) VALUES (?,?,?)`,
    [idRol, email, passwordHash]
  );

  return resultado.insertId;
}

async function guardarVerificacion(idUsuario, tokenHash, fechaExpiracion, db = pool) {
  const [resultado] = await db.execute(
    `UPDATE usuarios
     SET correo_verificado = 0,token_verificacion_hash = ?,token_verificacion_expira = ?,fecha_verificacion = NULL
     WHERE id_usuario = ?`,
    [tokenHash, fechaExpiracion, idUsuario]
  );

  return resultado.affectedRows;
}

async function buscarPorTokenVerificacion(tokenHash, db = pool) {
  const [filas] = await db.execute(
    `SELECT id_usuario,email
     FROM usuarios
     WHERE token_verificacion_hash = ?
     AND correo_verificado = 0
     AND token_verificacion_expira > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  return filas[0];
}

async function marcarCorreoVerificado(idUsuario, db = pool) {
  const [resultado] = await db.execute(
    `UPDATE usuarios
     SET correo_verificado = 1,token_verificacion_hash = NULL,
         token_verificacion_expira = NULL,fecha_verificacion = NOW()
     WHERE id_usuario = ?`,
    [idUsuario]
  );

  return resultado.affectedRows;
}

async function listarUsuarios(buscar = "") {
  const termino = `%${buscar}%`;

  const [filas] = await pool.execute(
    `SELECT u.id_usuario,u.email,u.estado,u.correo_verificado,u.fecha_creacion,
            r.nombre AS rol,p.nombres,p.apellidos
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     LEFT JOIN perfiles p ON u.id_usuario = p.id_usuario
     WHERE u.email LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?
     ORDER BY u.id_usuario DESC`,
    [termino, termino, termino]
  );

  return filas;
}

async function actualizarEstadoUsuario(idUsuario, estado) {
  const [resultado] = await pool.execute(
    "UPDATE usuarios SET estado = ? WHERE id_usuario = ?",
    [estado, idUsuario]
  );

  return resultado.affectedRows;
}

module.exports = {
  buscarPorEmail,
  buscarPorEmailConRol,
  crearUsuario,
  guardarVerificacion,
  buscarPorTokenVerificacion,
  marcarCorreoVerificado,
  listarUsuarios,
  actualizarEstadoUsuario
};