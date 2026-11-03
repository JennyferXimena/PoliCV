const pool =
  require("../config/database");


async function listarPlantillas() {
  const [rows] =
    await pool.execute(
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
       ORDER BY id_plantilla ASC`
    );

  return rows;
}


async function actualizarEstadoPlantilla(
  idPlantilla,
  estado
) {
  const [resultado] =
    await pool.execute(
      `UPDATE plantillas
       SET estado = ?
       WHERE id_plantilla = ?`,
      [
        estado,
        idPlantilla
      ]
    );

  return resultado.affectedRows;
}


module.exports = {
  listarPlantillas,
  actualizarEstadoPlantilla
};