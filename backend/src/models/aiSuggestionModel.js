const pool = require("../config/database");

async function actualizarResumenProfesional(
  idCurriculum,
  idUsuario,
  resumen
) {
  const [resultado] = await pool.execute(
    `UPDATE curriculums
     SET resumen_profesional = ?
     WHERE id_curriculum = ?
       AND id_usuario = ?
       AND estado = 1`,
    [
      resumen,
      idCurriculum,
      idUsuario
    ]
  );

  return resultado.affectedRows;
}

module.exports = {
  actualizarResumenProfesional
};