const bcrypt = require("bcrypt");
const pool = require("../config/database");

const usuarioModel = require("../models/usuarioModel");
const rolModel = require("../models/rolModel");
const perfilModel = require("../models/perfilModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//REGISTRAR
async function registrar(req, res) {
  const { nombres, apellidos, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      mensaje: "El correo y la contraseña son obligatorios"
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  const correoInstitucional =
    /^[A-Za-z0-9._%+-]+@epn\.edu\.ec$/i;

  if (!correoInstitucional.test(emailNormalizado)) {
    return res.status(400).json({
      mensaje: "Debe utilizar un correo institucional @epn.edu.ec"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      mensaje: "La contraseña debe tener mínimo 8 caracteres"
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const usuarioExistente =
      await usuarioModel.buscarPorEmail(
        emailNormalizado,
        connection
      );

    if (usuarioExistente) {
      await connection.rollback();

      return res.status(409).json({
        mensaje: "El correo ya está registrado"
      });
    }

    const rolEstudiante =
      await rolModel.buscarPorNombre(
        "Estudiante",
        connection
      );

    if (!rolEstudiante) {
      throw new Error("El rol Estudiante no existe");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const idUsuario =
      await usuarioModel.crearUsuario(
        rolEstudiante.id_rol,
        emailNormalizado,
        passwordHash,
        connection
      );

    await perfilModel.crearPerfil(
      idUsuario,
      nombres.trim(),
      apellidos.trim(),
      connection
    );

    await connection.commit();

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(error);

    return res.status(500).json({
      mensaje: "Error al registrar el usuario"
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// LOGIN 
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      mensaje: "El correo y la contraseña son obligatorios"
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  try {
    const usuario =
      await usuarioModel.buscarPorEmailConRol(emailNormalizado);

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    if (!usuario.estado) {
      return res.status(403).json({
        mensaje: "La cuenta se encuentra desactivada"
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_rol: usuario.id_rol,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h"
      }
    );

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al iniciar sesión"
    });
  }
}

//solicitar recuperacion  

async function solicitarRecuperacion(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      mensaje: "El correo es obligatorio"
    });
  }

  const emailNormalizado = email.trim().toLowerCase();

  try {
    const usuario =
      await usuarioModel.buscarPorEmail(emailNormalizado);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "No existe una cuenta con ese correo"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const fechaExpiracion = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await pool.execute(
      `INSERT INTO recuperacion_password
       (id_usuario, token_hash, fecha_expiracion)
       VALUES (?, ?, ?)`,
      [
        usuario.id_usuario,
        tokenHash,
        fechaExpiracion
      ]
    );

    return res.status(200).json({
      mensaje: "Solicitud de recuperación generada correctamente",
      token_temporal: token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al solicitar recuperación"
    });
  }
}

// restablecer contrasenia

async function restablecerPassword(req, res) {
  const { token, nuevaPassword } = req.body || {};

  if (!token || !nuevaPassword) {
    return res.status(400).json({
      mensaje: "Token y nueva contraseña son obligatorios"
    });
  }

  if (nuevaPassword.length < 8) {
    return res.status(400).json({
      mensaje: "La contraseña debe tener mínimo 8 caracteres"
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM recuperacion_password
       WHERE token_hash = ?
         AND usado = FALSE
         AND fecha_expiracion > NOW()`,
      [tokenHash]
    );

    const recuperacion = rows[0];

    if (!recuperacion) {
      return res.status(400).json({
        mensaje: "Token inválido o expirado"
      });
    }

    const nuevoHash = await bcrypt.hash(
      nuevaPassword,
      12
    );

    await pool.execute(
      `UPDATE usuarios
       SET password_hash = ?
       WHERE id_usuario = ?`,
      [
        nuevoHash,
        recuperacion.id_usuario
      ]
    );

    await pool.execute(
      `UPDATE recuperacion_password
       SET usado = TRUE
       WHERE id_recuperacion = ?`,
      [recuperacion.id_recuperacion]
    );

    return res.status(200).json({
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al restablecer la contraseña"
    });
  }
}

module.exports = {
  registrar,
  login,
  solicitarRecuperacion,
  restablecerPassword
};