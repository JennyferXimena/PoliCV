const pool = require("../config/database");

async function crearPropuesta(idUsuario, titulo, descripcion) {
  const [resultado] = await pool.execute(
    `INSERT INTO propuestas_mejora
      (id_usuario, titulo, descripcion)
     VALUES (?, ?, ?)`,
    [idUsuario, titulo, descripcion]
  );

  return resultado.insertId;
}

async function listarPorUsuario(idUsuario) {
  const [rows] = await pool.execute(
    `SELECT
        id_propuesta,
        titulo,
        descripcion,
        estado,
        respuesta_admin,
        fecha_creacion,
        fecha_actualizacion
     FROM propuestas_mejora
     WHERE id_usuario = ?
     ORDER BY fecha_creacion DESC`,
    [idUsuario]
  );

  return rows;
}

async function listarTodas() {
  const [rows] = await pool.execute(
    `SELECT
        pm.id_propuesta,
        pm.titulo,
        pm.descripcion,
        pm.estado,
        pm.respuesta_admin,
        pm.fecha_creacion,
        u.email,
        p.nombres,
        p.apellidos
     FROM propuestas_mejora pm
     INNER JOIN usuarios u
        ON pm.id_usuario = u.id_usuario
     LEFT JOIN perfiles p
        ON u.id_usuario = p.id_usuario
     ORDER BY pm.fecha_creacion DESC`
  );

  return rows;
}

async function actualizarEstado(
  idPropuesta,
  estado,
  respuestaAdmin
) {
  const [resultado] = await pool.execute(
    `UPDATE propuestas_mejora
     SET estado = ?,
         respuesta_admin = ?
     WHERE id_propuesta = ?`,
    [
      estado,
      respuestaAdmin || null,
      idPropuesta
    ]
  );

  return resultado.affectedRows;
}

module.exports = {
  crearPropuesta,
  listarPorUsuario,
  listarTodas,
  actualizarEstado
};