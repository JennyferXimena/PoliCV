const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const usuarioModel = require("../models/usuarioModel");
const rolModel = require("../models/rolModel");
const perfilModel = require("../models/perfilModel");
const { enviarCodigoVerificacion, enviarCodigoRecuperacion } = require("../services/correoService");

const CORREO_INSTITUCIONAL = /^[A-Za-z0-9._%+-]+@epn\.edu\.ec$/i;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarContrasenaSegura(contrasena) {
  return typeof contrasena === "string" &&
    contrasena.length >= 8 &&
    contrasena.length <= 12 &&
    /[a-z]/.test(contrasena) &&
    /[A-Z]/.test(contrasena) &&
    /\d/.test(contrasena) &&
    /[^A-Za-z0-9]/.test(contrasena);
}

function generarVerificacion() {
  const codigo = crypto.randomInt(100000, 1000000).toString();
  const codigoHash = crypto.createHash("sha256").update(codigo).digest("hex");
  const fechaExpiracion = new Date(Date.now() + 5 * 60 * 1000);

  return { codigo, codigoHash, fechaExpiracion };
}

/* REGISTRAR */
async function registrarUsuario(req, res) {
  const { nombres, apellidos, email, password } = req.body || {};

  if (!nombres?.trim() || !apellidos?.trim() || !email || !password) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!CORREO_INSTITUCIONAL.test(correoNormalizado)) {
    return res.status(400).json({ mensaje: "Debes utilizar un correo institucional @epn.edu.ec" });
  }

  if (!validarContrasenaSegura(password)) {
    return res.status(400).json({
      mensaje: "La contraseña debe tener entre 8 y 12 caracteres, mayúscula, minúscula, número y carácter especial"
    });
  }

  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    const usuarioExistente = await usuarioModel.buscarPorEmail(correoNormalizado, conexion);

    if (usuarioExistente) {
      await conexion.rollback();
      return res.status(409).json({ mensaje: "No fue posible crear la cuenta. Verifica los datos ingresados o inicia sesión si ya tienes una cuenta." });
    }

    const rolEstudiante = await rolModel.buscarPorNombre("Estudiante", conexion);
    if (!rolEstudiante) throw new Error("El rol Estudiante no existe");

    const contrasenaHash = await bcrypt.hash(password, 12);
    const idUsuario = await usuarioModel.crearUsuario(
      rolEstudiante.id_rol,
      correoNormalizado,
      contrasenaHash,
      conexion
    );

    await perfilModel.crearPerfil(idUsuario, nombres.trim(), apellidos.trim(), conexion);

    const { codigo, codigoHash, fechaExpiracion } = generarVerificacion();
    await usuarioModel.guardarVerificacion(idUsuario,codigoHash,fechaExpiracion,conexion);
    await conexion.commit();

    try {
      await enviarCorreoVerificacion(correoNormalizado, token);

      return res.status(201).json({
        mensaje: "Cuenta creada. Revisa tu correo institucional para verificarla.",
        correo_enviado: true
      });
    } catch (errorCorreo) {
      console.error("Error enviando correo de verificación:", errorCorreo);

      return res.status(201).json({
        mensaje: "Cuenta creada, pero no se pudo enviar el correo de verificación. Puedes solicitar un reenvío.",
        correo_enviado: false
      });
    }
  } catch (error) {
    if (conexion) await conexion.rollback();

    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error al registrar el usuario" });
  } finally {
    if (conexion) conexion.release();
  }
}

/* LOGIN */
async function iniciarSesion(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ mensaje: "El correo y la contraseña son obligatorios" });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!FORMATO_CORREO.test(correoNormalizado)) {
    return res.status(400).json({ mensaje: "El correo electrónico no es válido" });
  }

  try {
    const usuario = await usuarioModel.buscarPorEmailConRol(correoNormalizado);

    if (!usuario) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    if (!usuario.estado) {
      return res.status(403).json({ mensaje: "La cuenta se encuentra desactivada" });
    }

    const contrasenaCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!contrasenaCorrecta) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    if (!usuario.correo_verificado) {
      return res.status(403).json({
        codigo: "CORREO_NO_VERIFICADO",
        mensaje: "Debes verificar tu correo institucional antes de iniciar sesión"
      });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, id_rol: usuario.id_rol, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
}

/* VERIFICAR CORREO */
async function verificarCorreo(req, res) {
  const { email, codigo } = req.body || {};

  if (!email || !codigo) {
    return res.status(400).json({
      mensaje: "El correo y el código son obligatorios"
    });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!CORREO_INSTITUCIONAL.test(correoNormalizado)) {
    return res.status(400).json({
      mensaje: "El correo institucional no es válido"
    });
  }

  if (!/^\d{6}$/.test(String(codigo))) {
    return res.status(400).json({
      mensaje: "El código debe contener 6 dígitos"
    });
  }

  try {
    const usuario = await usuarioModel.buscarPorEmail(correoNormalizado);

    if (!usuario || usuario.correo_verificado) {
      return res.status(400).json({
        mensaje: "El código no es válido"
      });
    }

    if (
      !usuario.token_verificacion_hash ||
      !usuario.token_verificacion_expira ||
      new Date(usuario.token_verificacion_expira) <= new Date()
    ) {
      return res.status(400).json({
        mensaje: "El código ha expirado. Solicita uno nuevo."
      });
    }

    const codigoHash = crypto
      .createHash("sha256")
      .update(String(codigo))
      .digest("hex");

    if (codigoHash !== usuario.token_verificacion_hash) {
      return res.status(400).json({
        mensaje: "El código no es válido"
      });
    }

    await usuarioModel.marcarCorreoVerificado(usuario.id_usuario);

    return res.status(200).json({
      mensaje: "Correo verificado correctamente. Ya puedes iniciar sesión."
    });
  } catch (error) {
    console.error("Error al verificar correo:", error);

    return res.status(500).json({
      mensaje: "Error al verificar el correo"
    });
  }
}

