const PDFDocument =
  require("pdfkit");


function agregarTituloSeccion(
  doc,
  titulo
) {
  doc
    .moveDown(0.8)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(titulo.toUpperCase());

  doc
    .moveDown(0.3)
    .strokeColor("#cccccc")
    .moveTo(
      doc.x,
      doc.y
    )
    .lineTo(
      550,
      doc.y
    )
    .stroke();

  doc.moveDown(0.5);
}


function generarPDFGeneral(
  datos,
  stream
) {

  const doc =
    new PDFDocument({
      size: "A4",
      margin: 45
    });


  doc.pipe(stream);


  const {
    perfil,
    curriculum,
    contenido
  } = datos;


  /* =========================================================
     ENCABEZADO
  ========================================================= */

  doc
    .font("Helvetica-Bold")
    .fontSize(23)
    .text(
      `${perfil.nombres || ""} ${perfil.apellidos || ""}`
    );


  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#555555")
    .text(
      curriculum.titulo_profesional ||
      perfil.titulo_profesional ||
      perfil.carrera ||
      ""
    );


  doc
    .moveDown(0.7)
    .fontSize(9)
    .fillColor("#222222");


  const contacto = [
    perfil.email,
    perfil.telefono,
    perfil.ciudad_pais,
    perfil.linkedin_url,
    perfil.github_url,
    perfil.sitio_web
  ]
    .filter(Boolean)
    .join(" | ");


  if (contacto) {
    doc.text(contacto);
  }


  /* =========================================================
     DESCRIPCIÓN
  ========================================================= */

  if (
    contenido.descripcion &&
    contenido.descripcion.trim()
  ) {

    agregarTituloSeccion(
      doc,
      "Perfil profesional"
    );

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#222222")
      .text(
        contenido.descripcion,
        {
          align: "justify"
        }
      );
  }


  /* =========================================================
     FORMACIÓN
  ========================================================= */

  if (contenido.formacion) {

    agregarTituloSeccion(
      doc,
      "Formación académica"
    );


    const formacion =
      contenido.formacion;


    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        formacion.titulo ||
        perfil.carrera ||
        ""
      );


    doc
      .font("Helvetica")
      .text(
        formacion.institucion ||
        ""
      );


    if (
      formacion.fecha_inicio ||
      formacion.fecha_fin
    ) {

      doc.text(
        `${formacion.fecha_inicio || ""} - ${
          formacion.en_curso
            ? "Actualidad"
            : formacion.fecha_fin || ""
        }`
      );
    }


    if (formacion.ciudad_pais) {
      doc.text(
        formacion.ciudad_pais
      );
    }


    if (formacion.descripcion) {

      doc
        .moveDown(0.3)
        .text(
          formacion.descripcion,
          {
            align: "justify"
          }
        );
    }
  }


  /* =========================================================
     IDIOMAS
  ========================================================= */

  if (
    contenido.idiomas?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Idiomas"
    );


    contenido.idiomas.forEach(
      (idioma) => {

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            `• ${idioma.idioma} - ${
              idioma.es_nativo
                ? "Nativo"
                : idioma.nivel
            }`
          );
      }
    );
  }


  /* =========================================================
     HABILIDADES
  ========================================================= */

  if (
    contenido.habilidades?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Habilidades"
    );


    contenido.habilidades.forEach(
      (habilidad) => {

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            `• ${habilidad.nombre} - ${habilidad.porcentaje}%`
          );
      }
    );
  }


  /* =========================================================
     CURSOS
  ========================================================= */

  if (
    contenido.cursos?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Cursos y certificaciones"
    );


    contenido.cursos.forEach(
      (curso) => {

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            curso.nombre
          );


        doc
          .font("Helvetica")
          .text(
            curso.institucion ||
            ""
          );


        if (curso.fecha_obtencion) {
          doc.text(
            String(
              curso.fecha_obtencion
            )
          );
        }


        doc.moveDown(0.4);
      }
    );
  }


  /* =========================================================
     PROYECTOS
  ========================================================= */

  if (
    contenido.proyectos?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Proyectos"
    );


    contenido.proyectos.forEach(
      (proyecto) => {

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            proyecto.nombre
          );


        if (
          proyecto.descripcion
        ) {

          doc
            .font("Helvetica")
            .text(
              proyecto.descripcion,
              {
                align: "justify"
              }
            );
        }


        if (
          proyecto.tecnologias
        ) {

          doc.text(
            `Tecnologías: ${proyecto.tecnologias}`
          );
        }


        doc.moveDown(0.5);
      }
    );
  }


  /* =========================================================
     PRÁCTICAS
  ========================================================= */

  if (
    contenido.practicas?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Prácticas"
    );


    contenido.practicas.forEach(
      (practica) => {

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            practica.tipo ===
              "comunitaria"
              ? "Práctica comunitaria"
              : "Práctica laboral"
          );


        doc
          .font("Helvetica")
          .text(
            `${practica.institucion || ""} ${
              practica.cargo_area
                ? `- ${practica.cargo_area}`
                : ""
            }`
          );


        if (
          practica.descripcion
        ) {
          doc.text(
            practica.descripcion
          );
        }


        if (
          practica.herramientas
        ) {
          doc.text(
            `Herramientas: ${practica.herramientas}`
          );
        }


        if (
          practica.logro_aprendizaje
        ) {
          doc.text(
            `Logro o aprendizaje: ${practica.logro_aprendizaje}`
          );
        }


        doc.moveDown(0.5);
      }
    );
  }


  /* =========================================================
     EXPERIENCIA
  ========================================================= */

  if (
    contenido.experiencia?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Experiencia laboral"
    );


    contenido.experiencia.forEach(
      (experiencia) => {

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            experiencia.cargo ||
            ""
          );


        doc
          .font("Helvetica")
          .text(
            experiencia.empresa ||
            ""
          );


        if (
          experiencia.descripcion
        ) {

          doc.text(
            experiencia.descripcion,
            {
              align: "justify"
            }
          );
        }


        doc.moveDown(0.5);
      }
    );
  }


  /* =========================================================
     REFERENCIAS
  ========================================================= */

  if (
    contenido.referencias?.length
  ) {

    agregarTituloSeccion(
      doc,
      "Referencias"
    );


    contenido.referencias.forEach(
      (referencia) => {

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(
            referencia.nombre_completo
          );


        doc
          .font("Helvetica")
          .text(
            `${referencia.cargo || ""} ${
              referencia.empresa_institucion
                ? `- ${referencia.empresa_institucion}`
                : ""
            }`
          );


        if (
          referencia.telefono
        ) {
          doc.text(
            referencia.telefono
          );
        }


        if (
          referencia.email
        ) {
          doc.text(
            referencia.email
          );
        }


        doc.moveDown(0.4);
      }
    );
  }


  doc.end();
}


module.exports = {
  generarPDFGeneral
};