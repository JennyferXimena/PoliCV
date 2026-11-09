const pool = require("../config/database");

async function obtenerResumen() {
  const [[usuarios]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            SUM(estado=TRUE) AS activos,
            SUM(estado=FALSE) AS inactivos,
            SUM(correo_verificado=TRUE) AS verificados,
            SUM(correo_verificado=FALSE) AS no_verificados
     FROM usuarios`
  );

  const [[curriculums]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            COUNT(DISTINCT id_usuario) AS estudiantes
     FROM curriculums
     WHERE estado=TRUE`
  );

  const [[secciones]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            SUM(estado=TRUE) AS activas
     FROM secciones_cv`
  );

  const [[plantillas]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            SUM(estado=TRUE) AS activas
     FROM plantillas`
  );

  const [[propuestas]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            SUM(estado='pendiente') AS pendientes,
            SUM(estado='en_revision') AS revision,
            SUM(estado='aceptada') AS aceptadas,
            SUM(estado='rechazada') AS rechazadas
     FROM propuestas_mejora`
  );

  return {
    usuarios:{
      total:Number(usuarios.total || 0),
      activos:Number(usuarios.activos || 0),
      inactivos:Number(usuarios.inactivos || 0),
      verificados:Number(usuarios.verificados || 0),
      no_verificados:Number(usuarios.no_verificados || 0)
    },
    curriculums:{
      total:Number(curriculums.total || 0),
      estudiantes:Number(curriculums.estudiantes || 0)
    },
    secciones:{
      total:Number(secciones.total || 0),
      activas:Number(secciones.activas || 0)
    },
    plantillas:{
      total:Number(plantillas.total || 0),
      activas:Number(plantillas.activas || 0)
    },
    propuestas:{
      total:Number(propuestas.total || 0),
      pendientes:Number(propuestas.pendientes || 0),
      revision:Number(propuestas.revision || 0),
      aceptadas:Number(propuestas.aceptadas || 0),
      rechazadas:Number(propuestas.rechazadas || 0)
    }
  };
}

async function obtenerEstadisticasCurriculums() {
  const [[resumen]] = await pool.execute(
    `SELECT COUNT(*) AS total,
            COUNT(DISTINCT id_usuario) AS estudiantes
     FROM curriculums`
  );

  const [porCarrera] = await pool.execute(
    `SELECT ca.id_carrera,ca.nombre AS carrera,
            COUNT(DISTINCT c.id_curriculum) AS curriculums,
            COUNT(DISTINCT c.id_usuario) AS estudiantes
     FROM carreras ca
     LEFT JOIN perfiles p ON p.id_carrera=ca.id_carrera
     LEFT JOIN curriculums c ON c.id_usuario=p.id_usuario
     WHERE ca.estado=TRUE
     GROUP BY ca.id_carrera,ca.nombre
     ORDER BY curriculums DESC,ca.nombre`
  );

  const [porPlantilla] = await pool.execute(
    `SELECT p.id_plantilla,p.nombre AS plantilla,
            COUNT(DISTINCT c.id_curriculum) AS curriculums
     FROM plantillas p
     LEFT JOIN curriculums c ON c.id_plantilla=p.id_plantilla
     GROUP BY p.id_plantilla,p.nombre
     ORDER BY curriculums DESC,p.nombre`
  );

  const total = Number(resumen.total || 0);
  const estudiantes = Number(resumen.estudiantes || 0);

  return {
    total,
    estudiantes,
    promedio_por_estudiante:estudiantes
      ? Number((total / estudiantes).toFixed(1))
      : 0,
    por_carrera:porCarrera.map((item) => ({
      ...item,
      curriculums:Number(item.curriculums || 0),
      estudiantes:Number(item.estudiantes || 0)
    })),
    por_plantilla:porPlantilla.map((item) => ({
      ...item,
      curriculums:Number(item.curriculums || 0)
    }))
  };
}

module.exports = { obtenerResumen, obtenerEstadisticasCurriculums };