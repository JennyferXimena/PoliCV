const pool = require("../config/database");

async function crearPerfil(idUsuario, db = pool) {
  await db.execute(
    "INSERT INTO perfiles (id_usuario) VALUES (?)",
    [idUsuario]
  );
}


async function obtenerPorUsuario(idUsuario) {
  const [rows] = await pool.execute(
    `SELECT
        p.id_perfil,
        p.id_usuario,
        u.email,
        p.nombres,
        p.apellidos,
        p.telefono,
        p.direccion,
        p.fotografia_url,
        p.linkedin_url,
        p.github_url,
        p.sitio_web
     FROM perfiles p
     INNER JOIN usuarios u
        ON p.id_usuario = u.id_usuario
     WHERE p.id_usuario = ?`,
    [idUsuario]
  );

  return rows[0];
}

async function actualizarPerfil(idUsuario, datos) {
  const {
    nombres,
    apellidos,
    telefono,
    direccion,
    fotografia_url,
    linkedin_url,
    github_url,
    sitio_web
  } = datos;

  await pool.execute(
    `UPDATE perfiles
     SET nombres = ?,
         apellidos = ?,
         telefono = ?,
         direccion = ?,
         fotografia_url = ?,
         linkedin_url = ?,
         github_url = ?,
         sitio_web = ?
     WHERE id_usuario = ?`,
    [
      nombres || null,
      apellidos || null,
      telefono || null,
      direccion || null,
      fotografia_url || null,
      linkedin_url || null,
      github_url || null,
      sitio_web || null,
      idUsuario
    ]
  );
}

module.exports = {
  crearPerfil,
  obtenerPorUsuario,
  actualizarPerfil
};