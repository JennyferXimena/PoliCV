const pool = require("../config/database");

async function obtenerPorCurriculum(idCurriculum, idUsuario) {
  const [rows] = await pool.query(
    `
      SELECT
        l.id_landing,
        l.id_curriculum,
        l.slug,
        l.tema,
        l.paleta,
        l.publicada,
        l.fecha_publicacion,
        l.fecha_creacion,
        l.fecha_actualizacion
      FROM landing_curriculums l
      INNER JOIN curriculums c
        ON c.id_curriculum = l.id_curriculum
      WHERE l.id_curriculum = ?
        AND c.id_usuario = ?
        AND c.estado = TRUE
      LIMIT 1
    `,
    [idCurriculum, idUsuario]
  );

  return rows[0] || null;
}

async function crear(idCurriculum, slug) {
  await pool.query(
    `
      INSERT INTO landing_curriculums (
        id_curriculum,
        slug,
        tema,
        paleta,
        publicada
      )
      VALUES (?, ?, 'claro', 'verde', FALSE)
    `,
    [idCurriculum, slug]
  );
}

async function actualizarConfiguracion(
  idCurriculum,
  idUsuario,
  tema,
  paleta
) {
  await pool.query(
    `
      UPDATE landing_curriculums l
      INNER JOIN curriculums c
        ON c.id_curriculum = l.id_curriculum
      SET
        l.tema = ?,
        l.paleta = ?
      WHERE l.id_curriculum = ?
        AND c.id_usuario = ?
        AND c.estado = TRUE
    `,
    [tema, paleta, idCurriculum, idUsuario]
  );

  return obtenerPorCurriculum(
    idCurriculum,
    idUsuario
  );
}

async function actualizarPublicacion(
  idCurriculum,
  idUsuario,
  publicada
) {
  await pool.query(
    `
      UPDATE landing_curriculums l
      INNER JOIN curriculums c
        ON c.id_curriculum = l.id_curriculum
      SET
        l.publicada = ?,
        l.fecha_publicacion =
          CASE
            WHEN ? = TRUE THEN CURRENT_TIMESTAMP
            ELSE NULL
          END
      WHERE l.id_curriculum = ?
        AND c.id_usuario = ?
        AND c.estado = TRUE
    `,
    [
      publicada ? 1 : 0,
      publicada ? 1 : 0,
      idCurriculum,
      idUsuario
    ]
  );

  return obtenerPorCurriculum(
    idCurriculum,
    idUsuario
  );
}

async function obtenerPublicaPorSlug(slug) {
  const [rows] = await pool.query(
    `
      SELECT
        l.id_landing,
        l.id_curriculum,
        l.slug,
        l.tema,
        l.paleta,
        l.publicada,
        l.fecha_publicacion,
        c.id_usuario
      FROM landing_curriculums l
      INNER JOIN curriculums c
        ON c.id_curriculum = l.id_curriculum
      WHERE l.slug = ?
        AND l.publicada = TRUE
        AND c.estado = TRUE
      LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}

module.exports = {
  obtenerPorCurriculum,
  crear,
  actualizarConfiguracion,
  actualizarPublicacion,
  obtenerPublicaPorSlug
};
