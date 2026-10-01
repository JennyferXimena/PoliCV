const bcrypt = require("bcrypt");
const pool = require("../config/database");

const usuarioModel = require("../models/usuarioModel");
const rolModel = require("../models/rolModel");
const perfilModel = require("../models/perfilModel");

async function registrar(req, res) {
  const { email, password } = req.body;

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

module.exports = {
  registrar
};