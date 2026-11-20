const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const URL_PUBLICA_BACKEND =
  process.env.URL_PUBLICA_BACKEND ||
  "http://localhost:3000";

/* =========================================================
   FUNCIONES GENERALES
========================================================= */

function valor(texto) {
  return String(texto || "").trim();
}

function fecha(valorFecha) {
  if (!valorFecha) return "";

  const cadena = String(valorFecha);

  if (/^\d{4}-\d{2}-\d{2}/.test(cadena)) {
    const [anio, mes] =
      cadena.substring(0, 10).split("-");

    return `${mes}/${anio}`;
  }

  return cadena;
}

function nombreCompleto(perfil) {
  return (
    `${valor(perfil.nombres)} ${valor(perfil.apellidos)}`
      .trim() ||
    "Estudiante ESFOT"
  );
}

function tituloPrincipal(datos) {
  return (
    valor(datos.curriculum?.titulo_profesional) ||
    valor(datos.perfil?.titulo_profesional) ||
    valor(datos.perfil?.carrera)
  );
}

function codigoPlantilla(datos) {
  const codigo =
    valor(datos.curriculum?.plantilla_codigo)
      .toLowerCase();

  if (codigo === "clasica") return "clasica";
  if (codigo === "minimalista") return "minimalista";

  return "moderna";
}

function rutaFisica(rutaPublica) {
  if (!valor(rutaPublica)) return null;

  const rutaLimpia = String(rutaPublica)
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "");

  const ruta = path.join(
    __dirname,
    "../../",
    rutaLimpia
  );

  return fs.existsSync(ruta)
    ? ruta
    : null;
}

function urlPublica(ruta) {
  if (!valor(ruta)) return "";

  if (/^https?:\/\//i.test(ruta)) {
    return ruta;
  }

  return `${URL_PUBLICA_BACKEND}${ruta.startsWith("/") ? "" : "/"}${ruta}`;
}

function esImagen(ruta) {
  return /\.(jpg|jpeg|png)$/i.test(valor(ruta));
}

function escribirLink(
  doc,
  texto,
  url,
  x,
  y,
  ancho,
  opciones = {}
) {
  if (!valor(url)) return y;

  const tamano =
    opciones.tamano || 8;

  doc
    .font("Helvetica")
    .fontSize(tamano)
    .fillColor(opciones.color || "#2F80C9")
    .text(
      texto || url,
      x,
      y,
      {
        width: ancho,
        link: url,
        underline: true,
        lineGap: 1
      }
    );

  return doc.y + 4;
}

function crearDocumento(stream) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true
  });

  doc.pipe(stream);
  return doc;
}

function nuevaPagina(doc) {
  doc.addPage({
    size: "A4",
    margin: 0
  });
}

function verificarEspacio(
  doc,
  y,
  altoNecesario,
  alNuevaPagina
) {
  if (y + altoNecesario < 800) {
    return y;
  }

  nuevaPagina(doc);

  if (alNuevaPagina) {
    alNuevaPagina();
  }

  return 55;
}

/* =========================================================
   FOTOGRAFÍA
========================================================= */

function dibujarFoto(
  doc,
  fotografiaUrl,
  x,
  y,
  ancho,
  alto,
  opciones = {}
) {
  const ruta = rutaFisica(fotografiaUrl);

  if (!ruta) return;

  try {
    if (opciones.fondo) {
      doc
        .save()
        .roundedRect(
          x - 4,
          y - 4,
          ancho + 8,
          alto + 8,
          opciones.radio || 8
        )
        .fill(opciones.fondo)
        .restore();
    }

    doc.image(
      ruta,
      x,
      y,
      {
        fit: [ancho, alto],
        align: "center",
        valign: "center"
      }
    );
  } catch (error) {
    console.error(
      "No se pudo dibujar la fotografía:",
      error.message
    );
  }
}

/* =========================================================
   ANEXOS / EVIDENCIAS
========================================================= */

