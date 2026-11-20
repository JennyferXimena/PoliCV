const pool = require("../config/database");

async function obtenerPorUsuario(idUsuario) {
  const [rows] = await pool.query(
    `
      SELECT
        p.id_perfil,
        p.id_usuario,
        p.id_carrera,
        p.nombres,
        p.apellidos,
        p.telefono,
        p.direccion,
        p.ciudad_pais,
        p.estado_academico,
        p.titulo_profesional,
        p.fotografia_url,
        p.linkedin_url,
        p.github_url,
        p.sitio_web,
        p.perfil_completado,
        u.email,
        c.nombre AS carrera
      FROM perfiles p
      INNER JOIN usuarios u
        ON u.id_usuario = p.id_usuario
      LEFT JOIN carreras c
        ON c.id_carrera = p.id_carrera
      WHERE p.id_usuario = ?
      LIMIT 1
    `,
    [idUsuario]
  );

  return rows[0] || null;
}

async function listarCarreras() {
  const [rows] = await pool.query(
    `
      SELECT
        id_carrera,
        nombre,
        descripcion
      FROM carreras
      WHERE estado = TRUE
      ORDER BY nombre ASC
    `
  );

  return rows;
}

async function buscarCarreraPorId(idCarrera) {
  const [rows] = await pool.query(
    `
      SELECT
        id_carrera,
        nombre
      FROM carreras
      WHERE id_carrera = ?
        AND estado = TRUE
      LIMIT 1
    `,
    [idCarrera]
  );

  return rows[0] || null;
}

async function completarConfiguracion(idUsuario, datos) {
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
  } = datos;

  await pool.query(
    `
      UPDATE perfiles
      SET
        nombres = ?,
        apellidos = ?,
        telefono = ?,
        ciudad_pais = ?,
        id_carrera = ?,
        estado_academico = ?,
        titulo_profesional = ?,
        fotografia_url = ?,
        linkedin_url = ?,
        github_url = ?,
        sitio_web = ?,
        perfil_completado = TRUE
      WHERE id_usuario = ?
    `,
    [
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
      sitio_web,
      idUsuario
    ]
  );

  return obtenerPorUsuario(idUsuario);
}

async function actualizarFotografia(
  idUsuario,
  fotografiaUrl
) {
  await pool.query(
    `
      UPDATE perfiles
      SET fotografia_url = ?
      WHERE id_usuario = ?
    `,
    [fotografiaUrl, idUsuario]
  );

  return obtenerPorUsuario(idUsuario);
}

module.exports = {
  obtenerPorUsuario,
  listarCarreras,
  buscarCarreraPorId,
  completarConfiguracion,
  actualizarFotografia
};
