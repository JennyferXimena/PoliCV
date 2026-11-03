const pool =
  require("../config/database");


/* =========================================================
   OBTENER CONFIGURACIÓN DEL ESTUDIANTE
========================================================= */

async function obtenerPorUsuario(
  idUsuario
) {
  const [rows] =
    await pool.query(
      `
      SELECT
        p.id_perfil,
        p.id_usuario,
        p.id_carrera,
        p.nombres,
        p.apellidos,
        p.telefono,
        p.direccion,
        p.ciudad_pais,
        p.estado_academico,
        p.titulo_profesional,
        p.fotografia_url,
        p.linkedin_url,
        p.github_url,
        p.sitio_web,
        p.perfil_completado,

        u.email,

        c.nombre AS carrera

      FROM perfiles p

      INNER JOIN usuarios u
        ON u.id_usuario = p.id_usuario

      LEFT JOIN carreras c
        ON c.id_carrera = p.id_carrera

      WHERE p.id_usuario = ?

      LIMIT 1
      `,
      [idUsuario]
    );


  return rows[0] || null;
}


/* =========================================================
   LISTAR CARRERAS ACTIVAS
========================================================= */

async function listarCarreras() {
  const [rows] =
    await pool.query(
      `
      SELECT
        id_carrera,
        nombre,
        descripcion

      FROM carreras

      WHERE estado = TRUE

      ORDER BY nombre ASC
      `
    );


  return rows;
}


/* =========================================================
   BUSCAR CARRERA
========================================================= */

async function buscarCarreraPorId(
  idCarrera
) {
  const [rows] =
    await pool.query(
      `
      SELECT
        id_carrera,
        nombre

      FROM carreras

      WHERE id_carrera = ?
      AND estado = TRUE

      LIMIT 1
      `,
      [idCarrera]
    );


  return rows[0] || null;
}


/* =========================================================
   COMPLETAR CONFIGURACIÓN INICIAL
========================================================= */

async function completarConfiguracion(
  idUsuario,
  datos
) {
  const {
    nombres,
    apellidos,
    telefono,
    ciudad_pais,
    id_carrera,
    estado_academico,
    titulo_profesional,
    fotografia_url,
    linkedin_url,
    github_url
  } = datos;


  await pool.query(
    `
    UPDATE perfiles

    SET
      nombres = ?,
      apellidos = ?,
      telefono = ?,
      ciudad_pais = ?,
      id_carrera = ?,
      estado_academico = ?,
      titulo_profesional = ?,
      fotografia_url = ?,
      linkedin_url = ?,
      github_url = ?,
      perfil_completado = TRUE

    WHERE id_usuario = ?
    `,
    [
      nombres,
      apellidos,
      telefono,
      ciudad_pais,
      id_carrera,
      estado_academico,
      titulo_profesional,
      fotografia_url,
      linkedin_url,
      github_url,
      idUsuario
    ]
  );


  return obtenerPorUsuario(
    idUsuario
  );
}


module.exports = {
  obtenerPorUsuario,
  listarCarreras,
  buscarCarreraPorId,
  completarConfiguracion
};