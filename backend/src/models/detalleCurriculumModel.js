const pool = require("../config/database");

function obtenerClaveSeccion(nombre) {
  const normalizado = String(nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const claves = {
    "datos personales": "datos_personales",
    "descripcion personal o profesional": "descripcion",
    "formacion academica": "formacion",
    "idiomas": "idiomas",
    "habilidades": "habilidades",
    "habilidades y debilidades": "habilidades",
    "cursos y certificaciones": "cursos",
    "proyectos": "proyectos",
    "practicas": "practicas",
    "experiencia laboral": "experiencia",
    "referencias": "referencias"
  };

  return claves[normalizado] || null;
}

async function obtenerCurriculumUsuario(idCurriculum, idUsuario) {
  const [rows] = await pool.query(
    `
      SELECT
        c.id_curriculum,
        c.id_usuario,
        c.id_plantilla,
        c.nombre,
        c.titulo_profesional,
        c.resumen_profesional,
        c.descripcion_profesional,
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
        p.titulo_profesional AS titulo_perfil,

        u.email,

        ca.nombre AS carrera,

        pl.nombre AS plantilla_nombre,
        pl.codigo AS plantilla_codigo,
        pl.estado AS plantilla_estado

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
    [idCurriculum, idUsuario]
  );

  return rows[0] || null;
}

async function obtenerSecciones() {
  const [rows] = await pool.query(
    `
      SELECT id_seccion, nombre, descripcion, orden
      FROM secciones_cv
      WHERE estado = TRUE
      ORDER BY orden ASC
    `
  );

  return rows
    .map((seccion) => ({
      ...seccion,
      clave: obtenerClaveSeccion(seccion.nombre)
    }))
    .filter((seccion) => Boolean(seccion.clave));
}

async function obtenerIdiomasCatalogo() {
  const [rows] = await pool.query(
    `
      SELECT id_idioma_catalogo, nombre
      FROM idiomas_catalogo
      WHERE estado = TRUE
      ORDER BY nombre ASC
    `
  );

  return rows;
}

async function obtenerHabilidadesCatalogo(idCarrera) {
  const [rows] = await pool.query(
    `
      SELECT
        id_habilidad_catalogo,
        id_carrera,
        tipo,
        nombre,
        descripcion,
        orden

      FROM habilidades_catalogo

      WHERE tipo IN ('tecnica', 'blanda')
        AND (
          id_carrera IS NULL
          OR id_carrera = ?
        )

      ORDER BY
        FIELD(tipo, 'tecnica', 'blanda'),
        orden ASC,
        nombre ASC
    `,
    [idCarrera]
  );

  return rows;
}

async function obtenerContenidoCompleto(idCurriculum, idUsuario) {
  const curriculum = await obtenerCurriculumUsuario(
    idCurriculum,
    idUsuario
  );

  if (!curriculum) {
    return null;
  }

  const secciones = await obtenerSecciones();
  const idiomasCatalogo = await obtenerIdiomasCatalogo();
  const habilidadesCatalogo = await obtenerHabilidadesCatalogo(
    curriculum.id_carrera
  );

  const [formacion] = await pool.query(
    `
      SELECT *
      FROM formacion_academica
      WHERE id_curriculum = ?
        AND tipo_formacion = 'adicional'
      ORDER BY id_formacion ASC
    `,
    [idCurriculum]
  );

  const [idiomas] = await pool.query(
    `
      SELECT
        id_idioma,
        id_idioma_catalogo,
        idioma,
        nivel,
        tiene_certificado,
        evidencia_archivo

      FROM idiomas

      WHERE id_curriculum = ?
      ORDER BY id_idioma ASC
    `,
    [idCurriculum]
  );

  const [habilidades] = await pool.query(
    `
      SELECT
        id_habilidad,
        id_habilidad_catalogo,
        nombre,
        tipo,
        nivel

      FROM habilidades

      WHERE id_curriculum = ?
        AND tipo IN ('tecnica', 'blanda')

      ORDER BY
        FIELD(tipo, 'tecnica', 'blanda'),
        id_habilidad ASC
    `,
    [idCurriculum]
  );

  const [cursos] = await pool.query(
    `
      SELECT *
      FROM cursos_certificaciones
      WHERE id_curriculum = ?
      ORDER BY id_curso ASC
    `,
    [idCurriculum]
  );

  const [proyectos] = await pool.query(
    `
      SELECT *
      FROM proyectos
      WHERE id_curriculum = ?
      ORDER BY id_proyecto ASC
    `,
    [idCurriculum]
  );

  const [practicas] = await pool.query(
    `
      SELECT *
      FROM practicas
      WHERE id_curriculum = ?
      ORDER BY id_practica ASC
    `,
    [idCurriculum]
  );

  const [experiencias] = await pool.query(
    `
      SELECT *
      FROM experiencias_laborales
      WHERE id_curriculum = ?
      ORDER BY id_experiencia ASC
    `,
    [idCurriculum]
  );

  const [referencias] = await pool.query(
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
      nombres: curriculum.nombres,
      apellidos: curriculum.apellidos,
      telefono: curriculum.telefono,
      email: curriculum.email,
      ciudad_pais: curriculum.ciudad_pais,
      fotografia_url: curriculum.fotografia_url,
      linkedin_url: curriculum.linkedin_url,
      github_url: curriculum.github_url,
      sitio_web: curriculum.sitio_web,
      id_carrera: curriculum.id_carrera,
      carrera: curriculum.carrera,
      estado_academico: curriculum.estado_academico,
      titulo_profesional: curriculum.titulo_perfil
    },

    secciones,

    catalogos: {
      idiomas: idiomasCatalogo,
      habilidades: habilidadesCatalogo
    },

    contenido: {
      descripcion: curriculum.descripcion_profesional || "",
      formacion,
      idiomas,
      habilidades,
      cursos,
      proyectos,
      practicas,
      experiencia: experiencias,
      referencias
    }
  };
}

async function guardarDescripcion(idCurriculum, descripcion) {
  await pool.query(
    `
      UPDATE curriculums
      SET
        descripcion_profesional = ?,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_curriculum = ?
    `,
    [descripcion, idCurriculum]
  );
}

async function guardarFormacion(idCurriculum, estudios) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        DELETE FROM formacion_academica
        WHERE id_curriculum = ?
          AND tipo_formacion = 'adicional'
      `,
      [idCurriculum]
    );

    for (const estudio of estudios) {
      await connection.query(
        `
          INSERT INTO formacion_academica (
            id_curriculum,
            tipo_formacion,
            institucion,
            titulo,
            fecha_inicio,
            fecha_fin,
            en_curso,
            descripcion,
            ciudad_pais,
            evidencia_archivo
          )
          VALUES (?, 'adicional', ?, ?, ?, ?, ?, NULL, ?, ?)
        `,
        [
          idCurriculum,
          estudio.institucion,
          estudio.titulo,
          estudio.fecha_inicio,
          estudio.fecha_fin,
          estudio.fecha_fin ? 0 : 1,
          estudio.ciudad_pais,
          estudio.evidencia_archivo
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

async function guardarIdiomas(idCurriculum, idiomas) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM idiomas WHERE id_curriculum = ?",
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
            tiene_certificado,
            evidencia_archivo
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          idioma.id_idioma_catalogo,
          idioma.idioma,
          idioma.nivel,
          idioma.tiene_certificado,
          idioma.evidencia_archivo
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

async function guardarHabilidades(idCurriculum, habilidades) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM habilidades WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const habilidad of habilidades) {
      const porcentaje =
        habilidad.nivel === "Básico"
          ? 30
          : habilidad.nivel === "Intermedio"
            ? 60
            : 90;

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
          habilidad.id_habilidad_catalogo,
          habilidad.nombre,
          habilidad.tipo,
          habilidad.nivel,
          porcentaje
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

async function guardarCursos(idCurriculum, cursos) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM cursos_certificaciones WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const curso of cursos) {
      await connection.query(
        `
          INSERT INTO cursos_certificaciones (
            id_curriculum,
            tipo,
            nombre,
            institucion,
            fecha_obtencion,
            fecha_expiracion,
            enlace,
            evidencia_archivo,
            tiene_evidencia,
            horas_duracion,
            descripcion
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          curso.tipo,
          curso.nombre,
          curso.institucion,
          curso.fecha_obtencion,
          curso.fecha_expiracion,
          curso.evidencia_url,
          curso.evidencia_archivo,
          curso.evidencia_url || curso.evidencia_archivo ? 1 : 0,
          curso.horas_duracion,
          curso.descripcion
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

async function guardarProyectos(idCurriculum, proyectos) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM proyectos WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const proyecto of proyectos) {
      await connection.query(
        `
          INSERT INTO proyectos (
            id_curriculum,
            nombre,
            tipo_proyecto,
            descripcion,
            tecnologias,
            rol,
            fecha_inicio,
            fecha_fin,
            estado,
            enlace,
            evidencia_archivo
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          proyecto.nombre,
          proyecto.tipo_proyecto,
          proyecto.descripcion,
          proyecto.tecnologias,
          proyecto.rol,
          proyecto.fecha_inicio,
          proyecto.fecha_fin,
          proyecto.estado,
          proyecto.evidencia_url,
          proyecto.evidencia_archivo
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

async function guardarPracticas(idCurriculum, practicas) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM practicas WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const practica of practicas) {
      await connection.query(
        `
          INSERT INTO practicas (
            id_curriculum,
            tipo,
            institucion,
            cargo_area,
            rol_funcion,
            fecha_inicio,
            fecha_fin,
            descripcion,
            modalidad,
            evidencia_url,
            evidencia_archivo,
            herramientas,
            logro_aprendizaje
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        `,
        [
          idCurriculum,
          practica.tipo,
          practica.institucion,
          practica.area,
          practica.rol_funcion,
          practica.fecha_inicio,
          practica.fecha_fin,
          practica.actividades,
          practica.modalidad,
          practica.evidencia_url,
          practica.evidencia_archivo
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

async function guardarExperiencias(idCurriculum, experiencias) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM experiencias_laborales WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const experiencia of experiencias) {
      await connection.query(
        `
          INSERT INTO experiencias_laborales (
            id_curriculum,
            empresa,
            cargo,
            area,
            tipo_empleo,
            fecha_inicio,
            fecha_fin,
            actualmente,
            descripcion,
            modalidad,
            ciudad_pais,
            evidencia_url,
            evidencia_archivo
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          experiencia.empresa,
          experiencia.cargo,
          experiencia.area,
          experiencia.tipo_empleo,
          experiencia.fecha_inicio,
          experiencia.fecha_fin,
          experiencia.actualmente ? 1 : 0,
          experiencia.descripcion,
          experiencia.modalidad,
          experiencia.ciudad_pais,
          experiencia.evidencia_url,
          experiencia.evidencia_archivo
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

async function guardarReferencias(idCurriculum, referencias) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM referencias WHERE id_curriculum = ?",
      [idCurriculum]
    );

    for (const referencia of referencias) {
      await connection.query(
        `
          INSERT INTO referencias (
            id_curriculum,
            tipo_referencia,
            nombre_completo,
            cargo,
            empresa_institucion,
            telefono,
            email,
            autorizacion
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          idCurriculum,
          referencia.tipo_referencia,
          referencia.nombre_completo,
          referencia.cargo,
          referencia.empresa_institucion,
          referencia.telefono,
          referencia.email,
          referencia.autorizacion ? 1 : 0
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
