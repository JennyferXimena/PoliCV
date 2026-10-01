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

module.exports = {
  buscarPorEmail,
  crearUsuario
};