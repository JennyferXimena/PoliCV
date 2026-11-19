const PDFDocument = require("pdfkit");

const ANCHO_LATERAL = 175;
const X = 200;
const ANCHO_CONTENIDO = 350;

function valor(texto) {
  return String(texto || "").trim();
}

function fecha(valorFecha) {
  if (!valorFecha) return "";

  const cadena = String(valorFecha);

  if (/^\d{4}-\d{2}-\d{2}/.test(cadena)) {
    const [anio,mes] =
      cadena.substring(0,10).split("-");

    return `${mes}/${anio}`;
  }

  return cadena;
}

function fondo(doc) {
  doc
    .save()
    .rect(0,0,ANCHO_LATERAL,842)
    .fill("#173F63")
    .restore();
}

function tituloLateral(doc,titulo,y) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#FFFFFF")
    .text(
      titulo.toUpperCase(),
      22,
      y,
      { width:130 }
    );

  doc
    .moveTo(22,y + 15)
    .lineTo(150,y + 15)
    .strokeColor("#4DA3E5")
    .stroke();

  return y + 25;
}

function datoLateral(doc,texto,y) {
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
        width:126,
        lineGap:1
      }
    );

  return doc.y + 5;
}

function verificarPagina(doc,y) {
  if (y < 770) return y;

  doc.addPage();
  fondo(doc);

  return 45;
}

function tituloSeccion(doc,titulo,y) {
  y = verificarPagina(doc,y);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#173F63")
    .text(
      titulo.toUpperCase(),
      X,
      y,
      {
        width:ANCHO_CONTENIDO
      }
    );

  doc
    .moveTo(X,y + 16)
    .lineTo(
      X + ANCHO_CONTENIDO,
      y + 16
    )
    .strokeColor("#4DA3E5")
    .stroke();

  return y + 27;
}

function item(
  doc,
  titulo,
  subtitulo,
  descripcion,
  y
) {
  y = verificarPagina(doc,y);

  if (valor(titulo)) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#222222")
      .text(
        valor(titulo),
        X,
        y,
        {
          width:ANCHO_CONTENIDO
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
        X,
        y,
        {
          width:ANCHO_CONTENIDO
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
        X,
        y,
        {
          width:ANCHO_CONTENIDO,
          align:"justify",
          lineGap:1
        }
      );

    y = doc.y + 7;
  }

  return y + 5;
}

function generarPDFGeneral(datos,stream) {
  const doc = new PDFDocument({
    size:"A4",
    margin:0
  });

  doc.pipe(stream);

  const perfil = datos.perfil || {};
  const curriculum = datos.curriculum || {};
  const contenido = datos.contenido || {};

  fondo(doc);

  const nombre =
    `${valor(perfil.nombres)} ${valor(perfil.apellidos)}`.trim() ||
    "Estudiante ESFOT";

  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#FFFFFF")
    .text(
      nombre,
      18,
      55,
      {
        width:140,
        align:"center"
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#D8E6F0")
    .text(
      valor(curriculum.titulo_profesional) ||
      valor(perfil.titulo_profesional) ||
      valor(perfil.carrera),
      20,
      105,
      {
        width:135,
        align:"center"
      }
    );

  let lateralY = 155;

  lateralY =
    tituloLateral(
      doc,
      "Contacto",
      lateralY
    );

  lateralY =
    datoLateral(
      doc,
      perfil.email,
      lateralY
    );

  lateralY =
    datoLateral(
      doc,
      perfil.telefono,
      lateralY
    );

  lateralY =
    datoLateral(
      doc,
      perfil.ciudad_pais,
      lateralY
    );

  lateralY =
    datoLateral(
      doc,
      perfil.linkedin_url,
      lateralY
    );

  lateralY =
    datoLateral(
      doc,
      perfil.github_url,
      lateralY
    );

  if (contenido.habilidades?.length) {
    lateralY += 12;

    lateralY =
      tituloLateral(
        doc,
        "Habilidades",
        lateralY
      );

    contenido.habilidades
      .slice(0,10)
      .forEach((habilidad) => {
        lateralY =
          datoLateral(
            doc,
            `${valor(habilidad.nombre)}${
              valor(habilidad.nivel)
                ? ` · ${habilidad.nivel}`
                : ""
            }`,
            lateralY
          );
      });
  }

  if (
    contenido.idiomas?.length &&
    lateralY < 690
  ) {
    lateralY += 12;

    lateralY =
      tituloLateral(
        doc,
        "Idiomas",
        lateralY
      );

    contenido.idiomas
      .slice(0,3)
      .forEach((idioma) => {
        lateralY =
          datoLateral(
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
    y = tituloSeccion(
      doc,
      "Perfil profesional",
      y
    );

    y = item(
      doc,
      "",
      "",
      contenido.descripcion,
      y
    );
  }

  if (
    contenido.formacion ||
    perfil.carrera
  ) {
    y = tituloSeccion(
      doc,
      "Formación académica",
      y
    );

    const formacion =
      contenido.formacion || {};

    y = item(
      doc,
      valor(formacion.titulo) ||
      valor(perfil.carrera),
      valor(formacion.institucion) ||
      "Escuela Politécnica Nacional - ESFOT",
      [
        fecha(formacion.fecha_inicio),
        formacion.en_curso
          ? "Actualidad"
          : fecha(formacion.fecha_fin)
      ]
        .filter(Boolean)
        .join(" - "),
      y
    );
  }

  if (contenido.cursos?.length) {
    y = tituloSeccion(
      doc,
      "Cursos y certificaciones",
      y
    );

    contenido.cursos.forEach((curso) => {
      y = item(
        doc,
        curso.nombre,
        curso.institucion,
        [
          fecha(curso.fecha_obtencion),
          curso.horas_duracion
            ? `${curso.horas_duracion} horas`
            : ""
        ]
          .filter(Boolean)
          .join(" · "),
        y
      );
    });
  }

  if (contenido.proyectos?.length) {
    y = tituloSeccion(
      doc,
      "Proyectos",
      y
    );

    contenido.proyectos.forEach(
      (proyecto) => {
        y = item(
          doc,
          proyecto.nombre,
          proyecto.tecnologias
            ? `Tecnologías: ${proyecto.tecnologias}`
            : "",
          proyecto.descripcion,
          y
        );
      }
    );
  }

  if (contenido.practicas?.length) {
    y = tituloSeccion(
      doc,
      "Prácticas",
      y
    );

    contenido.practicas.forEach(
      (practica) => {
        y = item(
          doc,
          practica.institucion ||
          "Práctica",
          practica.cargo_area,
          practica.descripcion,
          y
        );
      }
    );
  }

  if (contenido.experiencia?.length) {
    y = tituloSeccion(
      doc,
      "Experiencia laboral",
      y
    );

    contenido.experiencia.forEach(
      (experiencia) => {
        y = item(
          doc,
          experiencia.cargo ||
          experiencia.empresa,
          experiencia.empresa,
          experiencia.descripcion,
          y
        );
      }
    );
  }

  if (contenido.referencias?.length) {
    y = tituloSeccion(
      doc,
      "Referencias",
      y
    );

    contenido.referencias.forEach(
      (referencia) => {
        y = item(
          doc,
          referencia.nombre_completo,
          [
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

  doc.end();
}

module.exports = {
  generarPDFGeneral
};