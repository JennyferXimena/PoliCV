const pool = require("../config/database");

// Buscar usuario por correo
async function buscarPorEmail(email, db = pool) {
  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );

  return rows[0];
}

// Buscar usuario por correo incluyendo su rol
async function buscarPorEmailConRol(email, db = pool) {
  const [rows] = await db.execute(
    `SELECT
        u.id_usuario,
        u.id_rol,
        u.email,
        u.password_hash,
        u.estado,
        r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r
        ON u.id_rol = r.id_rol
     WHERE u.email = ?`,
    [email]
  );

  return rows[0];
}

// Crear usuario
async function crearUsuario(idRol, email, passwordHash, db = pool) {
  const [resultado] = await db.execute(
    `INSERT INTO usuarios
      (id_rol, email, password_hash)
     VALUES (?, ?, ?)`,
    [idRol, email, passwordHash]
  );

  return resultado.insertId;
}

// Listar y buscar usuarios
async function listarUsuarios(buscar = "") {
  const termino = `%${buscar}%`;

  const [rows] = await pool.execute(
    `SELECT
        u.id_usuario,
        u.email,
        u.estado,
        u.fecha_creacion,
        r.nombre AS rol,
        p.nombres,
        p.apellidos
     FROM usuarios u
     INNER JOIN roles r
        ON u.id_rol = r.id_rol
     LEFT JOIN perfiles p
        ON u.id_usuario = p.id_usuario
     WHERE u.email LIKE ?
        OR p.nombres LIKE ?
        OR p.apellidos LIKE ?
     ORDER BY u.id_usuario DESC`,
    [termino, termino, termino]
  );

  return rows;
}

// Activar o desactivar usuario
async function actualizarEstadoUsuario(idUsuario, estado) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET estado = ?
     WHERE id_usuario = ?`,
    [estado, idUsuario]
  );

  return resultado.affectedRows;
}

module.exports = {
  buscarPorEmail,
  buscarPorEmailConRol,
  crearUsuario,
  listarUsuarios,
  actualizarEstadoUsuario
};