const pool = require("../config/database");

async function contarActivosPorUsuario(idUsuario) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM curriculums
     WHERE id_usuario = ?
       AND estado = TRUE`,
    [idUsuario]
  );

  return Number(rows[0].total || 0);
}

async function existeNombreActivo(
  idUsuario,
  nombre,
  idCurriculumExcluir = null
) {
  let consulta = `SELECT id_curriculum
                  FROM curriculums
                  WHERE id_usuario = ?
                    AND estado = TRUE
                    AND LOWER(TRIM(nombre)) = LOWER(?)`;
  const parametros = [idUsuario, nombre.trim()];

  if (idCurriculumExcluir !== null) {
    consulta += " AND id_curriculum <> ?";
    parametros.push(idCurriculumExcluir);
  }

  consulta += " LIMIT 1";

  const [rows] = await pool.execute(consulta, parametros);
  return Boolean(rows[0]);
}

async function crearCurriculum(
  idUsuario,
  nombre,
  tituloProfesional,
  resumenProfesional,
  idPlantilla
) {
  const [resultado] = await pool.execute(
    `INSERT INTO curriculums
      (
        id_usuario,
        id_plantilla,
        nombre,
        titulo_profesional,
        resumen_profesional
      )
     VALUES (?, ?, ?, ?, ?)`,
    [
      idUsuario,
      idPlantilla || null,
      nombre,
      tituloProfesional || null,
      resumenProfesional || null
    ]
  );

  return resultado.insertId;
}

async function listarPorUsuario(idUsuario) {
  const [rows] = await pool.execute(
    `SELECT
        c.id_curriculum,
        c.id_plantilla,
        c.nombre,
        c.titulo_profesional,
        c.resumen_profesional,
        c.estado,
        c.fecha_creacion,
        c.fecha_actualizacion,
        p.nombre AS plantilla,
        p.codigo AS codigo_plantilla,
        p.estado AS estado_plantilla
     FROM curriculums c
     LEFT JOIN plantillas p
       ON c.id_plantilla = p.id_plantilla
     WHERE c.id_usuario = ?
       AND c.estado = TRUE
     ORDER BY c.fecha_actualizacion DESC`,
    [idUsuario]
  );

  return rows;
}

async function obtenerPorId(idCurriculum, idUsuario) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM curriculums
     WHERE id_curriculum = ?
       AND id_usuario = ?
       AND estado = TRUE`,
    [idCurriculum, idUsuario]
  );

  return rows[0];
}

async function actualizarCurriculum(
  idCurriculum,
  idUsuario,
  datos
) {
  const {
    nombre,
    titulo_profesional,
    resumen_profesional,
    id_plantilla
  } = datos;

  const [resultado] = await pool.execute(
    `UPDATE curriculums
     SET nombre = ?,
         titulo_profesional = ?,
         resumen_profesional = ?,
         id_plantilla = ?
     WHERE id_curriculum = ?
       AND id_usuario = ?
       AND estado = TRUE`,
    [
      nombre,
      titulo_profesional || null,
      resumen_profesional || null,
      id_plantilla || null,
      idCurriculum,
      idUsuario
    ]
  );

  return resultado.affectedRows;
}

async function desactivarCurriculum(
  idCurriculum,
  idUsuario
) {
  const [resultado] = await pool.execute(
    `UPDATE curriculums
     SET estado = FALSE
     WHERE id_curriculum = ?
       AND id_usuario = ?
       AND estado = TRUE`,
    [idCurriculum, idUsuario]
  );

  return resultado.affectedRows;
}

async function listarPlantillasActivas() {
  const [rows] = await pool.execute(
    `SELECT id_plantilla,nombre,codigo,descripcion,imagen_url,estado
     FROM plantillas
     WHERE estado = TRUE
     ORDER BY id_plantilla`
  );

  return rows;
}

async function obtenerPlantillaActiva(idPlantilla) {
  const [rows] = await pool.execute(
    `SELECT id_plantilla,nombre,codigo
     FROM plantillas
     WHERE id_plantilla = ?
       AND estado = TRUE
     LIMIT 1`,
    [idPlantilla]
  );

  return rows[0];
}

module.exports = {
  contarActivosPorUsuario,
  existeNombreActivo,
  crearCurriculum,
  listarPorUsuario,
  obtenerPorId,
  actualizarCurriculum,
  desactivarCurriculum,
  listarPlantillasActivas,
  obtenerPlantillaActiva
};
