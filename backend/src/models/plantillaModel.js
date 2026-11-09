const pool = require("../config/database");

async function listarPlantillas() {
  const [plantillas] = await pool.execute(
    `SELECT id_plantilla,nombre,codigo,descripcion,imagen_url,estado,
            fecha_creacion,fecha_actualizacion
     FROM plantillas
     ORDER BY id_plantilla`
  );

  const [[total]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM curriculums
     WHERE estado=TRUE`
  );

  const totalCurriculums = Number(total.total || 0);

  for (const plantilla of plantillas) {
    const [[uso]] = await pool.execute(
      `SELECT COUNT(DISTINCT id_curriculum) AS curriculums,
              COUNT(DISTINCT id_usuario) AS estudiantes
       FROM curriculums
       WHERE estado=TRUE AND id_plantilla=?`,
      [plantilla.id_plantilla]
    );

    const [porCarrera] = await pool.execute(
      `SELECT ca.id_carrera,ca.nombre AS carrera,
              COUNT(DISTINCT c.id_curriculum) AS curriculums,
              COUNT(DISTINCT c.id_usuario) AS estudiantes
       FROM curriculums c
       INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
       INNER JOIN carreras ca ON ca.id_carrera=p.id_carrera
       WHERE c.estado=TRUE AND c.id_plantilla=?
       GROUP BY ca.id_carrera,ca.nombre
       ORDER BY curriculums DESC,ca.nombre`,
      [plantilla.id_plantilla]
    );

    const curriculums = Number(uso.curriculums || 0);

    plantilla.estadisticas = {
      curriculums,
      estudiantes:Number(uso.estudiantes || 0),
      porcentaje:totalCurriculums
        ? Number(((curriculums / totalCurriculums) * 100).toFixed(1))
        : 0,
      por_carrera:porCarrera.map((item) => ({
        ...item,
        curriculums:Number(item.curriculums || 0),
        estudiantes:Number(item.estudiantes || 0)
      }))
    };
  }

  return {
    total_curriculums:totalCurriculums,
    plantillas
  };
}

async function buscarPlantillaPorId(idPlantilla) {
  const [filas] = await pool.execute(
    `SELECT id_plantilla,nombre,codigo,estado
     FROM plantillas
     WHERE id_plantilla=?`,
    [idPlantilla]
  );

  return filas[0];
}

async function actualizarEstadoPlantilla(idPlantilla,estado) {
  const [resultado] = await pool.execute(
    `UPDATE plantillas SET estado=? WHERE id_plantilla=?`,
    [estado,idPlantilla]
  );

  return resultado.affectedRows;
}

module.exports = {
  listarPlantillas,
  buscarPlantillaPorId,
  actualizarEstadoPlantilla
};