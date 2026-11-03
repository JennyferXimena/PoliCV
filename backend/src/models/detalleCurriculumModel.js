const pool =
  require("../config/database");


/* =========================================================
   CLAVES DE LAS 10 SECCIONES
========================================================= */

function obtenerClaveSeccion(
  nombre
) {
  const claves = {
    "Datos personales":
      "datos_personales",

    "Descripción personal o profesional":
      "descripcion",

    "Formación académica":
      "formacion",

    "Idiomas":
      "idiomas",

    "Habilidades y debilidades":
      "habilidades",

    "Cursos y certificaciones":
      "cursos",

    "Proyectos":
      "proyectos",

    "Prácticas":
      "practicas",

    "Experiencia laboral":
      "experiencia",

    "Referencias":
      "referencias"
  };


  return claves[nombre] || null;
}


/* =========================================================
   CURRÍCULUM + PERFIL + CARRERA
========================================================= */

async function obtenerCurriculumUsuario(
  idCurriculum,
  idUsuario
) {
  const [rows] =
    await pool.query(
      `
      SELECT
        c.id_curriculum,
        c.id_usuario,
        c.id_plantilla,
        c.nombre,
        c.titulo_profesional,
        c.resumen_profesional,
        c.estado,

        p.nombres,
        p.apellidos,
        p.telefono,
        p.ciudad_pais,
        p.fotografia_url,
        p.linkedin_url,
        p.github_url,
        p.sitio_web,
        p.id_carrera,
        p.estado_academico,
        p.titulo_profesional
          AS titulo_perfil,

        u.email,

        ca.nombre
          AS carrera,

        pl.nombre
          AS plantilla_nombre,

        pl.codigo
          AS plantilla_codigo,

        pl.estado
          AS plantilla_estado

      FROM curriculums c

      INNER JOIN usuarios u
        ON u.id_usuario = c.id_usuario

      INNER JOIN perfiles p
        ON p.id_usuario = c.id_usuario

      LEFT JOIN carreras ca
        ON ca.id_carrera = p.id_carrera

      LEFT JOIN plantillas pl
        ON pl.id_plantilla = c.id_plantilla

      WHERE c.id_curriculum = ?
      AND c.id_usuario = ?
      AND c.estado = TRUE

      LIMIT 1
      `,
      [
        idCurriculum,
        idUsuario
      ]
    );


  return rows[0] || null;
}

/* =========================================================
   ESTRUCTURA ORDENADA POR ADMINISTRADOR
========================================================= */

async function obtenerSecciones() {
  const [rows] =
    await pool.query(
      `
      SELECT
        id_seccion,
        nombre,
        descripcion,
        orden

      FROM secciones_cv

      WHERE estado = TRUE

      ORDER BY orden ASC
      `
    );


  return rows
    .map(
      (seccion) => ({
        ...seccion,

        clave:
          obtenerClaveSeccion(
            seccion.nombre
          )
      })
    )
    .filter(
      (seccion) =>
        Boolean(
          seccion.clave
        )
    );
}


/* =========================================================
   CATÁLOGO DE IDIOMAS
========================================================= */

async function obtenerIdiomasCatalogo() {
  const [rows] =
    await pool.query(
      `
      SELECT
        id_idioma_catalogo,
        nombre

      FROM idiomas_catalogo

      WHERE estado = TRUE

      ORDER BY nombre ASC
      `
    );


  return rows;
}


/* =========================================================
   CATÁLOGO DE HABILIDADES
========================================================= */

async function obtenerHabilidadesCatalogo(
  idCarrera
) {
  const [rows] =
    await pool.query(
      `
      SELECT
        id_habilidad_catalogo,
        id_carrera,
        tipo,
        nombre,
        descripcion,
        orden

      FROM habilidades_catalogo

      WHERE
        id_carrera IS NULL
        OR id_carrera = ?

      ORDER BY
        FIELD(
          tipo,
          'blanda',
          'tecnica',
          'metodologica'
        ),
        orden ASC,
        nombre ASC
      `,
      [idCarrera]
    );


  return rows;
}


/* =========================================================
   CONTENIDO COMPLETO DEL CV
========================================================= */

