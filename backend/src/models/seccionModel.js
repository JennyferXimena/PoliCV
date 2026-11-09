const pool = require("../config/database");

async function listarSeccionesCompletas() {
  const [secciones] = await pool.execute(
    `SELECT id_seccion,nombre,descripcion,orden,estado
     FROM secciones_cv
     WHERE estado=TRUE
     ORDER BY orden`
  );

  for (const seccion of secciones) {
    const [subsecciones] = await pool.execute(
      `SELECT id_subseccion,nombre,descripcion,orden
       FROM subsecciones_cv
       WHERE id_seccion=?
       ORDER BY orden`,
      [seccion.id_seccion]
    );

    const [campos] = await pool.execute(
      `SELECT id_campo,nombre,descripcion,tipo_campo,obligatorio,minimo,maximo,orden
       FROM campos_cv
       WHERE id_seccion=? AND id_subseccion IS NULL
       ORDER BY orden`,
      [seccion.id_seccion]
    );

    for (const subseccion of subsecciones) {
      const [camposSubseccion] = await pool.execute(
        `SELECT id_campo,nombre,descripcion,tipo_campo,obligatorio,minimo,maximo,orden
         FROM campos_cv
         WHERE id_subseccion=?
         ORDER BY orden`,
        [subseccion.id_subseccion]
      );

      subseccion.campos = camposSubseccion;
    }

    seccion.campos = campos;
    seccion.subsecciones = subsecciones;
  }

  return secciones;
}

async function listarCarreras() {
  const [filas] = await pool.execute(
    `SELECT id_carrera,nombre
     FROM carreras
     WHERE estado=TRUE
     ORDER BY nombre`
  );

  return filas;
}

async function contarCurriculums(idCarrera = null) {
  let consulta = `
    SELECT COUNT(DISTINCT c.id_curriculum) AS total
    FROM curriculums c
    INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
    WHERE c.estado=TRUE
  `;

  const parametros = [];

  if (idCarrera) {
    consulta += " AND p.id_carrera=?";
    parametros.push(idCarrera);
  }

  const [[fila]] = await pool.execute(consulta,parametros);
  return Number(fila.total || 0);
}

async function contarUsoSeccion(idSeccion,idCarrera = null) {
  const filtroCarrera = idCarrera ? " AND p.id_carrera=?" : "";
  const parametros = idCarrera ? [idCarrera] : [];

  let consulta = "";

  switch (Number(idSeccion)) {
    case 1:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        WHERE c.estado=TRUE
        AND NULLIF(TRIM(p.nombres),'') IS NOT NULL
        AND NULLIF(TRIM(p.apellidos),'') IS NOT NULL
        ${filtroCarrera}
      `;
      break;

    case 12:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        WHERE c.estado=TRUE
        AND NULLIF(TRIM(c.resumen_profesional),'') IS NOT NULL
        ${filtroCarrera}
      `;
      break;

    case 3:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        LEFT JOIN formacion_academica f ON f.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        AND (p.id_carrera IS NOT NULL OR f.id_curriculum IS NOT NULL)
        ${filtroCarrera}
      `;
      break;

    case 9:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN idiomas i ON i.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 8:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN habilidades h ON h.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 7:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN cursos_certificaciones cc ON cc.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 6:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN proyectos pr ON pr.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 5:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN practicas pr ON pr.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 4:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN experiencias_laborales e ON e.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    case 10:
      consulta = `
        SELECT COUNT(DISTINCT c.id_curriculum) AS total
        FROM curriculums c
        INNER JOIN perfiles p ON p.id_usuario=c.id_usuario
        INNER JOIN referencias r ON r.id_curriculum=c.id_curriculum
        WHERE c.estado=TRUE
        ${filtroCarrera}
      `;
      break;

    default:
      return 0;
  }

  const [[fila]] = await pool.execute(consulta,parametros);
  return Number(fila.total || 0);
}

async function obtenerEstadisticasUso(idCarrera = null) {
  const [secciones,carreras] = await Promise.all([
    pool.execute(
      `SELECT id_seccion,nombre,orden
       FROM secciones_cv
       WHERE estado=TRUE
       ORDER BY orden`
    ),
    listarCarreras()
  ]);

  const totalCurriculums = await contarCurriculums(idCarrera);
  const resultado = [];

  for (const seccion of secciones[0]) {
    const utilizados = await contarUsoSeccion(
      seccion.id_seccion,
      idCarrera
    );

    const porcentaje = totalCurriculums
      ? Number(((utilizados / totalCurriculums) * 100).toFixed(1))
      : 0;

    resultado.push({
      id_seccion:seccion.id_seccion,
      nombre:seccion.nombre,
      orden:seccion.orden,
      curriculums:utilizados,
      total_curriculums:totalCurriculums,
      porcentaje
    });
  }

  const ordenadas = [...resultado].sort(
    (a,b) => b.porcentaje - a.porcentaje
  );

  const carrera = idCarrera
    ? carreras.find(
        (item) => Number(item.id_carrera) === Number(idCarrera)
      ) || null
    : null;

  return {
    carrera,
    carreras,
    total_curriculums:totalCurriculums,
    secciones:resultado,
    mayor_uso:ordenadas[0] || null,
    menor_uso:ordenadas[ordenadas.length - 1] || null
  };
}

module.exports = {
  listarSeccionesCompletas,
  listarCarreras,
  obtenerEstadisticasUso
};