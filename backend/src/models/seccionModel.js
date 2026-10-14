const pool = require("../config/database");

async function listarSecciones() {
  const [rows] = await pool.execute(
    `SELECT
        id_seccion,
        nombre,
        descripcion,
        estado,
        fecha_creacion,
        fecha_actualizacion
     FROM secciones_cv
     ORDER BY id_seccion`
  );

  return rows;
}

async function buscarPorNombre(nombre) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM secciones_cv
     WHERE nombre = ?`,
    [nombre]
  );

  return rows[0];
}

async function crearSeccion(nombre, descripcion) {
  const [resultado] = await pool.execute(
    `INSERT INTO secciones_cv
      (nombre, descripcion)
     VALUES (?, ?)`,
    [nombre, descripcion || null]
  );

  return resultado.insertId;
}

async function actualizarSeccion(
  idSeccion,
  nombre,
  descripcion
) {
  const [resultado] = await pool.execute(
    `UPDATE secciones_cv
     SET nombre = ?,
         descripcion = ?
     WHERE id_seccion = ?`,
    [
      nombre,
      descripcion || null,
      idSeccion
    ]
  );

  return resultado.affectedRows;
}

async function actualizarEstadoSeccion(
  idSeccion,
  estado
) {
  const [resultado] = await pool.execute(
    `UPDATE secciones_cv
     SET estado = ?
     WHERE id_seccion = ?`,
    [estado, idSeccion]
  );

  return resultado.affectedRows;
}

module.exports = {
  listarSecciones,
  buscarPorNombre,
  crearSeccion,
  actualizarSeccion,
  actualizarEstadoSeccion
};