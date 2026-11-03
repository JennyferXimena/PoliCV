const configuracionInicialModel =
  require(
    "../models/configuracionInicialModel"
  );


/* =========================================================
   OBTENER CONFIGURACIÓN
========================================================= */

async function obtenerConfiguracion(
  req,
  res
) {
  try {
    const idUsuario =
      req.usuario.id_usuario;


    const perfil =
      await configuracionInicialModel
        .obtenerPorUsuario(
          idUsuario
        );


    if (!perfil) {
      return res.status(404).json({
        mensaje:
          "No se encontró el perfil del estudiante"
      });
    }


    return res.status(200).json({
      perfil: {
        ...perfil,

        perfil_completado:
          Boolean(
            perfil.perfil_completado
          )
      }
    });


  } catch (error) {
    console.error(
      "Error al obtener configuración inicial:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudo obtener la configuración inicial"
    });
  }
}


/* =========================================================
   LISTAR CARRERAS
========================================================= */

async function listarCarreras(
  req,
  res
) {
  try {
    const carreras =
      await configuracionInicialModel
        .listarCarreras();


    return res.status(200).json({
      carreras
    });


  } catch (error) {
    console.error(
      "Error al listar carreras:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudieron obtener las carreras"
    });
  }
}


/* =========================================================
   COMPLETAR CONFIGURACIÓN
========================================================= */

async function completarConfiguracion(
  req,
  res
) {
  try {
    const idUsuario =
      req.usuario.id_usuario;


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
    } = req.body;


    /* =====================================================
       CAMPOS OBLIGATORIOS
    ===================================================== */

    if (
      !nombres?.trim() ||
      !apellidos?.trim() ||
      !telefono?.trim() ||
      !ciudad_pais?.trim() ||
      !id_carrera ||
      !estado_academico ||
      !titulo_profesional?.trim()
    ) {
      return res.status(400).json({
        mensaje:
          "Completa todos los campos obligatorios"
      });
    }


    /* =====================================================
       CARRERA
    ===================================================== */

    const idCarrera =
      Number(
        id_carrera
      );


    if (
      !Number.isInteger(
        idCarrera
      ) ||
      idCarrera <= 0
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona una carrera válida"
      });
    }


    const carrera =
      await configuracionInicialModel
        .buscarCarreraPorId(
          idCarrera
        );


    if (!carrera) {
      return res.status(400).json({
        mensaje:
          "La carrera seleccionada no es válida"
      });
    }


    /* =====================================================
       ESTADO ACADÉMICO
    ===================================================== */

    const estadosPermitidos = [
      "cursando",
      "graduado"
    ];


    if (
      !estadosPermitidos.includes(
        estado_academico
      )
    ) {
      return res.status(400).json({
        mensaje:
          "Selecciona un estado académico válido"
      });
    }


    /* =====================================================
       TELÉFONO
    ===================================================== */

    const telefonoLimpio =
      telefono.trim();


    if (
      telefonoLimpio.length < 7 ||
      telefonoLimpio.length > 20
    ) {
      return res.status(400).json({
        mensaje:
          "Ingresa un número de teléfono válido"
      });
    }


    /* =====================================================
       TÍTULO PROFESIONAL
    ===================================================== */

    const tituloLimpio =
      titulo_profesional.trim();


    if (
      tituloLimpio.length < 5 ||
      tituloLimpio.length > 150
    ) {
      return res.status(400).json({
        mensaje:
          "El título profesional debe tener entre 5 y 150 caracteres"
      });
    }


    /* =====================================================
       GUARDAR
    ===================================================== */

    const perfil =
      await configuracionInicialModel
        .completarConfiguracion(
          idUsuario,
          {
            nombres:
              nombres.trim(),

            apellidos:
              apellidos.trim(),

            telefono:
              telefonoLimpio,

            ciudad_pais:
              ciudad_pais.trim(),

            id_carrera:
              idCarrera,

            estado_academico,

            titulo_profesional:
              tituloLimpio,

            fotografia_url:
              fotografia_url?.trim() ||
              null,

            linkedin_url:
              linkedin_url?.trim() ||
              null,

            github_url:
              github_url?.trim() ||
              null
          }
        );


    return res.status(200).json({
      mensaje:
        "Configuración inicial completada correctamente",

      perfil: {
        ...perfil,

        perfil_completado:
          Boolean(
            perfil.perfil_completado
          )
      }
    });


  } catch (error) {
    console.error(
      "Error al completar configuración inicial:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudo completar la configuración inicial"
    });
  }
}


module.exports = {
  obtenerConfiguracion,
  listarCarreras,
  completarConfiguracion
};