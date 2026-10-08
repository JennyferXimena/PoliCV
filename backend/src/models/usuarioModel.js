const pool = require("../config/database");

async function buscarPorEmail(email, db = pool) {
  const [rows] = await db.execute(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );

  return rows[0];
}

async function crearUsuario(idRol, email, passwordHash, db = pool) {
  const [resultado] = await db.execute(
    `INSERT INTO usuarios (id_rol, email, password_hash)
     VALUES (?, ?, ?)`,
    [idRol, email, passwordHash]
  );

  return resultado.insertId;
}

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
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.email = ?`,
    [email]
  );

  return rows[0];
}

module.exports = {
  buscarPorEmail,
  buscarPorEmailConRol,
  crearUsuario
};