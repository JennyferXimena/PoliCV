const pool = require("../config/database");

async function listarPlantillas() {
  const [rows] = await pool.execute(
    `SELECT
        id_plantilla,
        nombre,
        codigo,
        descripcion,
        imagen_url,
        estado,
        fecha_creacion,
        fecha_actualizacion
     FROM plantillas
     ORDER BY id_plantilla`
  );

  return rows;
}

async function buscarPorNombreOCodigo(nombre, codigo) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM plantillas
     WHERE nombre = ?
        OR codigo = ?`,
    [nombre, codigo]
  );

  return rows[0];
}

async function crearPlantilla(
  nombre,
  codigo,
  descripcion,
  imagenUrl
) {
  const [resultado] = await pool.execute(
    `INSERT INTO plantillas
      (nombre, codigo, descripcion, imagen_url)
     VALUES (?, ?, ?, ?)`,
    [
      nombre,
      codigo,
      descripcion || null,
      imagenUrl || null
    ]
  );

  return resultado.insertId;
}

async function actualizarPlantilla(
  idPlantilla,
  nombre,
  codigo,
  descripcion,
  imagenUrl
) {
  const [resultado] = await pool.execute(
    `UPDATE plantillas
     SET nombre = ?,
         codigo = ?,
         descripcion = ?,
         imagen_url = ?
     WHERE id_plantilla = ?`,
    [
      nombre,
      codigo,
      descripcion || null,
      imagenUrl || null,
      idPlantilla
    ]
  );

  return resultado.affectedRows;
}

async function actualizarEstadoPlantilla(
  idPlantilla,
  estado
) {
  const [resultado] = await pool.execute(
    `UPDATE plantillas
     SET estado = ?
     WHERE id_plantilla = ?`,
    [estado, idPlantilla]
  );

  return resultado.affectedRows;
}

module.exports = {
  listarPlantillas,
  buscarPorNombreOCodigo,
  crearPlantilla,
  actualizarPlantilla,
  actualizarEstadoPlantilla
};