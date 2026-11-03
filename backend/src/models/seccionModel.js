const pool = require("../config/database");


async function listarSeccionesCompletas() {
  const [secciones] = await pool.query(`
    SELECT
      id_seccion,
      nombre,
      descripcion,
      orden
    FROM secciones_cv
    WHERE estado = TRUE
    ORDER BY orden ASC
  `);

  for (const seccion of secciones) {
    const [subsecciones] =
      await pool.query(
        `
        SELECT
          id_subseccion,
          nombre,
          descripcion,
          orden
        FROM subsecciones_cv
        WHERE id_seccion = ?
        ORDER BY orden ASC
        `,
        [seccion.id_seccion]
      );

    const [camposDirectos] =
      await pool.query(
        `
        SELECT
          id_campo,
          nombre,
          descripcion,
          tipo_campo,
          obligatorio,
          minimo,
          maximo,
          orden
        FROM campos_cv
        WHERE id_seccion = ?
        AND id_subseccion IS NULL
        ORDER BY orden ASC
        `,
        [seccion.id_seccion]
      );

    for (const subseccion of subsecciones) {
      const [campos] =
        await pool.query(
          `
          SELECT
            id_campo,
            nombre,
            descripcion,
            tipo_campo,
            obligatorio,
            minimo,
            maximo,
            orden
          FROM campos_cv
          WHERE id_subseccion = ?
          ORDER BY orden ASC
          `,
          [subseccion.id_subseccion]
        );

      subseccion.campos = campos;
    }

    seccion.subsecciones =
      subsecciones;

    seccion.campos =
      camposDirectos;
  }

  return secciones;
}


async function actualizarOrden(
  orden
) {
  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (
      let i = 0;
      i < orden.length;
      i += 1
    ) {
      await connection.query(
        `
        UPDATE secciones_cv
        SET orden = ?
        WHERE id_seccion = ?
        `,
        [
          i + 1,
          orden[i]
        ]
      );
    }

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
}


async function obtenerIdsSecciones() {
  const [rows] =
    await pool.query(`
      SELECT id_seccion
      FROM secciones_cv
      WHERE estado = TRUE
      ORDER BY orden
    `);

  return rows.map(
    (item) =>
      Number(item.id_seccion)
  );
}


async function listarCarreras() {
  const [rows] =
    await pool.query(`
      SELECT
        id_carrera,
        nombre,
        descripcion
      FROM carreras
      WHERE estado = TRUE
      ORDER BY nombre
    `);

  return rows;
}


async function obtenerEstadisticasPorCarrera(
  idCarrera
) {
  const [[carrera]] =
    await pool.query(
      `
      SELECT
        id_carrera,
        nombre
      FROM carreras
      WHERE id_carrera = ?
      AND estado = TRUE
      `,
      [idCarrera]
    );

  if (!carrera) {
    return null;
  }


  const [[totalRow]] =
    await pool.query(
      `
      SELECT
        COUNT(DISTINCT u.id_usuario)
          AS total_estudiantes
      FROM usuarios u
      INNER JOIN roles r
        ON r.id_rol = u.id_rol
      INNER JOIN perfiles p
        ON p.id_usuario = u.id_usuario
      WHERE r.nombre = 'Estudiante'
      AND u.estado = TRUE
      AND p.id_carrera = ?
      `,
      [idCarrera]
    );


  const totalEstudiantes =
    Number(
      totalRow.total_estudiantes
    ) || 0;


  const [secciones] =
    await pool.query(`
      SELECT
        id_seccion,
        nombre,
        orden
      FROM secciones_cv
      WHERE estado = TRUE
      ORDER BY orden
    `);


  const resultado = [];


  for (const seccion of secciones) {
    let queryUso = null;


    switch (seccion.nombre) {

      case "Datos personales":
        queryUso = `
          SELECT COUNT(DISTINCT u.id_usuario) total
          FROM usuarios u
          INNER JOIN perfiles p
            ON p.id_usuario = u.id_usuario
          WHERE p.id_carrera = ?
          AND (
            NULLIF(TRIM(p.telefono), '') IS NOT NULL
            OR NULLIF(TRIM(p.direccion), '') IS NOT NULL
          )
        `;
        break;


      case "Descripción personal o profesional":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
          AND NULLIF(
            TRIM(c.resumen_profesional),
            ''
          ) IS NOT NULL
        `;
        break;


      case "Formación académica":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN formacion_academica f
            ON f.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Idiomas":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN idiomas i
            ON i.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Habilidades y debilidades":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN habilidades h
            ON h.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Cursos y certificaciones":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN cursos_certificaciones cc
            ON cc.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Proyectos":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN proyectos pr
            ON pr.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Prácticas":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN practicas pr
            ON pr.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Experiencia laboral":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN experiencias_laborales e
            ON e.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;


      case "Referencias":
        queryUso = `
          SELECT COUNT(DISTINCT c.id_usuario) total
          FROM curriculums c
          INNER JOIN perfiles p
            ON p.id_usuario = c.id_usuario
          INNER JOIN referencias ref
            ON ref.id_curriculum = c.id_curriculum
          WHERE p.id_carrera = ?
          AND c.estado = TRUE
        `;
        break;

      default:
        queryUso = null;
    }


    let utilizados = 0;


    if (queryUso) {
      const [[row]] =
        await pool.query(
          queryUso,
          [idCarrera]
        );

      utilizados =
        Number(row.total) || 0;
    }


    const porcentaje =
      totalEstudiantes > 0
        ? Number(
            (
              utilizados /
              totalEstudiantes *
              100
            ).toFixed(2)
          )
        : 0;


    resultado.push({
      id_seccion:
        seccion.id_seccion,

      nombre:
        seccion.nombre,

      orden:
        seccion.orden,

      estudiantes:
        utilizados,

      total_estudiantes:
        totalEstudiantes,

      porcentaje
    });
  }


  return {
    carrera,
    total_estudiantes:
      totalEstudiantes,

    secciones:
      resultado
  };
}


module.exports = {
  listarSeccionesCompletas,
  actualizarOrden,
  obtenerIdsSecciones,
  listarCarreras,
  obtenerEstadisticasPorCarrera
};