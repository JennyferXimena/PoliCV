const pool = require("../config/database");

async function buscarPorEmail(email, db = pool) {
  const [filas] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
  return filas[0];
}

async function buscarPorEmailConRol(email, db = pool) {
  const [filas] = await db.execute(
    `SELECT u.id_usuario,u.id_rol,u.email,u.password_hash,u.estado,u.correo_verificado,r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.email = ?`,
    [email]
  );
  return filas[0];
}

async function crearUsuario(idRol, email, passwordHash, db = pool) {
  const [resultado] = await db.execute(
    "INSERT INTO usuarios (id_rol,email,password_hash) VALUES (?,?,?)",
    [idRol,email,passwordHash]
  );
  return resultado.insertId;
}

async function guardarVerificacion(idUsuario, tokenHash, fechaExpiracion, db = pool) {
  const [resultado] = await db.execute(
    `UPDATE usuarios
     SET correo_verificado=0,token_verificacion_hash=?,token_verificacion_expira=?,fecha_verificacion=NULL
     WHERE id_usuario=?`,
    [tokenHash,fechaExpiracion,idUsuario]
  );
  return resultado.affectedRows;
}

async function buscarPorTokenVerificacion(tokenHash, db = pool) {
  const [filas] = await db.execute(
    `SELECT id_usuario,email FROM usuarios
     WHERE token_verificacion_hash=? AND correo_verificado=0
     AND token_verificacion_expira>NOW() LIMIT 1`,
    [tokenHash]
  );
  return filas[0];
}

async function marcarCorreoVerificado(idUsuario, db = pool) {
  const [resultado] = await db.execute(
    `UPDATE usuarios
     SET correo_verificado=1,token_verificacion_hash=NULL,
         token_verificacion_expira=NULL,fecha_verificacion=NOW()
     WHERE id_usuario=?`,
    [idUsuario]
  );
  return resultado.affectedRows;
}

async function listarUsuarios(filtros = {}) {
  const condiciones = [];
  const parametros = [];

  if (filtros.buscar) {
    const termino = `%${filtros.buscar}%`;
    condiciones.push("(u.email LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?)");
    parametros.push(termino,termino,termino);
  }

  if (typeof filtros.estado === "boolean") {
    condiciones.push("u.estado = ?");
    parametros.push(filtros.estado);
  }

  if (typeof filtros.verificado === "boolean") {
    condiciones.push("u.correo_verificado = ?");
    parametros.push(filtros.verificado);
  }

  if (filtros.rol) {
    condiciones.push("r.nombre = ?");
    parametros.push(filtros.rol);
  }

  if (filtros.idCarrera) {
    condiciones.push("p.id_carrera = ?");
    parametros.push(filtros.idCarrera);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const [filas] = await pool.execute(
    `SELECT u.id_usuario,u.email,u.estado,u.correo_verificado,u.fecha_creacion,
            r.nombre AS rol,p.nombres,p.apellidos,p.estado_academico,
            c.id_carrera,c.nombre AS carrera
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol=r.id_rol
     LEFT JOIN perfiles p ON u.id_usuario=p.id_usuario
     LEFT JOIN carreras c ON p.id_carrera=c.id_carrera
     ${where}
     ORDER BY u.id_usuario DESC`,
    parametros
  );

  return filas;
}

async function obtenerResumenUsuarios() {
  const [[datos]] = await pool.execute(
    `SELECT COUNT(*) AS total,
      SUM(u.estado=1) AS activos,
      SUM(u.estado=0) AS inactivos,
      SUM(u.correo_verificado=1) AS verificados,
      SUM(u.correo_verificado=0) AS pendientes_verificacion,
      SUM(r.nombre='Estudiante') AS estudiantes,
      SUM(r.nombre='Administrador') AS administradores
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol=r.id_rol`
  );

  return {
    total:Number(datos.total || 0),
    activos:Number(datos.activos || 0),
    inactivos:Number(datos.inactivos || 0),
    verificados:Number(datos.verificados || 0),
    pendientes_verificacion:Number(datos.pendientes_verificacion || 0),
    estudiantes:Number(datos.estudiantes || 0),
    administradores:Number(datos.administradores || 0)
  };
}

async function listarCarrerasUsuarios() {
  const [filas] = await pool.execute(
    `SELECT id_carrera,nombre FROM carreras
     WHERE estado=TRUE ORDER BY nombre`
  );
  return filas;
}

async function buscarUsuarioPorId(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT u.id_usuario,u.email,u.estado,u.correo_verificado,r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol=r.id_rol
     WHERE u.id_usuario=?`,
    [idUsuario]
  );
  return filas[0];
}

async function contarAdministradoresActivos() {
  const [[datos]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol=r.id_rol
     WHERE r.nombre='Administrador' AND u.estado=TRUE`
  );
  return Number(datos.total || 0);
}

async function actualizarEstadoUsuario(idUsuario, estado) {
  const [resultado] = await pool.execute(
    "UPDATE usuarios SET estado=? WHERE id_usuario=?",
    [estado,idUsuario]
  );
  return resultado.affectedRows;
}

module.exports = {
  buscarPorEmail,
  buscarPorEmailConRol,
  crearUsuario,
  guardarVerificacion,
  buscarPorTokenVerificacion,
  marcarCorreoVerificado,
  listarUsuarios,
  obtenerResumenUsuarios,
  listarCarrerasUsuarios,
  buscarUsuarioPorId,
  contarAdministradoresActivos,
  actualizarEstadoUsuario
};