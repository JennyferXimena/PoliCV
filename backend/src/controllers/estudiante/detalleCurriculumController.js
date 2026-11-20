const detalleCurriculumModel = require("../../models/detalleCurriculumModel");

function contarPalabras(texto = "") {
  return String(texto).trim().split(/\s+/).filter(Boolean).length;
}

function esArray(valor) {
  return Array.isArray(valor);
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function fechaValida(fecha) {
  return Boolean(fecha) && !Number.isNaN(new Date(fecha).getTime());
}

function fechaFinalCorrecta(inicio, fin) {
  if (!fin) return true;
  return new Date(fin) >= new Date(inicio);
}

function urlValida(valor) {
  if (!valor) return true;

  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}

function correoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor || "").trim());
}

function telefonoEcuadorValido(valor) {
  if (!valor) return true;

  let numero = String(valor).replace(/[\s()-]/g, "");

  if (numero.startsWith("+593")) {
    numero = `0${numero.substring(4)}`;
  }

  return /^09\d{8}$/.test(numero) || /^0[2-7]\d{7}$/.test(numero);
}

function nivelValido(nivel) {
  return ["Básico", "Intermedio", "Avanzado"].includes(nivel);
}

function modalidadValida(modalidad) {
  return ["Presencial", "Híbrida", "Remota"].includes(modalidad);
}

async function obtenerContenido(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idCurriculum = Number(req.params.id);

    const datos = await detalleCurriculumModel.obtenerContenidoCompleto(
      idCurriculum,
      idUsuario
    );

    if (!datos) {
      return res.status(404).json({
        mensaje: "El currículum no existe"
      });
    }

    return res.status(200).json(datos);
  } catch (error) {
    console.error("Error obteniendo contenido CV:", error);

    return res.status(500).json({
      mensaje: "No se pudo obtener el contenido del currículum"
    });
  }
}

async function subirArchivo(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idCurriculum = Number(req.params.id);
    const seccion = normalizar(req.params.seccion).replace(/\s+/g, "_");

    const seccionesPermitidas = [
      "formacion",
      "idiomas",
      "cursos",
      "proyectos",
      "practicas",
      "experiencia"
    ];

    const curriculum = await detalleCurriculumModel.obtenerCurriculumUsuario(
      idCurriculum,
      idUsuario
    );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "El currículum no existe"
      });
    }

    if (!seccionesPermitidas.includes(seccion)) {
      return res.status(400).json({
        mensaje: "No se pueden subir archivos para esta sección"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        mensaje: "Selecciona un archivo"
      });
    }

    const ruta = `/uploads/curriculums/${idCurriculum}/${req.file.filename}`;

    return res.status(201).json({
      mensaje: "Archivo subido correctamente",
      archivo: {
        nombre: req.file.originalname,
        ruta,
        tamano: req.file.size
      }
    });
  } catch (error) {
    console.error("Error subiendo archivo:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensaje: "El archivo no puede superar 5 MB"
      });
    }

    return res.status(500).json({
      mensaje: error.message || "No se pudo subir el archivo"
    });
  }
}