function obtenerAnexos(datos) {
  const contenido =
    datos.contenido || {};

  const anexos = [];

  const agregar = (
    seccion,
    titulo,
    evidenciaArchivo,
    evidenciaUrl
  ) => {
    if (!valor(evidenciaArchivo) && !valor(evidenciaUrl)) {
      return;
    }

    anexos.push({
      seccion,
      titulo:
        valor(titulo) ||
        "Evidencia",
      archivo:
        valor(evidenciaArchivo),
      enlace:
        valor(evidenciaUrl)
    });
  };

  (contenido.formacion || []).forEach(
    (item) => {
      agregar(
        "Formación académica",
        item.titulo || item.institucion,
        item.evidencia_archivo,
        item.evidencia_url
      );
    }
  );

  (contenido.cursos || []).forEach(
    (item) => {
      agregar(
        "Cursos y certificaciones",
        item.nombre,
        item.evidencia_archivo,
        item.evidencia_url || item.enlace
      );
    }
  );

  (contenido.proyectos || []).forEach(
    (item) => {
      agregar(
        "Proyectos",
        item.nombre,
        item.evidencia_archivo,
        item.evidencia_url || item.enlace
      );
    }
  );

  (contenido.practicas || []).forEach(
    (item) => {
      agregar(
        "Prácticas",
        item.institucion,
        item.evidencia_archivo,
        item.evidencia_url
      );
    }
  );

  (contenido.experiencia || []).forEach(
    (item) => {
      agregar(
        "Experiencia laboral",
        item.cargo || item.empresa,
        item.evidencia_archivo,
        item.evidencia_url
      );
    }
  );

  return anexos;
}

function agregarPaginaAnexos(
  doc,
  datos,
  estilo = "moderna"
) {
  const anexos =
    obtenerAnexos(datos);

  if (!anexos.length) return;

  nuevaPagina(doc);

  let colorPrincipal =
    "#173F63";

  let colorSecundario =
    "#2F80C9";

  if (estilo === "clasica") {
    colorPrincipal = "#202020";
    colorSecundario = "#666666";
  }

  if (estilo === "minimalista") {
    colorPrincipal = "#23463F";
    colorSecundario = "#6FAE98";
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(colorPrincipal)
    .text(
      "ANEXOS / EVIDENCIAS",
      48,
      48
    );

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      "Documentos, imágenes y enlaces asociados a la información del currículum.",
      48,
      78,
      {
        width: 500
      }
    );

  let y = 112;

  anexos.forEach(
    (anexo, indice) => {
      y = verificarEspacio(
        doc,
        y,
        anexo.archivo &&
        esImagen(anexo.archivo)
          ? 145
          : 85
      );

      doc
        .save()
        .roundedRect(
          48,
          y,
          500,
          anexo.archivo &&
          esImagen(anexo.archivo)
            ? 130
            : 72,
          8
        )
        .fill("#F7FAF9")
        .restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(colorSecundario)
        .text(
          `${indice + 1}. ${anexo.seccion.toUpperCase()}`,
          62,
          y + 12,
          {
            width: 300
          }
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(colorPrincipal)
        .text(
          anexo.titulo,
          62,
          y + 28,
          {
            width:
              anexo.archivo &&
              esImagen(anexo.archivo)
                ? 300
                : 450
          }
        );

      let linkY = y + 47;

      if (anexo.archivo) {
        const enlaceArchivo =
          urlPublica(anexo.archivo);

        linkY = escribirLink(
          doc,
          "Ver archivo de evidencia",
          enlaceArchivo,
          62,
          linkY,
          280,
          {
            color: colorSecundario
          }
        );

        if (esImagen(anexo.archivo)) {
          const ruta =
            rutaFisica(anexo.archivo);

          if (ruta) {
            try {
              doc.image(
                ruta,
                410,
                y + 15,
                {
                  fit: [115, 95],
                  align: "center",
                  valign: "center"
                }
              );
            } catch (error) {
              console.error(
                "No se pudo mostrar miniatura:",
                error.message
              );
            }
          }
        }
      }

      if (anexo.enlace) {
        escribirLink(
          doc,
          "Abrir enlace externo",
          anexo.enlace,
          62,
          linkY,
          280,
          {
            color: colorSecundario
          }
        );
      }

      y +=
        anexo.archivo &&
        esImagen(anexo.archivo)
          ? 145
          : 87;
    }
  );
}

/* =========================================================
   PLANTILLA MODERNA
========================================================= */

const MODERNA = {
  lateral: 175,
  x: 200,
  ancho: 350,
  azulOscuro: "#173F63",
  azul: "#4DA3E5"
};

function fondoModerno(doc) {
  doc
    .save()
    .rect(
      0,
      0,
      MODERNA.lateral,
      842
    )
    .fill(MODERNA.azulOscuro)
    .restore();
}

function tituloLateralModerno(
  doc,
  titulo,
  y
) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#FFFFFF")
    .text(
      titulo.toUpperCase(),
      22,
      y,
      { width: 130 }
    );

  doc
    .moveTo(22, y + 15)
    .lineTo(150, y + 15)
    .strokeColor(MODERNA.azul)
    .stroke();

  return y + 25;
}

