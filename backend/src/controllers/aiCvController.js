const pool = require("../config/database");

const {
  enviarMensajeIA
} = require("../services/aiService");


async function generarResumenBorrador(req, res) {
  try {
    const {
      titulo_profesional,
      formacion = [],
      experiencias = [],
      proyectos = [],
      habilidades = [],
      idiomas = [],
      cursos = []
    } = req.body;

    if (
      !titulo_profesional ||
      !titulo_profesional.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "El título o perfil profesional es obligatorio"
      });
    }

    const contexto = JSON.stringify(
      {
        titulo_profesional,
        formacion,
        experiencias,
        proyectos,
        habilidades,
        idiomas,
        cursos
      },
      null,
      2
    );

    const historial = [
      {
        role: "user",
        content: `
Estoy creando mi currículum desde cero.

Con la información proporcionada,
redacta un resumen profesional de 3 a 5 líneas.

Reglas obligatorias:

- No inventes información.
- Usa únicamente los datos proporcionados.
- No agregues experiencia que no exista.
- No agregues tecnologías que no aparezcan.
- Redacta en español.
- Utiliza un tono profesional.
- No uses Markdown.
- No escribas títulos.
- Devuelve únicamente el resumen profesional.
        `
      }
    ];

    const resumen =
      await enviarMensajeIA(
        historial,
        contexto
      );

    return res.status(200).json({
      mensaje:
        "Resumen generado correctamente",

      resumen:
        resumen.trim()
    });

  } catch (error) {
    console.error(
      "Error al generar resumen:",
      error
    );

    return res.status(502).json({
      mensaje:
        "No se pudo generar el resumen con IA"
    });
  }
}


async function crearCVDesdeIA(req, res) {
  const connection =
    await pool.getConnection();

  try {
    const idUsuario =
      req.usuario.id_usuario;

    const {
      nombre,
      titulo_profesional,
      resumen_profesional,

      formacion = [],
      experiencias = [],
      proyectos = [],
      habilidades = [],
      idiomas = [],
      cursos = []
    } = req.body;

    if (
      !nombre ||
      !nombre.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "El nombre del currículum es obligatorio"
      });
    }

    await connection.beginTransaction();

    /*
     * CURRÍCULUM PRINCIPAL
     */
    const [resultadoCV] =
      await connection.execute(
        `INSERT INTO curriculums
          (
            id_usuario,
            nombre,
            titulo_profesional,
            resumen_profesional,
            estado
          )
         VALUES (?, ?, ?, ?, 1)`,
        [
          idUsuario,
          nombre.trim(),

          titulo_profesional
            ?.trim() || null,

          resumen_profesional
            ?.trim() || null
        ]
      );

    const idCurriculum =
      resultadoCV.insertId;


    /*
     * FORMACIÓN ACADÉMICA
     */
    for (const item of formacion) {
      if (
        !item.institucion ||
        !item.titulo
      ) {
        continue;
      }

      await connection.execute(
        `INSERT INTO formacion_academica
          (
            id_curriculum,
            institucion,
            titulo,
            fecha_inicio,
            fecha_fin,
            en_curso,
            descripcion
          )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idCurriculum,
          item.institucion,
          item.titulo,
          item.fecha_inicio || null,
          item.fecha_fin || null,
          item.en_curso ? 1 : 0,
          item.descripcion || null
        ]
      );
    }


    /*
     * EXPERIENCIA LABORAL
     */
    for (const item of experiencias) {
      if (
        !item.empresa ||
        !item.cargo
      ) {
        continue;
      }

      await connection.execute(
        `INSERT INTO experiencias_laborales
          (
            id_curriculum,
            empresa,
            cargo,
            fecha_inicio,
            fecha_fin,
            actualmente,
            descripcion
          )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idCurriculum,
          item.empresa,
          item.cargo,
          item.fecha_inicio || null,
          item.fecha_fin || null,
          item.actualmente ? 1 : 0,
          item.descripcion || null
        ]
      );
    }


    /*
     * PROYECTOS
     */
    for (const item of proyectos) {
      if (!item.nombre) {
        continue;
      }

      await connection.execute(
        `INSERT INTO proyectos
          (
            id_curriculum,
            nombre,
            descripcion,
            tecnologias,
            enlace
          )
         VALUES (?, ?, ?, ?, ?)`,
        [
          idCurriculum,
          item.nombre,
          item.descripcion || null,
          item.tecnologias || null,
          item.enlace || null
        ]
      );
    }


    /*
     * HABILIDADES
     */
    for (const item of habilidades) {
      if (!item.nombre) {
        continue;
      }

      await connection.execute(
        `INSERT INTO habilidades
          (
            id_curriculum,
            nombre,
            nivel
          )
         VALUES (?, ?, ?)`,
        [
          idCurriculum,
          item.nombre,
          item.nivel || null
        ]
      );
    }


    /*
     * IDIOMAS
     */
    for (const item of idiomas) {
      if (
        !item.idioma ||
        !item.nivel
      ) {
        continue;
      }

      await connection.execute(
        `INSERT INTO idiomas
          (
            id_curriculum,
            idioma,
            nivel
          )
         VALUES (?, ?, ?)`,
        [
          idCurriculum,
          item.idioma,
          item.nivel
        ]
      );
    }


    /*
     * CURSOS Y CERTIFICACIONES
     */
    for (const item of cursos) {
      if (!item.nombre) {
        continue;
      }

      await connection.execute(
        `INSERT INTO cursos_certificaciones
          (
            id_curriculum,
            nombre,
            institucion,
            fecha_obtencion,
            enlace
          )
         VALUES (?, ?, ?, ?, ?)`,
        [
          idCurriculum,
          item.nombre,
          item.institucion || null,
          item.fecha_obtencion || null,
          item.enlace || null
        ]
      );
    }


    await connection.commit();

    return res.status(201).json({
      mensaje:
        "Currículum creado correctamente desde el asistente",

      id_curriculum:
        idCurriculum
    });

  } catch (error) {
    await connection.rollback();

    console.error(
      "Error al crear CV desde IA:",
      error
    );

    return res.status(500).json({
      mensaje:
        "No se pudo crear el currículum"
    });

  } finally {
    connection.release();
  }
}


module.exports = {
  generarResumenBorrador,
  crearCVDesdeIA
};