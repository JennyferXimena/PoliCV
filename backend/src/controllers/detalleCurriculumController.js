const detalleCurriculumModel =
  require(
    "../models/detalleCurriculumModel"
  );


/* =========================================================
   AUXILIARES
========================================================= */

function contarPalabras(
  texto
) {
  return texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}


function esArray(
  valor
) {
  return Array.isArray(
    valor
  );
}


function booleano(
  valor
) {
  return Boolean(valor)
    ? 1
    : 0;
}


/* =========================================================
   OBTENER TODO
========================================================= */

async function obtenerContenido(
  req,
  res
) {
  try {
    const idUsuario =
      req.usuario.id_usuario;

    const idCurriculum =
      Number(req.params.id);


    const datos =
      await detalleCurriculumModel
        .obtenerContenidoCompleto(
          idCurriculum,
          idUsuario
        );


    if (!datos) {
      return res.status(404).json({
        mensaje:
          "El currículum no existe"
      });
    }


    return res.status(200).json(
      datos
    );


  } catch (error) {
    console.error(
      "Error obteniendo contenido CV:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudo obtener el contenido del currículum"
    });
  }
}


/* =========================================================
   GUARDAR UNA SECCIÓN
========================================================= */

async function guardarSeccion(
  req,
  res
) {
  try {
    const idUsuario =
      req.usuario.id_usuario;

    const idCurriculum =
      Number(req.params.id);

    const seccion =
      req.params.seccion;

    const datos =
      req.body?.datos;


    const curriculum =
      await detalleCurriculumModel
        .obtenerCurriculumUsuario(
          idCurriculum,
          idUsuario
        );


    if (!curriculum) {
      return res.status(404).json({
        mensaje:
          "El currículum no existe"
      });
    }


    /* =====================================================
       DATOS PERSONALES
    ===================================================== */

    if (
      seccion ===
      "datos_personales"
    ) {
      return res.status(400).json({
        mensaje:
          "Los datos personales se modifican desde Mi perfil"
      });
    }


    /* =====================================================
       DESCRIPCIÓN
    ===================================================== */

    if (
      seccion ===
      "descripcion"
    ) {
      const texto =
        typeof datos?.texto ===
        "string"
          ? datos.texto.trim()
          : "";


      const palabras =
        contarPalabras(
          texto
        );


      if (
        palabras < 40 ||
        palabras > 120
      ) {
        return res.status(400).json({
          mensaje:
            "La descripción debe tener entre 40 y 120 palabras"
        });
      }


      await detalleCurriculumModel
        .guardarDescripcion(
          idCurriculum,
          texto
        );


      return res.status(200).json({
        mensaje:
          "Descripción guardada correctamente"
      });
    }


    /* =====================================================
       FORMACIÓN ACADÉMICA
    ===================================================== */

    if (
      seccion ===
      "formacion"
    ) {
      if (
        !datos?.fecha_inicio
      ) {
        return res.status(400).json({
          mensaje:
            "Ingresa la fecha de inicio de tus estudios"
        });
      }


      if (
        curriculum
          .estado_academico ===
          "graduado" &&
        !datos.fecha_fin
      ) {
        return res.status(400).json({
          mensaje:
            "Un estudiante graduado debe registrar la fecha de finalización"
        });
      }


      await detalleCurriculumModel
        .guardarFormacion(
          idCurriculum,
          {
            institucion:
              "Escuela Politécnica Nacional - ESFOT",

            titulo:
              curriculum.carrera,

            fecha_inicio:
              datos.fecha_inicio,

            fecha_fin:
              curriculum
                .estado_academico ===
                "cursando"
                ? null
                : datos.fecha_fin,

            en_curso:
              curriculum
                .estado_academico ===
                "cursando"
                ? 1
                : 0,

            descripcion:
              null,

            ciudad_pais:
              "Quito, Ecuador"
          }
        );


      return res.status(200).json({
        mensaje:
          "Formación académica guardada correctamente"
      });
    }


    /* =====================================================
       IDIOMAS
    ===================================================== */

    if (
      seccion ===
      "idiomas"
    ) {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje:
            "Los idiomas deben enviarse como una lista"
        });
      }


      if (
        datos.length < 1 ||
        datos.length > 3
      ) {
        return res.status(400).json({
          mensaje:
            "Debes registrar un idioma nativo y como máximo dos idiomas adicionales"
        });
      }


      const nativos =
        datos.filter(
          (item) =>
            Boolean(
              item.es_nativo
            )
        );


      if (
        nativos.length !== 1
      ) {
        return res.status(400).json({
          mensaje:
            "Debes seleccionar exactamente un idioma nativo"
        });
      }


      const adicionales =
        datos.filter(
          (item) =>
            !Boolean(
              item.es_nativo
            )
        );


      if (
        adicionales.length > 2
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar dos idiomas adicionales"
        });
      }


      const catalogo =
        await detalleCurriculumModel
          .obtenerIdiomasCatalogo();


      const mapaIdiomas =
        new Map(
          catalogo.map(
            (item) => [
              Number(
                item.id_idioma_catalogo
              ),
              item
            ]
          )
        );


      const idsUsados =
        new Set();


      const niveles = [
        "Básico",
        "Intermedio",
        "Avanzado"
      ];


      const idiomasFinales = [];


      for (
        const item
        of datos
      ) {
        const idIdioma =
          Number(
            item.id_idioma_catalogo
          );


        const idioma =
          mapaIdiomas.get(
            idIdioma
          );


        if (!idioma) {
          return res.status(400).json({
            mensaje:
              "Seleccionaste un idioma no válido"
          });
        }


        if (
          idsUsados.has(
            idIdioma
          )
        ) {
          return res.status(400).json({
            mensaje:
              "No puedes repetir un idioma"
          });
        }


        idsUsados.add(
          idIdioma
        );


        const esNativo =
          Boolean(
            item.es_nativo
          );


        if (
          !esNativo &&
          !niveles.includes(
            item.nivel
          )
        ) {
          return res.status(400).json({
            mensaje:
              "Selecciona un nivel válido para los idiomas adicionales"
          });
        }


        idiomasFinales.push({
          id_idioma_catalogo:
            idIdioma,

          idioma:
            idioma.nombre,

          nivel:
            esNativo
              ? "Nativo"
              : item.nivel,

          es_nativo:
            esNativo
              ? 1
              : 0,

          tiene_certificado:
            booleano(
              item.tiene_certificado
            )
        });
      }


      await detalleCurriculumModel
        .guardarIdiomas(
          idCurriculum,
          idiomasFinales
        );


      return res.status(200).json({
        mensaje:
          "Idiomas guardados correctamente"
      });
    }


    /* =====================================================
       HABILIDADES
    ===================================================== */

    if (
      seccion ===
      "habilidades"
    ) {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje:
            "Las habilidades deben enviarse como una lista"
        });
      }


      const blandas =
        datos.filter(
          (item) =>
            item.tipo ===
            "blanda"
        );


      const tecnicas =
        datos.filter(
          (item) =>
            item.tipo ===
            "tecnica"
        );


      const metodologicas =
        datos.filter(
          (item) =>
            item.tipo ===
            "metodologica"
        );


      if (
        blandas.length < 1 ||
        blandas.length > 5
      ) {
        return res.status(400).json({
          mensaje:
            "Selecciona entre 1 y 5 habilidades blandas"
        });
      }


      if (
        tecnicas.length < 1 ||
        tecnicas.length > 5
      ) {
        return res.status(400).json({
          mensaje:
            "Selecciona entre 1 y 5 habilidades técnicas"
        });
      }


      if (
        metodologicas.length < 1 ||
        metodologicas.length > 3
      ) {
        return res.status(400).json({
          mensaje:
            "Selecciona entre 1 y 3 habilidades metodológicas"
        });
      }


      const catalogo =
        await detalleCurriculumModel
          .obtenerHabilidadesCatalogo(
            curriculum.id_carrera
          );


      const mapa =
        new Map(
          catalogo.map(
            (item) => [
              Number(
                item.id_habilidad_catalogo
              ),
              item
            ]
          )
        );


      const ids =
        new Set();


      const resultado = [];


      for (
        const item
        of datos
      ) {
        const idHabilidad =
          Number(
            item.id_habilidad_catalogo
          );


        const catalogada =
          mapa.get(
            idHabilidad
          );


        if (!catalogada) {
          return res.status(400).json({
            mensaje:
              "Seleccionaste una habilidad que no corresponde a tu carrera"
          });
        }


        if (
          ids.has(
            idHabilidad
          )
        ) {
          return res.status(400).json({
            mensaje:
              "No puedes repetir una habilidad"
          });
        }


        ids.add(
          idHabilidad
        );


        const porcentaje =
          Number(
            item.porcentaje
          );


        if (
          !Number.isFinite(
            porcentaje
          ) ||
          porcentaje < 0 ||
          porcentaje > 100
        ) {
          return res.status(400).json({
            mensaje:
              "El porcentaje debe estar entre 0 y 100"
          });
        }


        resultado.push({
          id_habilidad_catalogo:
            idHabilidad,

          nombre:
            catalogada.nombre,

          tipo:
            catalogada.tipo,

          porcentaje,

          nivel:
            porcentaje < 50
              ? "Debilidad"
              : "Habilidad"
        });
      }


      await detalleCurriculumModel
        .guardarHabilidades(
          idCurriculum,
          resultado
        );


      return res.status(200).json({
        mensaje:
          "Habilidades guardadas correctamente"
      });
    }


    /* =====================================================
       CURSOS
    ===================================================== */

    if (
      seccion ===
      "cursos"
    ) {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje:
            "Los cursos deben enviarse como una lista"
        });
      }


      if (
        datos.length > 5
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar hasta 5 cursos o certificaciones"
        });
      }


      for (
        const curso
        of datos
      ) {
        if (
          !curso.nombre?.trim() ||
          !curso.institucion?.trim() ||
          !curso.fecha_obtencion
        ) {
          return res.status(400).json({
            mensaje:
              "Completa los datos obligatorios de cada curso"
          });
        }


        if (
          Boolean(
            curso.tiene_evidencia
          ) &&
          !curso.enlace?.trim()
        ) {
          return res.status(400).json({
            mensaje:
              "Si indicas que tienes evidencia, debes ingresar el enlace de la evidencia"
          });
        }
      }


      const cursosFinales =
        datos.map(
          (curso) => ({
            nombre:
              curso.nombre.trim(),

            institucion:
              curso.institucion.trim(),

            fecha_obtencion:
              curso.fecha_obtencion,

            enlace:
              curso.enlace?.trim() ||
              null,

            tiene_evidencia:
              booleano(
                curso.tiene_evidencia
              ),

            horas_duracion:
              curso.horas_duracion ||
              null
          })
        );


      await detalleCurriculumModel
        .guardarCursos(
          idCurriculum,
          cursosFinales
        );


      return res.status(200).json({
        mensaje:
          "Cursos y certificaciones guardados correctamente"
      });
    }


    /* =====================================================
       PROYECTOS
    ===================================================== */

    if (
      seccion ===
      "proyectos"
    ) {
      if (
        !esArray(datos) ||
        datos.length > 3
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar hasta 3 proyectos"
        });
      }


      for (
        const proyecto
        of datos
      ) {
        if (
          !proyecto.nombre?.trim() ||
          !proyecto.descripcion?.trim() ||
          !proyecto.tecnologias?.trim()
        ) {
          return res.status(400).json({
            mensaje:
              "Completa nombre, descripción y tecnologías de cada proyecto"
          });
        }
      }


      await detalleCurriculumModel
        .guardarProyectos(
          idCurriculum,
          datos
        );


      return res.status(200).json({
        mensaje:
          "Proyectos guardados correctamente"
      });
    }


    /* =====================================================
       PRÁCTICAS
    ===================================================== */

    if (
      seccion ===
      "practicas"
    ) {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje:
            "Las prácticas deben enviarse como una lista"
        });
      }


      const comunitarias =
        datos.filter(
          (item) =>
            item.tipo ===
            "comunitaria"
        );


      const laborales =
        datos.filter(
          (item) =>
            item.tipo ===
            "laboral"
        );


      if (
        comunitarias.length > 1
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar una práctica comunitaria"
        });
      }


      if (
        laborales.length > 3
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar hasta tres prácticas laborales"
        });
      }


      for (
        const practica
        of datos
      ) {
        if (
          !practica.institucion?.trim() ||
          !practica.descripcion?.trim()
        ) {
          return res.status(400).json({
            mensaje:
              "Completa institución y descripción de cada práctica"
          });
        }
      }


      await detalleCurriculumModel
        .guardarPracticas(
          idCurriculum,
          datos
        );


      return res.status(200).json({
        mensaje:
          "Prácticas guardadas correctamente"
      });
    }


    /* =====================================================
       EXPERIENCIA
    ===================================================== */

    if (
      seccion ===
      "experiencia"
    ) {
      if (
        !esArray(datos) ||
        datos.length > 3
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar hasta tres experiencias laborales"
        });
      }


      for (
        const experiencia
        of datos
      ) {
        if (
          !experiencia.empresa?.trim() ||
          !experiencia.cargo?.trim() ||
          !experiencia.fecha_inicio ||
          !experiencia.descripcion?.trim()
        ) {
          return res.status(400).json({
            mensaje:
              "Completa los datos obligatorios de cada experiencia"
          });
        }
      }


      await detalleCurriculumModel
        .guardarExperiencias(
          idCurriculum,
          datos
        );


      return res.status(200).json({
        mensaje:
          "Experiencia laboral guardada correctamente"
      });
    }


    /* =====================================================
       REFERENCIAS
    ===================================================== */

    if (
      seccion ===
      "referencias"
    ) {
      if (
        !esArray(datos) ||
        datos.length > 5
      ) {
        return res.status(400).json({
          mensaje:
            "Solo puedes registrar hasta cinco referencias"
        });
      }


      for (
        const referencia
        of datos
      ) {
        if (
          !referencia.nombre_completo?.trim() ||
          !referencia.cargo?.trim() ||
          !referencia.empresa_institucion?.trim() ||
          !referencia.telefono?.trim() ||
          !referencia.email?.trim()
        ) {
          return res.status(400).json({
            mensaje:
              "Completa todos los datos de cada referencia"
          });
        }
      }


      await detalleCurriculumModel
        .guardarReferencias(
          idCurriculum,
          datos
        );


      return res.status(200).json({
        mensaje:
          "Referencias guardadas correctamente"
      });
    }


    return res.status(400).json({
      mensaje:
        "La sección solicitada no es válida"
    });


  } catch (error) {
    console.error(
      "Error guardando sección:",
      error
    );


    return res.status(500).json({
      mensaje:
        "No se pudo guardar la sección"
    });
  }
}


module.exports = {
  obtenerContenido,
  guardarSeccion
};