function datoLateralModerno(
  doc,
  texto,
  y
) {
  if (!valor(texto)) return y;

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor("#F5F8FA")
    .text(
      `• ${valor(texto)}`,
      24,
      y,
      {
        width: 126,
        lineGap: 1
      }
    );

  return doc.y + 5;
}

function verificarPaginaModerna(
  doc,
  y,
  alto = 70
) {
  if (y + alto < 790) return y;

  nuevaPagina(doc);
  fondoModerno(doc);

  return 48;
}

function tituloSeccionModerna(
  doc,
  titulo,
  y
) {
  y =
    verificarPaginaModerna(
      doc,
      y,
      45
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(MODERNA.azulOscuro)
    .text(
      titulo.toUpperCase(),
      MODERNA.x,
      y,
      {
        width: MODERNA.ancho
      }
    );

  doc
    .moveTo(
      MODERNA.x,
      y + 16
    )
    .lineTo(
      MODERNA.x + MODERNA.ancho,
      y + 16
    )
    .strokeColor(MODERNA.azul)
    .stroke();

  return y + 27;
}

function itemModerno(
  doc,
  titulo,
  subtitulo,
  descripcion,
  y
) {
  y =
    verificarPaginaModerna(
      doc,
      y,
      75
    );

  if (valor(titulo)) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#222222")
      .text(
        valor(titulo),
        MODERNA.x,
        y,
        {
          width: MODERNA.ancho
        }
      );

    y = doc.y + 2;
  }

  if (valor(subtitulo)) {
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#2F80C9")
      .text(
        valor(subtitulo),
        MODERNA.x,
        y,
        {
          width: MODERNA.ancho
        }
      );

    y = doc.y + 3;
  }

  if (valor(descripcion)) {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#444444")
      .text(
        valor(descripcion),
        MODERNA.x,
        y,
        {
          width: MODERNA.ancho,
          align: "justify",
          lineGap: 1
        }
      );

    y = doc.y + 7;
  }

  return y + 4;
}

