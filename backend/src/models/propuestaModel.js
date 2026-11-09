const pool = require("../config/database");

async function crearPropuesta(idUsuario, titulo, descripcion) {
  const [resultado] = await pool.execute(
    `INSERT INTO propuestas_mejora (id_usuario,titulo,descripcion) VALUES (?,?,?)`,
    [idUsuario,titulo,descripcion]
  );
  return resultado.insertId;
}

async function listarPorUsuario(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT id_propuesta,titulo,descripcion,estado,respuesta_admin,
            fecha_creacion,fecha_actualizacion
     FROM propuestas_mejora
     WHERE id_usuario=?
     ORDER BY fecha_creacion DESC`,
    [idUsuario]
  );
  return filas;
}

async function listarTodas(filtros = {}) {
  const condiciones = [];
  const parametros = [];

  if (filtros.estado) {
    condiciones.push("pm.estado=?");
    parametros.push(filtros.estado);
  }

  if (filtros.buscar) {
    const termino = `%${filtros.buscar}%`;
    condiciones.push(
      "(pm.titulo LIKE ? OR pm.descripcion LIKE ? OR u.email LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?)"
    );
    parametros.push(termino,termino,termino,termino,termino);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const [filas] = await pool.execute(
    `SELECT pm.id_propuesta,pm.id_usuario,pm.titulo,pm.descripcion,pm.estado,
            pm.respuesta_admin,pm.fecha_creacion,pm.fecha_actualizacion,
            u.email,p.nombres,p.apellidos
     FROM propuestas_mejora pm
     INNER JOIN usuarios u ON pm.id_usuario=u.id_usuario
     LEFT JOIN perfiles p ON u.id_usuario=p.id_usuario
     ${where}
     ORDER BY pm.fecha_creacion DESC`,
    parametros
  );

  return filas;
}

async function obtenerResumenPropuestas() {
  const [[datos]] = await pool.execute(
    `SELECT COUNT(*) AS total,
      SUM(estado='pendiente') AS pendientes,
      SUM(estado='en_revision') AS revision,
      SUM(estado='aceptada') AS aceptadas,
      SUM(estado='rechazada') AS rechazadas
     FROM propuestas_mejora`
  );

  return {
    total:Number(datos.total || 0),
    pendientes:Number(datos.pendientes || 0),
    revision:Number(datos.revision || 0),
    aceptadas:Number(datos.aceptadas || 0),
    rechazadas:Number(datos.rechazadas || 0)
  };
}

async function buscarPorId(idPropuesta) {
  const [filas] = await pool.execute(
    `SELECT id_propuesta,estado,respuesta_admin,titulo
     FROM propuestas_mejora WHERE id_propuesta=?`,
    [idPropuesta]
  );
  return filas[0];
}

async function actualizarEstado(idPropuesta, estado, respuestaAdmin) {
  const [resultado] = await pool.execute(
    `UPDATE propuestas_mejora
     SET estado=?,respuesta_admin=?
     WHERE id_propuesta=?`,
    [estado,respuestaAdmin || null,idPropuesta]
  );
  return resultado.affectedRows;
}

module.exports = {
  crearPropuesta,
  listarPorUsuario,
  listarTodas,
  obtenerResumenPropuestas,
  buscarPorId,
  actualizarEstado
};