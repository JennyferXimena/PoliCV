const perfilModel = require("../../models/perfilModel");

const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
const REGEX_TELEFONO = /^0\d{8,9}$/;

function urlValida(valor) {
  if (!valor) return true;
  if (valor.startsWith("/")) return true;

  try {
    const url = new URL(valor);
    return ["http:","https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function obtener(req,res) {
  try {
    let perfil =
      await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);

    if (!perfil) {
      await perfilModel.crearPerfil(req.usuario.id_usuario);
      perfil = await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);
    }

    return res.status(200).json({ perfil });
  } catch(error) {
    console.error("Error al obtener perfil administrador:",error);

    return res.status(500).json({
      mensaje:"No se pudo obtener el perfil"
    });
  }
}

async function actualizar(req,res) {
  const {
    nombres,
    apellidos,
    telefono = "",
    direccion = "",
    fotografia_url = "",
    linkedin_url = "",
    github_url = "",
    sitio_web = ""
  } = req.body || {};

  const nombresLimpios = String(nombres || "").trim();
  const apellidosLimpios = String(apellidos || "").trim();
  const telefonoLimpio = String(telefono || "").trim();

  if (
    nombresLimpios.length < 2 ||
    nombresLimpios.length > 100 ||
    !REGEX_NOMBRE.test(nombresLimpios)
  ) {
    return res.status(400).json({
      mensaje:"Ingresa nombres válidos"
    });
  }

  if (
    apellidosLimpios.length < 2 ||
    apellidosLimpios.length > 100 ||
    !REGEX_NOMBRE.test(apellidosLimpios)
  ) {
    return res.status(400).json({
      mensaje:"Ingresa apellidos válidos"
    });
  }

  if (
    telefonoLimpio &&
    !REGEX_TELEFONO.test(telefonoLimpio)
  ) {
    return res.status(400).json({
      mensaje:"Ingresa un número telefónico ecuatoriano válido"
    });
  }

  if (String(direccion || "").trim().length > 150) {
    return res.status(400).json({
      mensaje:"La ubicación no puede superar 150 caracteres"
    });
  }

  const enlaces = [
    fotografia_url,
    linkedin_url,
    github_url,
    sitio_web
  ];

  if (enlaces.some((valor) => !urlValida(String(valor || "").trim()))) {
    return res.status(400).json({
      mensaje:"Revisa las URL ingresadas"
    });
  }

  try {
    let perfil =
      await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);

    if (!perfil) {
      await perfilModel.crearPerfil(req.usuario.id_usuario);
    }

    await perfilModel.actualizarPerfil(
      req.usuario.id_usuario,
      {
        nombres:nombresLimpios,
        apellidos:apellidosLimpios,
        telefono:telefonoLimpio,
        direccion:String(direccion || "").trim(),
        fotografia_url:String(fotografia_url || "").trim(),
        linkedin_url:String(linkedin_url || "").trim(),
        github_url:String(github_url || "").trim(),
        sitio_web:String(sitio_web || "").trim()
      }
    );

    perfil =
      await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);

    return res.status(200).json({
      mensaje:"Perfil actualizado correctamente",
      perfil
    });
  } catch(error) {
    console.error("Error al actualizar perfil administrador:",error);

    return res.status(500).json({
      mensaje:"No se pudo actualizar el perfil"
    });
  }
}

async function actualizarFotografia(req,res) {
  if (!req.file) {
    return res.status(400).json({
      mensaje:"Selecciona una fotografía"
    });
  }

  try {
    let perfil =
      await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);

    if (!perfil) {
      await perfilModel.crearPerfil(req.usuario.id_usuario);
    }

    const fotografiaUrl =
      `/uploads/perfiles/${req.file.filename}`;

    await perfilModel.actualizarFotografia(
      req.usuario.id_usuario,
      fotografiaUrl
    );

    perfil =
      await perfilModel.obtenerPorUsuario(req.usuario.id_usuario);

    return res.status(200).json({
      mensaje:"Fotografía actualizada correctamente",
      fotografia_url:perfil.fotografia_url
    });
  } catch(error) {
    console.error(error);

    return res.status(500).json({
      mensaje:"No se pudo actualizar la fotografía"
    });
  }
}

module.exports = {
  obtener,
  actualizar,
  actualizarFotografia
};