async function obtenerContenidoCompleto(
  idCurriculum,
  idUsuario
) {
  const curriculum =
    await obtenerCurriculumUsuario(
      idCurriculum,
      idUsuario
    );


  if (!curriculum) {
    return null;
  }


  const secciones =
    await obtenerSecciones();


  const idiomasCatalogo =
    await obtenerIdiomasCatalogo();


  const habilidadesCatalogo =
    await obtenerHabilidadesCatalogo(
      curriculum.id_carrera
    );


  const [
    formacionRows
  ] =
    await pool.query(
      `
      SELECT *
      FROM formacion_academica
      WHERE id_curriculum = ?
      ORDER BY id_formacion ASC
      LIMIT 1
      `,
      [idCurriculum]
    );


  const [idiomas] =
    await pool.query(
      `
      SELECT
        id_idioma,
        id_idioma_catalogo,
        idioma,
        nivel,
        es_nativo,
        tiene_certificado

      FROM idiomas

      WHERE id_curriculum = ?

      ORDER BY
        es_nativo DESC,
        id_idioma ASC
      `,
      [idCurriculum]
    );


  const [habilidades] =
    await pool.query(
      `
      SELECT
        id_habilidad,
        id_habilidad_catalogo,
        nombre,
        tipo,
        porcentaje,
        nivel

      FROM habilidades

      WHERE id_curriculum = ?

      ORDER BY
        FIELD(
          tipo,
          'blanda',
          'tecnica',
          'metodologica'
        ),
        id_habilidad ASC
      `,
      [idCurriculum]
    );


  const [cursos] =
    await pool.query(
      `
      SELECT *
      FROM cursos_certificaciones
      WHERE id_curriculum = ?
      ORDER BY id_curso ASC
      `,
      [idCurriculum]
    );


  const [proyectos] =
    await pool.query(
      `
      SELECT *
      FROM proyectos
      WHERE id_curriculum = ?
      ORDER BY id_proyecto ASC
      `,
      [idCurriculum]
    );


  const [practicas] =
    await pool.query(
      `
      SELECT *
      FROM practicas
      WHERE id_curriculum = ?
      ORDER BY
        FIELD(
          tipo,
          'comunitaria',
          'laboral'
        ),
        id_practica ASC
      `,
      [idCurriculum]
    );


  const [experiencias] =
    await pool.query(
      `
      SELECT *
      FROM experiencias_laborales
      WHERE id_curriculum = ?
      ORDER BY id_experiencia ASC
      `,
      [idCurriculum]
    );


  const [referencias] =
    await pool.query(
      `
      SELECT *
      FROM referencias
      WHERE id_curriculum = ?
      ORDER BY id_referencia ASC
      `,
      [idCurriculum]
    );


  return {
    curriculum,

    perfil: {
      nombres:
        curriculum.nombres,

      apellidos:
        curriculum.apellidos,

      telefono:
        curriculum.telefono,

      email:
        curriculum.email,

      ciudad_pais:
        curriculum.ciudad_pais,

      fotografia_url:
        curriculum.fotografia_url,

      linkedin_url:
        curriculum.linkedin_url,

      github_url:
        curriculum.github_url,

      sitio_web:
        curriculum.sitio_web,

      id_carrera:
        curriculum.id_carrera,

      carrera:
        curriculum.carrera,

      estado_academico:
        curriculum.estado_academico,

      titulo_profesional:
        curriculum.titulo_perfil
    },

    secciones,

    catalogos: {
      idiomas:
        idiomasCatalogo,

      habilidades:
        habilidadesCatalogo
    },

    contenido: {
      descripcion:
        curriculum.resumen_profesional ||
        "",

      formacion:
        formacionRows[0] ||
        null,

      idiomas,

      habilidades,

      cursos,

      proyectos,

      practicas,

      experiencia:
        experiencias,

      referencias
    }
  };
}


/* =========================================================
   GUARDAR RESUMEN PROFESIONAL
========================================================= */

async function guardarDescripcion(
  idCurriculum,
  texto
) {
  await pool.query(
    `
    UPDATE curriculums

    SET
      resumen_profesional = ?,
      fecha_actualizacion =
        CURRENT_TIMESTAMP

    WHERE id_curriculum = ?
    `,
    [
      texto,
      idCurriculum
    ]
  );
}


/* =========================================================
   REEMPLAZAR FORMACIÓN
========================================================= */

async function guardarFormacion(
  idCurriculum,
  datos
) {
  const connection =
    await pool.getConnection();


  try {
    await connection
      .beginTransaction();


    await connection.query(
      `
      DELETE FROM formacion_academica
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    await connection.query(
      `
      INSERT INTO formacion_academica (
        id_curriculum,
        institucion,
        titulo,
        fecha_inicio,
        fecha_fin,
        en_curso,
        descripcion,
        ciudad_pais
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        idCurriculum,
        datos.institucion,
        datos.titulo,
        datos.fecha_inicio,
        datos.fecha_fin,
        datos.en_curso,
        datos.descripcion,
        datos.ciudad_pais
      ]
    );


    await connection.commit();


  } catch (error) {
    await connection.rollback();

    throw error;


  } finally {
    connection.release();
  }
}


/* =========================================================
   REEMPLAZAR IDIOMAS
========================================================= */