async function guardarSeccion(req, res) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idCurriculum = Number(req.params.id);
    const seccion = req.params.seccion;
    const datos = req.body?.datos;

    const curriculum = await detalleCurriculumModel.obtenerCurriculumUsuario(
      idCurriculum,
      idUsuario
    );

    if (!curriculum) {
      return res.status(404).json({
        mensaje: "El currículum no existe"
      });
    }

    /* =====================================================
       1. DATOS PERSONALES
    ===================================================== */

    if (seccion === "datos_personales") {
      return res.status(400).json({
        mensaje: "Los datos personales se modifican desde Mi perfil"
      });
    }

    /* =====================================================
       2. DESCRIPCIÓN PERSONAL O PROFESIONAL
    ===================================================== */

    if (seccion === "descripcion") {
      const descripcion = texto(datos?.texto);
      const palabras = contarPalabras(descripcion);

      if (palabras < 30 || palabras > 120) {
        return res.status(400).json({
          mensaje: "La descripción debe tener entre 30 y 120 palabras"
        });
      }

      await detalleCurriculumModel.guardarDescripcion(
        idCurriculum,
        descripcion
      );

      return res.status(200).json({
        mensaje: "Descripción guardada correctamente"
      });
    }

    /* =====================================================
       3. FORMACIÓN ACADÉMICA
       La carrera y estado actual vienen del perfil.
       Aquí se guardan únicamente estudios adicionales.
    ===================================================== */

    if (seccion === "formacion") {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje: "La formación adicional debe enviarse como una lista"
        });
      }

      if (datos.length > 3) {
        return res.status(400).json({
          mensaje: "Solo puedes registrar hasta tres estudios adicionales"
        });
      }

      const estudios = [];

      for (let i = 0; i < datos.length; i += 1) {
        const estudio = datos[i];

        if (
          !texto(estudio.titulo) ||
          !texto(estudio.institucion) ||
          !fechaValida(estudio.fecha_inicio)
        ) {
          return res.status(400).json({
            mensaje: `Completa los datos obligatorios del estudio adicional ${i + 1}`
          });
        }

        if (
          estudio.fecha_fin &&
          !fechaFinalCorrecta(estudio.fecha_inicio, estudio.fecha_fin)
        ) {
          return res.status(400).json({
            mensaje: `La fecha final del estudio ${i + 1} no puede ser anterior a la fecha de inicio`
          });
        }

        estudios.push({
          titulo: texto(estudio.titulo),
          institucion: texto(estudio.institucion),
          fecha_inicio: estudio.fecha_inicio,
          fecha_fin: estudio.fecha_fin || null,
          ciudad_pais: texto(estudio.ciudad_pais) || null,
          evidencia_archivo: texto(estudio.evidencia_archivo) || null
        });
      }

      await detalleCurriculumModel.guardarFormacion(
        idCurriculum,
        estudios
      );

      return res.status(200).json({
        mensaje: "Formación académica guardada correctamente"
      });
    }

    /* =====================================================
       4. IDIOMAS
       Inglés obligatorio + máximo 2 adicionales.
    ===================================================== */

    if (seccion === "idiomas") {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje: "Los idiomas deben enviarse como una lista"
        });
      }

      if (datos.length < 1 || datos.length > 3) {
        return res.status(400).json({
          mensaje: "Debes registrar Inglés y como máximo dos idiomas adicionales"
        });
      }

      const catalogo = await detalleCurriculumModel.obtenerIdiomasCatalogo();

      const mapa = new Map(
        catalogo.map((item) => [
          Number(item.id_idioma_catalogo),
          item
        ])
      );

      const inglesCatalogo = catalogo.find((item) =>
        ["ingles", "english"].includes(normalizar(item.nombre))
      );

      if (!inglesCatalogo) {
        return res.status(400).json({
          mensaje: "El catálogo de idiomas no tiene configurado Inglés"
        });
      }

      const idsUsados = new Set();
      const idiomasFinales = [];
      let tieneIngles = false;

      for (const item of datos) {
        const idIdioma = Number(item.id_idioma_catalogo);
        const idioma = mapa.get(idIdioma);

        if (!idioma) {
          return res.status(400).json({
            mensaje: "Seleccionaste un idioma no válido"
          });
        }

        if (idsUsados.has(idIdioma)) {
          return res.status(400).json({
            mensaje: "No puedes repetir un idioma"
          });
        }

        if (!nivelValido(item.nivel)) {
          return res.status(400).json({
            mensaje: "Selecciona Básico, Intermedio o Avanzado para cada idioma"
          });
        }

        idsUsados.add(idIdioma);

        if (
          Number(idioma.id_idioma_catalogo) ===
          Number(inglesCatalogo.id_idioma_catalogo)
        ) {
          tieneIngles = true;
        }
        idiomasFinales.push({
          id_idioma_catalogo: idIdioma,
          idioma: idioma.nombre,
          nivel: item.nivel,
          tiene_certificado: Boolean(
            item.evidencia_archivo
          ),
          evidencia_archivo:
            texto(item.evidencia_archivo) || null
        });
      }

      if (!tieneIngles) {
        return res.status(400).json({
          mensaje: "Debes registrar el nivel de Inglés"
        });
      }

      await detalleCurriculumModel.guardarIdiomas(
        idCurriculum,
        idiomasFinales
      );

      return res.status(200).json({
        mensaje: "Idiomas guardados correctamente"
      });
    }

    /* =====================================================
       5. HABILIDADES
       5 técnicas + 5 blandas. Solo nivel.
    ===================================================== */

    if (seccion === "habilidades") {
      if (!esArray(datos)) {
        return res.status(400).json({
          mensaje: "Las habilidades deben enviarse como una lista"
        });
      }

      const catalogo = await detalleCurriculumModel.obtenerHabilidadesCatalogo(
        curriculum.id_carrera
      );

      const tecnicasEsperadas = catalogo
        .filter((item) => item.tipo === "tecnica")
        .slice(0, 5);

      const blandasEsperadas = catalogo
        .filter((item) => item.tipo === "blanda")
        .slice(0, 5);

      if (tecnicasEsperadas.length !== 5 || blandasEsperadas.length !== 5) {
        return res.status(400).json({
          mensaje: "Las habilidades predeterminadas todavía no están completas para esta carrera"
        });
      }

      if (datos.length !== 10) {
        return res.status(400).json({
          mensaje: "Debes completar las 5 habilidades técnicas y las 5 habilidades blandas"
        });
      }

      const esperadas = [...tecnicasEsperadas, ...blandasEsperadas];

      const mapa = new Map(
        esperadas.map((item) => [
          Number(item.id_habilidad_catalogo),
          item
        ])
      );

      const idsUsados = new Set();
      const resultado = [];

      for (const item of datos) {
        const idHabilidad = Number(item.id_habilidad_catalogo);
        const catalogada = mapa.get(idHabilidad);

        if (!catalogada) {
          return res.status(400).json({
            mensaje: "Seleccionaste una habilidad que no corresponde a las habilidades predeterminadas"
          });
        }

        if (idsUsados.has(idHabilidad)) {
          return res.status(400).json({
            mensaje: "No puedes repetir una habilidad"
          });
        }

        if (!nivelValido(item.nivel)) {
          return res.status(400).json({
            mensaje: "Selecciona Básico, Intermedio o Avanzado para cada habilidad"
          });
        }

        idsUsados.add(idHabilidad);

        resultado.push({
          id_habilidad_catalogo: idHabilidad,
          nombre: catalogada.nombre,
          tipo: catalogada.tipo,
          nivel: item.nivel
        });
      }

      await detalleCurriculumModel.guardarHabilidades(
        idCurriculum,
        resultado
      );

      return res.status(200).json({
        mensaje: "Habilidades guardadas correctamente"
      });
    }

    /* =====================================================
       6. CURSOS Y CERTIFICACIONES
    ===================================================== */

    if (seccion === "cursos") {
      if (!esArray(datos) || datos.length > 5) {
        return res.status(400).json({
          mensaje: "Solo puedes registrar hasta cinco cursos o certificaciones"
        });
      }

      const tipos = ["Curso", "Certificación"];
      const cursos = [];

      for (let i = 0; i < datos.length; i += 1) {
        const curso = datos[i];

        if (
          !tipos.includes(curso.tipo) ||
          !texto(curso.nombre) ||
          !texto(curso.institucion) ||
          !fechaValida(curso.fecha_obtencion)
        ) {
          return res.status(400).json({
            mensaje: `Completa los datos obligatorios del curso o certificación ${i + 1}`
          });
        }

        if (
          curso.fecha_expiracion &&
          !fechaFinalCorrecta(curso.fecha_obtencion, curso.fecha_expiracion)
        ) {
          return res.status(400).json({
            mensaje: `La fecha de expiración del registro ${i + 1} no puede ser anterior a su fecha de emisión`
          });
        }

        if (curso.horas_duracion) {
          const horas = Number(curso.horas_duracion);

          if (!Number.isInteger(horas) || horas < 1 || horas > 1000) {
            return res.status(400).json({
              mensaje: `Las horas del registro ${i + 1} deben estar entre 1 y 1000`
            });
          }
        }

        if (!urlValida(texto(curso.evidencia_url))) {
          return res.status(400).json({
            mensaje: `El enlace de evidencia del registro ${i + 1} no es válido`
          });
        }

        cursos.push({
          tipo: curso.tipo,
          nombre: texto(curso.nombre),
          institucion: texto(curso.institucion),
          fecha_obtencion: curso.fecha_obtencion,
          fecha_expiracion: curso.fecha_expiracion || null,
          horas_duracion: curso.horas_duracion
            ? Number(curso.horas_duracion)
            : null,
          descripcion: texto(curso.descripcion) || null,
          evidencia_url: texto(curso.evidencia_url) || null,
          evidencia_archivo: texto(curso.evidencia_archivo) || null
        });
      }

      await detalleCurriculumModel.guardarCursos(
        idCurriculum,
        cursos
      );

      return res.status(200).json({
        mensaje: "Cursos y certificaciones guardados correctamente"
      });
    }

    /* =====================================================
       7. PROYECTOS
    ===================================================== */

    if (seccion === "proyectos") {
      if (!esArray(datos) || datos.length < 1 || datos.length > 3) {
        return res.status(400).json({
          mensaje: "Debes registrar mínimo un proyecto y máximo tres"
        });
      }

      const tipos = ["Académico", "Personal", "Profesional"];
      const estados = ["En desarrollo", "Finalizado", "Pausado"];
      const proyectos = [];

      for (let i = 0; i < datos.length; i += 1) {
        const proyecto = datos[i];
        const palabras = contarPalabras(proyecto.descripcion);

        if (
          !texto(proyecto.nombre) ||
          !tipos.includes(proyecto.tipo_proyecto) ||
          !texto(proyecto.tecnologias) ||
          !texto(proyecto.rol) ||
          !fechaValida(proyecto.fecha_inicio) ||
          !estados.includes(proyecto.estado)
        ) {
          return res.status(400).json({
            mensaje: `Completa los datos obligatorios del proyecto ${i + 1}`
          });
        }

        if (palabras < 40 || palabras > 150) {
          return res.status(400).json({
            mensaje: `La descripción del proyecto ${i + 1} debe tener entre 40 y 150 palabras`
          });
        }

        const tecnologias = texto(proyecto.tecnologias)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (tecnologias.length > 8) {
          return res.status(400).json({
            mensaje: `El proyecto ${i + 1} puede tener máximo ocho tecnologías o herramientas`
          });
        }

        if (
          proyecto.fecha_fin &&
          !fechaFinalCorrecta(proyecto.fecha_inicio, proyecto.fecha_fin)
        ) {
          return res.status(400).json({
            mensaje: `La fecha final del proyecto ${i + 1} no puede ser anterior a la fecha de inicio`
          });
        }

        if (!urlValida(texto(proyecto.evidencia_url))) {
          return res.status(400).json({
            mensaje: `El enlace de evidencia del proyecto ${i + 1} no es válido`
          });
        }

        proyectos.push({
          nombre: texto(proyecto.nombre),
          tipo_proyecto: proyecto.tipo_proyecto,
          descripcion: texto(proyecto.descripcion),
          tecnologias: tecnologias.join(", "),
          rol: texto(proyecto.rol),
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin || null,
          estado: texto(proyecto.estado),
          evidencia_url: texto(proyecto.evidencia_url) || null,
          evidencia_archivo: texto(proyecto.evidencia_archivo) || null
        });
      }

      await detalleCurriculumModel.guardarProyectos(
        idCurriculum,
        proyectos
      );

      return res.status(200).json({
        mensaje: "Proyectos guardados correctamente"
      });
    }

    /* =====================================================
       8. PRÁCTICAS
    ===================================================== */

    if (seccion === "practicas") {
      if (!esArray(datos) || datos.length > 4) {
        return res.status(400).json({
          mensaje: "Solo puedes registrar hasta cuatro prácticas"
        });
      }

      const tiposPractica = ["comunitaria", "laboral"];
      const practicas = [];

      for (let i = 0; i < datos.length; i += 1) {
        const practica = datos[i];
        const palabras = contarPalabras(practica.actividades);

        if (
          !tiposPractica.includes(practica.tipo) ||
          !texto(practica.institucion) ||
          !texto(practica.area) ||
          !texto(practica.rol_funcion) ||
          !fechaValida(practica.fecha_inicio) ||
          !modalidadValida(practica.modalidad)
        ) {
          return res.status(400).json({
            mensaje: `Completa los datos obligatorios de la práctica ${i + 1}`
          });
        }

        if (palabras < 30 || palabras > 120) {
          return res.status(400).json({
            mensaje: `Las actividades de la práctica ${i + 1} deben tener entre 30 y 120 palabras`
          });
        }

        if (
          practica.fecha_fin &&
          !fechaFinalCorrecta(practica.fecha_inicio, practica.fecha_fin)
        ) {
          return res.status(400).json({
            mensaje: `La fecha final de la práctica ${i + 1} no puede ser anterior a la fecha de inicio`
          });
        }

        if (!urlValida(texto(practica.evidencia_url))) {
          return res.status(400).json({
            mensaje: `El enlace de evidencia de la práctica ${i + 1} no es válido`
          });
        }

        practicas.push({
          tipo: texto(practica.tipo),
          institucion: texto(practica.institucion),
          area: texto(practica.area),
          rol_funcion: texto(practica.rol_funcion),
          actividades: texto(practica.actividades),
          fecha_inicio: practica.fecha_inicio,
          fecha_fin: practica.fecha_fin || null,
          modalidad: practica.modalidad,
          evidencia_url: texto(practica.evidencia_url) || null,
          evidencia_archivo: texto(practica.evidencia_archivo) || null
        });
      }

      await detalleCurriculumModel.guardarPracticas(
        idCurriculum,
        practicas
      );

      return res.status(200).json({
        mensaje: "Prácticas guardadas correctamente"
      });
    }

    /* =====================================================
       9. EXPERIENCIA LABORAL
    ===================================================== */

    if (seccion === "experiencia") {
      if (!esArray(datos) || datos.length > 3) {
        return res.status(400).json({
          mensaje: "Solo puedes registrar hasta tres experiencias laborales"
        });
      }

      const tiposEmpleo = [
        "Tiempo completo",
        "Medio tiempo",
        "Temporal",
        "Por proyecto",
        "Freelance",
        "Contrato"
      ];

      const experiencias = [];

      for (let i = 0; i < datos.length; i += 1) {
        const experiencia = datos[i];
        const palabras = contarPalabras(experiencia.descripcion);

        if (
          !texto(experiencia.empresa) ||
          !tiposEmpleo.includes(experiencia.tipo_empleo) ||
          !fechaValida(experiencia.fecha_inicio) ||
          !modalidadValida(experiencia.modalidad) ||
          !texto(experiencia.ciudad_pais)
        ) {
          return res.status(400).json({
            mensaje: `Completa los datos obligatorios de la experiencia ${i + 1}`
          });
        }

        if (palabras < 30 || palabras > 120) {
          return res.status(400).json({
            mensaje: `La descripción de la experiencia ${i + 1} debe tener entre 30 y 120 palabras`
          });
        }

        if (
          !experiencia.actualmente &&
          experiencia.fecha_fin &&
          !fechaFinalCorrecta(experiencia.fecha_inicio, experiencia.fecha_fin)
        ) {
          return res.status(400).json({
            mensaje: `La fecha final de la experiencia ${i + 1} no puede ser anterior a la fecha de inicio`
          });
        }

        if (!urlValida(texto(experiencia.evidencia_url))) {
          return res.status(400).json({
            mensaje: `El enlace de evidencia de la experiencia ${i + 1} no es válido`
          });
        }

        experiencias.push({
          empresa: texto(experiencia.empresa),
          cargo: texto(experiencia.cargo) || null,
          area: texto(experiencia.area) || null,
          tipo_empleo: experiencia.tipo_empleo,
          fecha_inicio: experiencia.fecha_inicio,
          fecha_fin: experiencia.actualmente
            ? null
            : experiencia.fecha_fin || null,
          actualmente: Boolean(experiencia.actualmente),
          descripcion: texto(experiencia.descripcion),
          modalidad: experiencia.modalidad,
          ciudad_pais: texto(experiencia.ciudad_pais),
          evidencia_url: texto(experiencia.evidencia_url) || null,
          evidencia_archivo: texto(experiencia.evidencia_archivo) || null
        });
      }

      await detalleCurriculumModel.guardarExperiencias(
        idCurriculum,
        experiencias
      );

      return res.status(200).json({
        mensaje: "Experiencia laboral guardada correctamente"
      });
    }

    /* =====================================================
       10. REFERENCIAS
    ===================================================== */

    if (seccion === "referencias") {
      if (!esArray(datos) || datos.length > 5) {
        return res.status(400).json({
          mensaje: "Solo puedes registrar hasta cinco referencias"
        });
      }

      const tipos = ["Académica", "Laboral", "Profesional"];
      const referencias = [];

      for (let i = 0; i < datos.length; i += 1) {
        const referencia = datos[i];

        if (
          !tipos.includes(referencia.tipo_referencia) ||
          !texto(referencia.nombre_completo) ||
          !texto(referencia.cargo) ||
          !texto(referencia.empresa_institucion) ||
          !correoValido(referencia.email)
        ) {
          return res.status(400).json({
            mensaje: `Completa correctamente los datos obligatorios de la referencia ${i + 1}`
          });
        }

        if (
          referencia.telefono &&
          !telefonoEcuadorValido(referencia.telefono)
        ) {
          return res.status(400).json({
            mensaje: `El teléfono de la referencia ${i + 1} no es un número ecuatoriano válido`
          });
        }

        if (!Boolean(referencia.autorizacion)) {
          return res.status(400).json({
            mensaje: `Debes confirmar la autorización de la referencia ${i + 1}`
          });
        }

        referencias.push({
          tipo_referencia: referencia.tipo_referencia,
          nombre_completo: texto(referencia.nombre_completo),
          cargo: texto(referencia.cargo),
          empresa_institucion: texto(referencia.empresa_institucion),
          email: texto(referencia.email),
          telefono: texto(referencia.telefono) || null,
          autorizacion: true
        });
      }

      await detalleCurriculumModel.guardarReferencias(
        idCurriculum,
        referencias
      );

      return res.status(200).json({
        mensaje: "Referencias guardadas correctamente"
      });
    }

    return res.status(400).json({
      mensaje: "La sección solicitada no es válida"
    });
  } catch (error) {
    console.error("Error guardando sección:", error);

    return res.status(500).json({
      mensaje: "No se pudo guardar la sección"
    });
  }
}

module.exports = {
  obtenerContenido,
  guardarSeccion,
  subirArchivo
};