/* REENVIAR VERIFICACIÓN */
async function reenviarVerificacion(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      mensaje: "El correo es obligatorio"
    });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!CORREO_INSTITUCIONAL.test(correoNormalizado)) {
    return res.status(400).json({
      mensaje: "El correo institucional no es válido"
    });
  }

  try {
    const usuario = await usuarioModel.buscarPorEmail(correoNormalizado);

    if (!usuario || usuario.correo_verificado) {
      return res.status(200).json({
        mensaje: "Si la cuenta requiere verificación, enviaremos un nuevo código."
      });
    }

    const { codigo, codigoHash, fechaExpiracion } = generarVerificacion();

    await usuarioModel.guardarVerificacion(
      usuario.id_usuario,
      codigoHash,
      fechaExpiracion
    );

    await enviarCodigoVerificacion(correoNormalizado, codigo);

    return res.status(200).json({
      mensaje: "Se envió un nuevo código de verificación."
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);

    return res.status(500).json({
      mensaje: "No se pudo enviar el código de verificación"
    });
  }
}

/* RECUPERAR CONTRASEÑA */
async function solicitarRecuperacion(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ mensaje: "El correo es obligatorio" });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!CORREO_INSTITUCIONAL.test(correoNormalizado)) {
    return res.status(400).json({ mensaje: "El correo institucional no es válido" });
  }

  try {
    const usuario = await usuarioModel.buscarPorEmail(correoNormalizado);

    if (!usuario) {
      return res.status(200).json({
        mensaje: "Si el correo pertenece a una cuenta registrada, recibirás un código de recuperación."
      });
    }

    const codigo = crypto.randomInt(100000, 1000000).toString();
    const codigoHash = crypto.createHash("sha256").update(codigo).digest("hex");
    const fechaExpiracion = new Date(Date.now() + 5 * 60 * 1000);

    await pool.execute(
      "UPDATE recuperacion_password SET usado = TRUE WHERE id_usuario = ? AND usado = FALSE",
      [usuario.id_usuario]
    );

    await pool.execute(
      `INSERT INTO recuperacion_password (id_usuario,token_hash,fecha_expiracion) VALUES (?,?,?)`,
      [usuario.id_usuario, codigoHash, fechaExpiracion]
    );

    await enviarCodigoRecuperacion(correoNormalizado, codigo);

    return res.status(200).json({
      mensaje: "Si el correo pertenece a una cuenta registrada, recibirás un código de recuperación."
    });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);

    return res.status(500).json({
      mensaje: "Error al solicitar la recuperación"
    });
  }
}

/* RESTABLECER CONTRASEÑA */
async function restablecerContrasena(req, res) {
  const { email, codigo } = req.body || {};
  const nuevaContrasena = req.body?.nuevaPassword || req.body?.password;

  if (!email || !codigo || !nuevaContrasena) {
    return res.status(400).json({
      mensaje: "El correo, código y nueva contraseña son obligatorios"
    });
  }

  const correoNormalizado = email.trim().toLowerCase();

  if (!CORREO_INSTITUCIONAL.test(correoNormalizado)) {
    return res.status(400).json({ mensaje: "El correo institucional no es válido" });
  }

  if (!/^\d{6}$/.test(String(codigo))) {
    return res.status(400).json({ mensaje: "El código debe contener 6 dígitos" });
  }

  if (!validarContrasenaSegura(nuevaContrasena)) {
    return res.status(400).json({
      mensaje: "La contraseña debe tener entre 8 y 12 caracteres, mayúscula, minúscula, número y carácter especial"
    });
  }

  const codigoHash = crypto.createHash("sha256").update(String(codigo)).digest("hex");
  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    const [filas] = await conexion.execute(
      `SELECT r.id_recuperacion,r.id_usuario
       FROM recuperacion_password r
       INNER JOIN usuarios u ON r.id_usuario = u.id_usuario
       WHERE u.email = ? AND r.token_hash = ? AND r.usado = FALSE
       AND r.fecha_expiracion > NOW()
       ORDER BY r.id_recuperacion DESC LIMIT 1 FOR UPDATE`,
      [correoNormalizado, codigoHash]
    );

    const recuperacion = filas[0];

    if (!recuperacion) {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: "El código es inválido o ha expirado"
      });
    }

    const nuevoHash = await bcrypt.hash(nuevaContrasena, 12);

    await conexion.execute(
      "UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?",
      [nuevoHash, recuperacion.id_usuario]
    );

    await conexion.execute(
      "UPDATE recuperacion_password SET usado = TRUE WHERE id_recuperacion = ?",
      [recuperacion.id_recuperacion]
    );

    await conexion.commit();

    return res.status(200).json({
      mensaje: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    if (conexion) await conexion.rollback();

    console.error("Error al restablecer contraseña:", error);

    return res.status(500).json({
      mensaje: "Error al restablecer la contraseña"
    });
  } finally {
    if (conexion) conexion.release();
  }
}

module.exports = {
  registrarUsuario,
  iniciarSesion,
  verificarCorreo,
  reenviarVerificacion,
  solicitarRecuperacion,
  restablecerContrasena
};