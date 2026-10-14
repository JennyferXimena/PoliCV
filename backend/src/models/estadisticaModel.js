const pool = require("../config/database");

async function obtenerResumen() {
  const [rows] = await pool.execute(
    `SELECT
      (SELECT COUNT(*)
       FROM usuarios) AS usuarios_total,

      (SELECT COUNT(*)
       FROM usuarios
       WHERE estado = TRUE) AS usuarios_activos,

      (SELECT COUNT(*)
       FROM usuarios
       WHERE estado = FALSE) AS usuarios_inactivos,

      (SELECT COUNT(*)
       FROM usuarios u
       INNER JOIN roles r
         ON u.id_rol = r.id_rol
       WHERE r.nombre = 'Estudiante') AS estudiantes,

      (SELECT COUNT(*)
       FROM usuarios u
       INNER JOIN roles r
         ON u.id_rol = r.id_rol
       WHERE r.nombre = 'Administrador') AS administradores,

      (SELECT COUNT(*)
       FROM secciones_cv) AS secciones_total,

      (SELECT COUNT(*)
       FROM secciones_cv
       WHERE estado = TRUE) AS secciones_activas,

      (SELECT COUNT(*)
       FROM plantillas) AS plantillas_total,

      (SELECT COUNT(*)
       FROM plantillas
       WHERE estado = TRUE) AS plantillas_activas,

      (SELECT COUNT(*)
       FROM propuestas_mejora) AS propuestas_total,

      (SELECT COUNT(*)
       FROM propuestas_mejora
       WHERE estado = 'pendiente') AS propuestas_pendientes,

      (SELECT COUNT(*)
       FROM propuestas_mejora
       WHERE estado = 'aceptada') AS propuestas_aceptadas,

      (SELECT COUNT(*)
       FROM propuestas_mejora
       WHERE estado = 'rechazada') AS propuestas_rechazadas`
  );

  return rows[0];
}

module.exports = {
  obtenerResumen
};