async function guardarIdiomas(
  idCurriculum,
  idiomas
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM idiomas
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (const idioma of idiomas) {
      await connection.query(
        `
        INSERT INTO idiomas (
          id_curriculum,
          id_idioma_catalogo,
          idioma,
          nivel,
          es_nativo,
          tiene_certificado
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          idioma.id_idioma_catalogo,
          idioma.idioma,
          idioma.nivel,
          idioma.es_nativo,
          idioma.tiene_certificado
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


/* =========================================================
   REEMPLAZAR HABILIDADES
========================================================= */

async function guardarHabilidades(
  idCurriculum,
  habilidades
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM habilidades
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (
      const habilidad
      of habilidades
    ) {
      await connection.query(
        `
        INSERT INTO habilidades (
          id_curriculum,
          id_habilidad_catalogo,
          nombre,
          tipo,
          nivel,
          porcentaje
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,

          habilidad
            .id_habilidad_catalogo,

          habilidad.nombre,

          habilidad.tipo,

          habilidad.nivel,

          habilidad.porcentaje
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


/* =========================================================
   REEMPLAZAR CURSOS
========================================================= */

async function guardarCursos(
  idCurriculum,
  cursos
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM cursos_certificaciones
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (const curso of cursos) {
      await connection.query(
        `
        INSERT INTO cursos_certificaciones (
          id_curriculum,
          nombre,
          institucion,
          fecha_obtencion,
          enlace,
          tiene_evidencia,
          horas_duracion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          curso.nombre,
          curso.institucion,
          curso.fecha_obtencion,
          curso.enlace,
          curso.tiene_evidencia,
          curso.horas_duracion
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


/* =========================================================
   REEMPLAZAR PROYECTOS
========================================================= */

async function guardarProyectos(
  idCurriculum,
  proyectos
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM proyectos
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (
      const proyecto
      of proyectos
    ) {
      await connection.query(
        `
        INSERT INTO proyectos (
          id_curriculum,
          nombre,
          descripcion,
          tecnologias,
          enlace
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          proyecto.nombre,
          proyecto.descripcion,
          proyecto.tecnologias,
          proyecto.enlace
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


/* =========================================================
   REEMPLAZAR PRÁCTICAS
========================================================= */

async function guardarPracticas(
  idCurriculum,
  practicas
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM practicas
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (
      const practica
      of practicas
    ) {
      await connection.query(
        `
        INSERT INTO practicas (
          id_curriculum,
          tipo,
          institucion,
          cargo_area,
          fecha_inicio,
          fecha_fin,
          descripcion,
          herramientas,
          logro_aprendizaje
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          practica.tipo,
          practica.institucion,
          practica.cargo_area,
          practica.fecha_inicio,
          practica.fecha_fin,
          practica.descripcion,
          practica.herramientas,
          practica.logro_aprendizaje
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


/* =========================================================
   REEMPLAZAR EXPERIENCIAS
========================================================= */

async function guardarExperiencias(
  idCurriculum,
  experiencias
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM experiencias_laborales
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (
      const experiencia
      of experiencias
    ) {
      await connection.query(
        `
        INSERT INTO experiencias_laborales (
          id_curriculum,
          empresa,
          cargo,
          fecha_inicio,
          fecha_fin,
          actualmente,
          descripcion,
          ciudad_pais
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          experiencia.empresa,
          experiencia.cargo,
          experiencia.fecha_inicio,
          experiencia.fecha_fin,
          experiencia.actualmente,
          experiencia.descripcion,
          experiencia.ciudad_pais
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


/* =========================================================
   REEMPLAZAR REFERENCIAS
========================================================= */

async function guardarReferencias(
  idCurriculum,
  referencias
) {
  const connection =
    await pool.getConnection();


  try {
    await connection.beginTransaction();


    await connection.query(
      `
      DELETE FROM referencias
      WHERE id_curriculum = ?
      `,
      [idCurriculum]
    );


    for (
      const referencia
      of referencias
    ) {
      await connection.query(
        `
        INSERT INTO referencias (
          id_curriculum,
          nombre_completo,
          cargo,
          empresa_institucion,
          telefono,
          email
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          referencia.nombre_completo,
          referencia.cargo,
          referencia.empresa_institucion,
          referencia.telefono,
          referencia.email
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


module.exports = {
  obtenerCurriculumUsuario,
  obtenerContenidoCompleto,
  obtenerIdiomasCatalogo,
  obtenerHabilidadesCatalogo,

  guardarDescripcion,
  guardarFormacion,
  guardarIdiomas,
  guardarHabilidades,
  guardarCursos,
  guardarProyectos,
  guardarPracticas,
  guardarExperiencias,
  guardarReferencias
};