function generarModerna(
  datos,
  stream
) {
  const doc =
    crearDocumento(stream);

  const perfil =
    datos.perfil || {};

  const contenido =
    datos.contenido || {};

  fondoModerno(doc);

  if (perfil.fotografia_url) {
    dibujarFoto(
      doc,
      perfil.fotografia_url,
      52,
      35,
      70,
      70,
      {
        fondo: "#FFFFFF",
        radio: 8
      }
    );
  }

  const nombre =
    nombreCompleto(perfil);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#FFFFFF")
    .text(
      nombre,
      18,
      perfil.fotografia_url
        ? 118
        : 55,
      {
        width: 140,
        align: "center"
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#D8E6F0")
    .text(
      tituloPrincipal(datos),
      20,
      perfil.fotografia_url
        ? 157
        : 105,
      {
        width: 135,
        align: "center"
      }
    );

  let lateralY =
    perfil.fotografia_url
      ? 205
      : 155;

  lateralY =
    tituloLateralModerno(
      doc,
      "Contacto",
      lateralY
    );

  [
    perfil.email,
    perfil.telefono,
    perfil.ciudad_pais,
    perfil.linkedin_url,
    perfil.github_url,
    perfil.sitio_web
  ].forEach((dato) => {
    lateralY =
      datoLateralModerno(
        doc,
        dato,
        lateralY
      );
  });

  if (contenido.habilidades?.length) {
    lateralY += 10;

    lateralY =
      tituloLateralModerno(
        doc,
        "Habilidades",
        lateralY
      );

    contenido.habilidades
      .slice(0, 10)
      .forEach(
        (habilidad) => {
          lateralY =
            datoLateralModerno(
              doc,
              `${valor(habilidad.nombre)}${
                valor(habilidad.nivel)
                  ? ` · ${habilidad.nivel}`
                  : ""
              }`,
              lateralY
            );
        }
      );
  }

  if (
    contenido.idiomas?.length &&
    lateralY < 710
  ) {
    lateralY += 10;

    lateralY =
      tituloLateralModerno(
        doc,
        "Idiomas",
        lateralY
      );

    contenido.idiomas
      .slice(0, 3)
      .forEach((idioma) => {
        lateralY =
          datoLateralModerno(
            doc,
            `${valor(idioma.idioma)}${
              valor(idioma.nivel)
                ? ` · ${idioma.nivel}`
                : ""
            }`,
            lateralY
          );
      });
  }

  let y = 48;

  if (valor(contenido.descripcion)) {
    y =
      tituloSeccionModerna(
        doc,
        "Perfil profesional",
        y
      );

    y =
      itemModerno(
        doc,
        "",
        "",
        contenido.descripcion,
        y
      );
  }

  y =
    tituloSeccionModerna(
      doc,
      "Formación académica",
      y
    );

  y =
    itemModerno(
      doc,
      perfil.carrera,
      "Escuela Politécnica Nacional - ESFOT",
      valor(perfil.estado_academico),
      y
    );

  (contenido.formacion || [])
    .forEach((formacion) => {
      y =
        itemModerno(
          doc,
          formacion.titulo,
          formacion.institucion,
          [
            fecha(formacion.fecha_inicio),
            formacion.fecha_fin
              ? fecha(formacion.fecha_fin)
              : "Actualidad",
            formacion.ciudad_pais
          ]
            .filter(Boolean)
            .join(" · "),
          y
        );
    });

  if (contenido.cursos?.length) {
    y =
      tituloSeccionModerna(
        doc,
        "Cursos y certificaciones",
        y
      );

    contenido.cursos.forEach(
      (curso) => {
        y =
          itemModerno(
            doc,
            curso.nombre,
            [
              curso.tipo,
              curso.institucion
            ]
              .filter(Boolean)
              .join(" · "),
            [
              fecha(curso.fecha_obtencion),
              curso.horas_duracion
                ? `${curso.horas_duracion} horas`
                : "",
              curso.descripcion
            ]
              .filter(Boolean)
              .join(" · "),
            y
          );
      }
    );
  }

  if (contenido.proyectos?.length) {
    y =
      tituloSeccionModerna(
        doc,
        "Proyectos",
        y
      );

    contenido.proyectos.forEach(
      (proyecto) => {
        y =
          itemModerno(
            doc,
            proyecto.nombre,
            [
              proyecto.tipo_proyecto,
              proyecto.rol,
              proyecto.estado
            ]
              .filter(Boolean)
              .join(" · "),
            [
              proyecto.tecnologias
                ? `Tecnologías: ${proyecto.tecnologias}`
                : "",
              proyecto.descripcion
            ]
              .filter(Boolean)
              .join("\n"),
            y
          );
      }
    );
  }

  if (contenido.practicas?.length) {
    y =
      tituloSeccionModerna(
        doc,
        "Prácticas",
        y
      );

    contenido.practicas.forEach(
      (practica) => {
        y =
          itemModerno(
            doc,
            practica.institucion ||
              "Práctica",
            [
              practica.tipo,
              practica.area ||
                practica.cargo_area,
              practica.rol_funcion,
              practica.modalidad
            ]
              .filter(Boolean)
              .join(" · "),
            practica.actividades ||
              practica.descripcion,
            y
          );
      }
    );
  }

  if (contenido.experiencia?.length) {
    y =
      tituloSeccionModerna(
        doc,
        "Experiencia laboral",
        y
      );

    contenido.experiencia.forEach(
      (experiencia) => {
        y =
          itemModerno(
            doc,
            experiencia.cargo ||
              experiencia.empresa,
            [
              experiencia.empresa,
              experiencia.tipo_empleo,
              experiencia.modalidad
            ]
              .filter(Boolean)
              .join(" · "),
            experiencia.descripcion,
            y
          );
      }
    );
  }

  if (contenido.referencias?.length) {
    y =
      tituloSeccionModerna(
        doc,
        "Referencias",
        y
      );

    contenido.referencias.forEach(
      (referencia) => {
        y =
          itemModerno(
            doc,
            referencia.nombre_completo,
            [
              referencia.tipo_referencia,
              referencia.cargo,
              referencia.empresa_institucion
            ]
              .filter(Boolean)
              .join(" · "),
            [
              referencia.email,
              referencia.telefono
            ]
              .filter(Boolean)
              .join(" · "),
            y
          );
      }
    );
  }

  agregarPaginaAnexos(
    doc,
    datos,
    "moderna"
  );

  doc.end();
}

/* =========================================================
   PLANTILLA CLÁSICA
========================================================= */

function tituloClasico(
  doc,
  titulo,
  y
) {
  y =
    verificarEspacio(
      doc,
      y,
      50
    );

  doc
    .font("Times-Bold")
    .fontSize(11)
    .fillColor("#202020")
    .text(
      titulo.toUpperCase(),
      55,
      y,
      {
        width: 485
      }
    );

  doc
    .moveTo(55, y + 17)
    .lineTo(540, y + 17)
    .strokeColor("#777777")
    .lineWidth(0.7)
    .stroke();

  return y + 29;
}

function itemClasico(
  doc,
  titulo,
  subtitulo,
  descripcion,
  y
) {
  y =
    verificarEspacio(
      doc,
      y,
      80
    );

  if (titulo) {
    doc
      .font("Times-Bold")
      .fontSize(10)
      .fillColor("#202020")
      .text(
        valor(titulo),
        55,
        y,
        { width: 485 }
      );

    y = doc.y + 2;
  }

  if (subtitulo) {
    doc
      .font("Times-Italic")
      .fontSize(8.5)
      .fillColor("#555555")
      .text(
        valor(subtitulo),
        55,
        y,
        { width: 485 }
      );

    y = doc.y + 3;
  }

  if (descripcion) {
    doc
      .font("Times-Roman")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        valor(descripcion),
        55,
        y,
        {
          width: 485,
          align: "justify",
          lineGap: 1
        }
      );

    y = doc.y + 8;
  }

  return y + 3;
}

function generarClasica(
  datos,
  stream
) {
  const doc =
    crearDocumento(stream);

  const perfil =
    datos.perfil || {};

  const contenido =
    datos.contenido || {};

  if (perfil.fotografia_url) {
    dibujarFoto(
      doc,
      perfil.fotografia_url,
      455,
      42,
      76,
      76,
      {
        fondo: "#F0F0F0",
        radio: 2
      }
    );
  }

  doc
    .font("Times-Bold")
    .fontSize(24)
    .fillColor("#1F1F1F")
    .text(
      nombreCompleto(perfil),
      55,
      45,
      {
        width:
          perfil.fotografia_url
            ? 380
            : 485
      }
    );

  doc
    .font("Times-Roman")
    .fontSize(11)
    .fillColor("#555555")
    .text(
      tituloPrincipal(datos),
      55,
      78,
      {
        width:
          perfil.fotografia_url
            ? 380
            : 485
      }
    );

  doc
    .font("Times-Roman")
    .fontSize(8.5)
    .fillColor("#555555")
    .text(
      [
        perfil.email,
        perfil.telefono,
        perfil.ciudad_pais
      ]
        .filter(Boolean)
        .join("  |  "),
      55,
      102,
      {
        width:
          perfil.fotografia_url
            ? 380
            : 485
      }
    );

  let y = 138;

  if (contenido.descripcion) {
    y =
      tituloClasico(
        doc,
        "Perfil profesional",
        y
      );

    y =
      itemClasico(
        doc,
        "",
        "",
        contenido.descripcion,
        y
      );
  }

  y =
    tituloClasico(
      doc,
      "Formación académica",
      y
    );

  y =
    itemClasico(
      doc,
      perfil.carrera,
      "Escuela Politécnica Nacional - ESFOT",
      valor(perfil.estado_academico),
      y
    );

  (contenido.formacion || []).forEach(
    (formacion) => {
      y =
        itemClasico(
          doc,
          formacion.titulo,
          formacion.institucion,
          [
            fecha(formacion.fecha_inicio),
            formacion.fecha_fin
              ? fecha(formacion.fecha_fin)
              : "Actualidad",
            formacion.ciudad_pais
          ]
            .filter(Boolean)
            .join(" · "),
          y
        );
    }
  );

  if (contenido.habilidades?.length) {
    y =
      tituloClasico(
        doc,
        "Habilidades",
        y
      );

    y =
      itemClasico(
        doc,
        "",
        "",
        contenido.habilidades
          .map(
            (item) =>
              `${valor(item.nombre)} (${valor(item.nivel)})`
          )
          .join(" · "),
        y
      );
  }

  if (contenido.idiomas?.length) {
    y =
      tituloClasico(
        doc,
        "Idiomas",
        y
      );

    y =
      itemClasico(
        doc,
        "",
        "",
        contenido.idiomas
          .map(
            (item) =>
              `${valor(item.idioma)} (${valor(item.nivel)})`
          )
          .join(" · "),
        y
      );
  }

  const grupos = [
    {
      titulo: "Cursos y certificaciones",
      lista: contenido.cursos || [],
      transformar: (item) => ({
        titulo: item.nombre,
        subtitulo: [
          item.tipo,
          item.institucion
        ]
          .filter(Boolean)
          .join(" · "),
        descripcion: [
          fecha(item.fecha_obtencion),
          item.horas_duracion
            ? `${item.horas_duracion} horas`
            : "",
          item.descripcion
        ]
          .filter(Boolean)
          .join(" · ")
      })
    },
    {
      titulo: "Proyectos",
      lista: contenido.proyectos || [],
      transformar: (item) => ({
        titulo: item.nombre,
        subtitulo: [
          item.tipo_proyecto,
          item.rol,
          item.estado
        ]
          .filter(Boolean)
          .join(" · "),
        descripcion: [
          item.tecnologias
            ? `Tecnologías: ${item.tecnologias}`
            : "",
          item.descripcion
        ]
          .filter(Boolean)
          .join("\n")
      })
    },
    {
      titulo: "Prácticas",
      lista: contenido.practicas || [],
      transformar: (item) => ({
        titulo: item.institucion,
        subtitulo: [
          item.tipo,
          item.area || item.cargo_area,
          item.rol_funcion,
          item.modalidad
        ]
          .filter(Boolean)
          .join(" · "),
        descripcion:
          item.actividades ||
          item.descripcion
      })
    },
    {
      titulo: "Experiencia laboral",
      lista: contenido.experiencia || [],
      transformar: (item) => ({
        titulo:
          item.cargo ||
          item.empresa,
        subtitulo: [
          item.empresa,
          item.tipo_empleo,
          item.modalidad
        ]
          .filter(Boolean)
          .join(" · "),
        descripcion:
          item.descripcion
      })
    },
    {
      titulo: "Referencias",
      lista: contenido.referencias || [],
      transformar: (item) => ({
        titulo:
          item.nombre_completo,
        subtitulo: [
          item.tipo_referencia,
          item.cargo,
          item.empresa_institucion
        ]
          .filter(Boolean)
          .join(" · "),
        descripcion: [
          item.email,
          item.telefono
        ]
          .filter(Boolean)
          .join(" · ")
      })
    }
  ];

  grupos.forEach((grupo) => {
    if (!grupo.lista.length) return;

    y =
      tituloClasico(
        doc,
        grupo.titulo,
        y
      );

    grupo.lista.forEach(
      (registro) => {
        const item =
          grupo.transformar(
            registro
          );

        y =
          itemClasico(
            doc,
            item.titulo,
            item.subtitulo,
            item.descripcion,
            y
          );
      }
    );
  });

  agregarPaginaAnexos(
    doc,
    datos,
    "clasica"
  );

  doc.end();
}

/* =========================================================
   PLANTILLA MINIMALISTA
========================================================= */

function normalizarLista(valorDato) {
  if (!valorDato) return [];
  return Array.isArray(valorDato)
    ? valorDato
    : [valorDato];
}

function descripcionProfesional(datos) {
  return (
    valor(datos.curriculum?.descripcion_profesional) ||
    valor(datos.contenido?.descripcion_profesional) ||
    valor(datos.contenido?.descripcion)
  );
}

function cabeceraMinimalista(doc, datos) {
  const perfil = datos.perfil || {};

  doc
    .save()
    .rect(0, 0, 14, 842)
    .fill("#6FAE98")
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(27)
    .fillColor("#1E3E37")
    .text(
      nombreCompleto(perfil),
      48,
      48,
      {
        width: perfil.fotografia_url ? 390 : 492
      }
    );

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#6FAE98")
    .text(
      tituloPrincipal(datos),
      48,
      86,
      {
        width: perfil.fotografia_url ? 390 : 492
      }
    );

  if (perfil.fotografia_url) {
    dibujarFoto(
      doc,
      perfil.fotografia_url,
      460,
      42,
      72,
      72,
      {
        fondo: "#EEF6F3",
        radio: 10
      }
    );
  }

  doc
    .save()
    .roundedRect(48, 122, 492, 42, 8)
    .fill("#F2F8F5")
    .restore();

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#506761")
    .text(
      [
        perfil.email,
        perfil.telefono,
        perfil.ciudad_pais
      ]
        .filter(Boolean)
        .join("   •   "),
      61,
      137,
      {
        width: 465
      }
    );

  return 188;
}

function cabeceraPaginaMinimalista(doc) {
  doc
    .save()
    .rect(0, 0, 14, 842)
    .fill("#6FAE98")
    .restore();

  doc
    .moveTo(48, 38)
    .lineTo(540, 38)
    .strokeColor("#D9E9E3")
    .lineWidth(1)
    .stroke();
}

function tituloMinimalista(doc, titulo, y) {
  y = verificarEspacio(
    doc,
    y,
    50,
    () => cabeceraPaginaMinimalista(doc)
  );

  doc
    .save()
    .roundedRect(48, y - 2, 7, 18, 3)
    .fill("#6FAE98")
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#1E3E37")
    .text(
      titulo.toUpperCase(),
      66,
      y,
      {
        width: 460,
        characterSpacing: 0.6
      }
    );

  doc
    .moveTo(66, y + 20)
    .lineTo(540, y + 20)
    .strokeColor("#D9E9E3")
    .lineWidth(0.8)
    .stroke();

  return y + 34;
}

function itemMinimalista(
  doc,
  titulo,
  subtitulo,
  descripcion,
  y
) {
  y = verificarEspacio(
    doc,
    y,
    88,
    () => cabeceraPaginaMinimalista(doc)
  );

  doc
    .save()
    .roundedRect(48, y - 4, 492, 1, 1)
    .fill("#EEF3F1")
    .restore();

  if (valor(titulo)) {
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor("#243F39")
      .text(
        valor(titulo),
        58,
        y + 5,
        { width: 470 }
      );

    y = doc.y + 3;
  }

  if (valor(subtitulo)) {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#6FAE98")
      .text(
        valor(subtitulo),
        58,
        y,
        { width: 470 }
      );

    y = doc.y + 4;
  }

  if (valor(descripcion)) {
    doc
      .font("Helvetica")
      .fontSize(9.1)
      .fillColor("#50615C")
      .text(
        valor(descripcion),
        58,
        y,
        {
          width: 470,
          lineGap: 2.2
        }
      );

    y = doc.y + 11;
  }

  return y + 4;
}

function bloquePerfilMinimalista(doc, textoPerfil, y) {
  if (!valor(textoPerfil)) return y;

  y = verificarEspacio(
    doc,
    y,
    115,
    () => cabeceraPaginaMinimalista(doc)
  );

  doc
    .save()
    .roundedRect(48, y, 492, 96, 10)
    .fill("#F5FAF8")
    .restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#6FAE98")
    .text(
      "SOBRE MÍ",
      62,
      y + 15
    );

  doc
    .font("Helvetica")
    .fontSize(9.2)
    .fillColor("#41554F")
    .text(
      valor(textoPerfil),
      62,
      y + 34,
      {
        width: 462,
        lineGap: 2,
        align: "justify"
      }
    );

  return y + 112;
}

function generarMinimalista(datos, stream) {
  const doc = crearDocumento(stream);

  const perfil = datos.perfil || {};
  const contenido = datos.contenido || {};
  const formaciones = normalizarLista(contenido.formacion);
  const descripcion = descripcionProfesional(datos);

  let y = cabeceraMinimalista(doc, datos);

  y = bloquePerfilMinimalista(
    doc,
    descripcion,
    y
  );

  y = tituloMinimalista(
    doc,
    "Formación académica",
    y
  );

  y = itemMinimalista(
    doc,
    perfil.carrera,
    "Escuela Politécnica Nacional - ESFOT",
    valor(perfil.estado_academico),
    y
  );

  formaciones.forEach((item) => {
    y = itemMinimalista(
      doc,
      item.titulo,
      item.institucion,
      [
        fecha(item.fecha_inicio),
        item.fecha_fin
          ? fecha(item.fecha_fin)
          : "Actualidad",
        item.ciudad_pais
      ]
        .filter(Boolean)
        .join(" · "),
      y
    );
  });

  if (
    contenido.habilidades?.length ||
    contenido.idiomas?.length
  ) {
    y = tituloMinimalista(
      doc,
      "Competencias",
      y
    );

    if (contenido.habilidades?.length) {
      y = itemMinimalista(
        doc,
        "Habilidades",
        "Técnicas y blandas",
        contenido.habilidades
          .map(
            (item) =>
              `${valor(item.nombre)} · ${valor(item.nivel)}`
          )
          .join("   |   "),
        y
      );
    }

    if (contenido.idiomas?.length) {
      y = itemMinimalista(
        doc,
        "Idiomas",
        "Nivel de dominio",
        contenido.idiomas
          .map(
            (item) =>
              `${valor(item.idioma)} · ${valor(item.nivel)}`
          )
          .join("   |   "),
        y
      );
    }
  }

  const grupos = [
    ["Cursos y certificaciones", contenido.cursos || []],
    ["Proyectos", contenido.proyectos || []],
    ["Prácticas", contenido.practicas || []],
    ["Experiencia laboral", contenido.experiencia || []],
    ["Referencias", contenido.referencias || []]
  ];

  grupos.forEach(([titulo, lista]) => {
    if (!lista.length) return;

    y = tituloMinimalista(
      doc,
      titulo,
      y
    );

    lista.forEach((item) => {
      if (titulo === "Cursos y certificaciones") {
        y = itemMinimalista(
          doc,
          item.nombre,
          [
            item.tipo,
            item.institucion
          ]
            .filter(Boolean)
            .join(" · "),
          [
            fecha(item.fecha_obtencion),
            item.fecha_expiracion
              ? `Expira: ${fecha(item.fecha_expiracion)}`
              : "",
            item.horas_duracion
              ? `${item.horas_duracion} horas`
              : "",
            item.descripcion
          ]
            .filter(Boolean)
            .join(" · "),
          y
        );
      }

      if (titulo === "Proyectos") {
        y = itemMinimalista(
          doc,
          item.nombre,
          [
            item.tipo_proyecto,
            item.rol,
            item.estado
          ]
            .filter(Boolean)
            .join(" · "),
          [
            [
              fecha(item.fecha_inicio),
              item.fecha_fin
                ? fecha(item.fecha_fin)
                : "Actualidad"
            ]
              .filter(Boolean)
              .join(" — "),
            item.tecnologias
              ? `Tecnologías: ${item.tecnologias}`
              : "",
            item.descripcion
          ]
            .filter(Boolean)
            .join("\n"),
          y
        );
      }

      if (titulo === "Prácticas") {
        y = itemMinimalista(
          doc,
          item.institucion,
          [
            item.tipo,
            item.area || item.cargo_area,
            item.rol_funcion,
            item.modalidad
          ]
            .filter(Boolean)
            .join(" · "),
          [
            [
              fecha(item.fecha_inicio),
              item.fecha_fin
                ? fecha(item.fecha_fin)
                : "Actualidad"
            ]
              .filter(Boolean)
              .join(" — "),
            item.actividades || item.descripcion,
            item.herramientas
              ? `Herramientas: ${item.herramientas}`
              : "",
            item.logro_aprendizaje
              ? `Aprendizaje: ${item.logro_aprendizaje}`
              : ""
          ]
            .filter(Boolean)
            .join("\n"),
          y
        );
      }

      if (titulo === "Experiencia laboral") {
        y = itemMinimalista(
          doc,
          item.cargo || item.empresa,
          [
            item.empresa,
            item.area,
            item.tipo_empleo,
            item.modalidad
          ]
            .filter(Boolean)
            .join(" · "),
          [
            [
              fecha(item.fecha_inicio),
              item.actualmente
                ? "Actualidad"
                : fecha(item.fecha_fin),
              item.ciudad_pais
            ]
              .filter(Boolean)
              .join(" · "),
            item.descripcion
          ]
            .filter(Boolean)
            .join("\n"),
          y
        );
      }

      if (titulo === "Referencias") {
        y = itemMinimalista(
          doc,
          item.nombre_completo,
          [
            item.tipo_referencia,
            item.cargo,
            item.empresa_institucion
          ]
            .filter(Boolean)
            .join(" · "),
          [
            item.email,
            item.telefono
          ]
            .filter(Boolean)
            .join(" · "),
          y
        );
      }
    });
  });

  agregarPaginaAnexos(
    doc,
    datos,
    "minimalista"
  );

  doc.end();
}

/* =========================================================
   SELECCIONAR PLANTILLA
========================================================= */

function generarPDFGeneral(
  datos,
  stream
) {
  const plantilla =
    codigoPlantilla(datos);

  if (plantilla === "clasica") {
    return generarClasica(
      datos,
      stream
    );
  }

  if (plantilla === "minimalista") {
    return generarMinimalista(
      datos,
      stream
    );
  }

  return generarModerna(
    datos,
    stream
  );
}

module.exports = {
  generarPDFGeneral
};
