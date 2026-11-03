import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../services/api";
import "../styles/student.css";


/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function fechaInput(valor) {
  if (!valor) {
    return "";
  }

  return String(valor).substring(0, 10);
}


function contarPalabras(texto) {
  if (!texto?.trim()) {
    return 0;
  }

  return texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}


function crearContenidoInicial() {
  return {
    descripcion: "",

    formacion: {
      fecha_inicio: "",
      fecha_fin: ""
    },

    idiomas: [],

    habilidades: [],

    cursos: [],

    proyectos: [],

    practicas: [],

    experiencia: [],

    referencias: []
  };
}


function normalizarContenido(respuesta) {
  return {
    descripcion:
      respuesta.contenido?.descripcion ||
      "",

    formacion:
      respuesta.contenido?.formacion
        ? {
            fecha_inicio:
              fechaInput(
                respuesta
                  .contenido
                  .formacion
                  .fecha_inicio
              ),

            fecha_fin:
              fechaInput(
                respuesta
                  .contenido
                  .formacion
                  .fecha_fin
              )
          }
        : {
            fecha_inicio: "",
            fecha_fin: ""
          },

    idiomas:
      respuesta.contenido?.idiomas ||
      [],

    habilidades:
      respuesta.contenido?.habilidades ||
      [],

    cursos:
      respuesta.contenido?.cursos ||
      [],

    proyectos:
      respuesta.contenido?.proyectos ||
      [],

    practicas:
      respuesta.contenido?.practicas ||
      [],

    experiencia:
      respuesta.contenido?.experiencia ||
      [],

    referencias:
      respuesta.contenido?.referencias ||
      []
  };
}


/* =========================================================
   COMPONENTE
========================================================= */

function StudentCVDetailPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();


  /* =======================================================
     ESTADOS
  ======================================================= */

  const [
    datos,
    setDatos
  ] = useState(null);


  const [
    seccionActiva,
    setSeccionActiva
  ] = useState(
    "datos_personales"
  );


  const [
    contenido,
    setContenido
  ] = useState(
    crearContenidoInicial()
  );


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    generandoPDF,
    setGenerandoPDF
  ] = useState(false);


  const [
    mejorando,
    setMejorando
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    mensaje,
    setMensaje
  ] = useState("");


  /* =======================================================
     USUARIO
  ======================================================= */

  const usuarioGuardado =
    localStorage.getItem(
      "usuario"
    ) ||
    sessionStorage.getItem(
      "usuario"
    );


  const usuario =
    usuarioGuardado
      ? JSON.parse(
          usuarioGuardado
        )
      : null;


  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    let activo = true;


    const cargarInicial =
      async () => {
        try {
          const response =
            await api.get(
              `/curriculums/${id}/contenido-fijo`
            );


          if (!activo) {
            return;
          }


          const respuesta =
            response.data;


          setDatos(
            respuesta
          );


          setContenido(
            normalizarContenido(
              respuesta
            )
          );


          if (
            respuesta.secciones
              ?.length > 0
          ) {
            setSeccionActiva(
              respuesta
                .secciones[0]
                .clave
            );
          }


        } catch (error) {
          if (!activo) {
            return;
          }


          setError(
            error.response
              ?.data
              ?.mensaje ||
            "No se pudo cargar el currículum"
          );


        } finally {
          if (activo) {
            setCargando(
              false
            );
          }
        }
      };


    cargarInicial();


    return () => {
      activo = false;
    };

  }, [id]);


  /* =======================================================
     RECARGAR DESPUÉS DE GUARDAR
  ======================================================= */

  const recargarContenido =
    async () => {
      const response =
        await api.get(
          `/curriculums/${id}/contenido-fijo`
        );


      const respuesta =
        response.data;


      setDatos(
        respuesta
      );


      setContenido(
        normalizarContenido(
          respuesta
        )
      );
    };


  /* =======================================================
     GENERAR PDF
  ======================================================= */

  const generarPDF =
    async () => {

      setError("");
      setMensaje("");
      setGenerandoPDF(true);


      try {

        const response =
          await api.get(
            `/curriculums/${id}/pdf`,
            {
              responseType:
                "blob"
            }
          );


        const archivo =
          new Blob(
            [response.data],
            {
              type:
                "application/pdf"
            }
          );


        const url =
          window.URL
            .createObjectURL(
              archivo
            );


        const enlace =
          document.createElement(
            "a"
          );


        enlace.href =
          url;


        const nombreCV =
          datos
            ?.curriculum
            ?.nombre ||
          "PoliCV";


        const nombreSeguro =
          nombreCV
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .replace(
              /[^a-zA-Z0-9-_]/g,
              "_"
            );


        enlace.download =
          `CV_${nombreSeguro}.pdf`;


        document.body
          .appendChild(
            enlace
          );


        enlace.click();


        enlace.remove();


        window.URL
          .revokeObjectURL(
            url
          );


        setMensaje(
          "PDF generado correctamente"
        );


      } catch (error) {

        console.error(
          "Error al generar PDF:",
          error
        );


        setError(
          error.response
            ?.data
            ?.mensaje ||
          "No se pudo generar el PDF"
        );


      } finally {

        setGenerandoPDF(false);

      }
    };


  /* =======================================================
     CERRAR SESIÓN
  ======================================================= */

  const cerrarSesion =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "usuario"
      );

      sessionStorage.removeItem(
        "token"
      );

      sessionStorage.removeItem(
        "usuario"
      );


      navigate(
        "/iniciar-sesion"
      );
    };


  /* =======================================================
     GUARDAR SECCIÓN
  ======================================================= */

  const guardar =
    async (
      seccion,
      informacion
    ) => {
      setError("");
      setMensaje("");
      setGuardando(true);


      try {
        const response =
          await api.put(
            `/curriculums/${id}/contenido-fijo/${seccion}`,
            {
              datos:
                informacion
            }
          );


        setMensaje(
          response.data?.mensaje ||
          "Información guardada correctamente"
        );


        await recargarContenido();


      } catch (error) {
        setError(
          error.response
            ?.data
            ?.mensaje ||
          "No se pudo guardar la información"
        );


      } finally {
        setGuardando(false);
      }
    };


  /* =======================================================
     MEJORAR DESCRIPCIÓN CON IA
  ======================================================= */

  const mejorarDescripcion =
    async () => {
      const texto =
        contenido
          .descripcion
          .trim();


      if (!texto) {
        setError(
          "Escribe primero una descripción"
        );

        return;
      }


      setError("");
      setMensaje("");
      setMejorando(true);


      try {
        const response =
          await api.post(
            "/ia/mejorar-texto",
            {
              tipo:
                "perfil_profesional",

              texto
            }
          );


        const sugerencia =
          response.data
            ?.sugerencia;


        if (!sugerencia) {
          setError(
            "La IA no devolvió una sugerencia"
          );

          return;
        }


        setContenido(
          (anterior) => ({
            ...anterior,

            descripcion:
              sugerencia
          })
        );


        setMensaje(
          "La descripción fue mejorada. Revísala antes de guardar."
        );


      } catch (error) {
        setError(
          error.response
            ?.data
            ?.mensaje ||
          "No se pudo mejorar la descripción"
        );


      } finally {
        setMejorando(false);
      }
    };


  /* =======================================================
     ELEMENTOS DE LISTAS
  ======================================================= */

  const agregarElemento =
    (
      seccion,
      elemento,
      maximo
    ) => {
      setError("");


      setContenido(
        (anterior) => {
          const lista =
            anterior[seccion] ||
            [];


          if (
            lista.length >=
            maximo
          ) {
            setError(
              `Solo puedes registrar hasta ${maximo} elementos`
            );

            return anterior;
          }


          return {
            ...anterior,

            [seccion]: [
              ...lista,
              elemento
            ]
          };
        }
      );
    };


  const modificarElemento =
    (
      seccion,
      indice,
      campo,
      valor
    ) => {
      setContenido(
        (anterior) => {
          const lista = [
            ...anterior[
              seccion
            ]
          ];


          lista[indice] = {
            ...lista[indice],

            [campo]:
              valor
          };


          return {
            ...anterior,

            [seccion]:
              lista
          };
        }
      );


      setError("");
      setMensaje("");
    };


  const eliminarElemento =
    (
      seccion,
      indice
    ) => {
      setContenido(
        (anterior) => ({
          ...anterior,

          [seccion]:
            anterior[
              seccion
            ].filter(
              (
                _,
                posicion
              ) =>
                posicion !==
                indice
            )
        })
      );


      setError("");
      setMensaje("");
    };


  /* =======================================================
     IDIOMAS
  ======================================================= */

  const cambiarIdiomaNativo =
    (
      idIdioma
    ) => {
      if (!idIdioma) {
        setContenido(
          (anterior) => ({
            ...anterior,

            idiomas:
              anterior
                .idiomas
                .filter(
                  (idioma) =>
                    !idioma.es_nativo
                )
          })
        );

        return;
      }


      const seleccionado =
        datos.catalogos
          .idiomas
          .find(
            (item) =>
              String(
                item
                  .id_idioma_catalogo
              ) ===
              String(
                idIdioma
              )
          );


      if (!seleccionado) {
        return;
      }


      setContenido(
        (anterior) => {
          const adicionales =
            anterior
              .idiomas
              .filter(
                (idioma) =>
                  !idioma.es_nativo
              );


          return {
            ...anterior,

            idiomas: [
              {
                id_idioma_catalogo:
                  seleccionado
                    .id_idioma_catalogo,

                idioma:
                  seleccionado.nombre,

                nivel:
                  "Nativo",

                es_nativo:
                  true,

                tiene_certificado:
                  false
              },

              ...adicionales
            ]
          };
        }
      );


      setError("");
    };


  const agregarIdioma =
    () => {
      const idiomaNativo =
        contenido
          .idiomas
          .find(
            (idioma) =>
              idioma.es_nativo
          );


      if (!idiomaNativo) {
        setError(
          "Selecciona primero tu idioma nativo"
        );

        return;
      }


      const adicionales =
        contenido
          .idiomas
          .filter(
            (idioma) =>
              !idioma.es_nativo
          );


      if (
        adicionales.length >=
        2
      ) {
        setError(
          "Solo puedes agregar dos idiomas adicionales"
        );

        return;
      }


      setContenido(
        (anterior) => ({
          ...anterior,

          idiomas: [
            ...anterior.idiomas,

            {
              id_idioma_catalogo:
                "",

              idioma:
                "",

              nivel:
                "Básico",

              es_nativo:
                false,

              tiene_certificado:
                false
            }
          ]
        })
      );


      setError("");
    };


  const modificarIdioma =
    (
      indice,
      campo,
      valor
    ) => {
      setContenido(
        (anterior) => {
          const lista = [
            ...anterior.idiomas
          ];


          const nuevo = {
            ...lista[indice],

            [campo]:
              valor
          };


          if (
            campo ===
            "id_idioma_catalogo"
          ) {
            const idioma =
              datos.catalogos
                .idiomas
                .find(
                  (item) =>
                    String(
                      item
                        .id_idioma_catalogo
                    ) ===
                    String(
                      valor
                    )
                );


            nuevo.idioma =
              idioma?.nombre ||
              "";
          }


          lista[indice] =
            nuevo;


          return {
            ...anterior,

            idiomas:
              lista
          };
        }
      );


      setError("");
      setMensaje("");
    };


  /* =======================================================
     HABILIDADES
  ======================================================= */

  const habilidadesPorTipo =
    (tipo) => {
      return (
        datos.catalogos
          ?.habilidades ||
        []
      ).filter(
        (item) =>
          item.tipo ===
          tipo
      );
    };


  const habilidadSeleccionada =
    (
      idHabilidad
    ) => {
      return contenido
        .habilidades
        .find(
          (item) =>
            Number(
              item
                .id_habilidad_catalogo
            ) ===
            Number(
              idHabilidad
            )
        );
    };


  const maximoHabilidad =
    (tipo) => {
      if (
        tipo === "blanda"
      ) {
        return 5;
      }


      if (
        tipo === "tecnica"
      ) {
        return 5;
      }


      return 3;
    };


  const alternarHabilidad =
    (
      habilidad
    ) => {
      const existe =
        habilidadSeleccionada(
          habilidad
            .id_habilidad_catalogo
        );


      if (existe) {
        setContenido(
          (anterior) => ({
            ...anterior,

            habilidades:
              anterior
                .habilidades
                .filter(
                  (item) =>
                    Number(
                      item
                        .id_habilidad_catalogo
                    ) !==
                    Number(
                      habilidad
                        .id_habilidad_catalogo
                    )
                )
          })
        );

        return;
      }


      const cantidad =
        contenido
          .habilidades
          .filter(
            (item) =>
              item.tipo ===
              habilidad.tipo
          )
          .length;


      if (
        cantidad >=
        maximoHabilidad(
          habilidad.tipo
        )
      ) {
        setError(
          "Alcanzaste el máximo permitido para este tipo de habilidad"
        );

        return;
      }


      setContenido(
        (anterior) => ({
          ...anterior,

          habilidades: [
            ...anterior
              .habilidades,

            {
              id_habilidad_catalogo:
                habilidad
                  .id_habilidad_catalogo,

              nombre:
                habilidad.nombre,

              tipo:
                habilidad.tipo,

              porcentaje:
                50,

              nivel:
                "Habilidad"
            }
          ]
        })
      );


      setError("");
    };


  const cambiarPorcentaje =
    (
      idHabilidad,
      porcentaje
    ) => {
      const numero =
        Number(
          porcentaje
        );


      setContenido(
        (anterior) => ({
          ...anterior,

          habilidades:
            anterior
              .habilidades
              .map(
                (item) =>
                  Number(
                    item
                      .id_habilidad_catalogo
                  ) ===
                  Number(
                    idHabilidad
                  )
                    ? {
                        ...item,

                        porcentaje:
                          numero,

                        nivel:
                          numero < 50
                            ? "Debilidad"
                            : "Habilidad"
                      }
                    : item
              )
        })
      );
    };


  /* =======================================================
     VALIDACIÓN HABILIDADES FRONTEND
  ======================================================= */

  const guardarHabilidades =
    () => {
      const blandas =
        contenido
          .habilidades
          .filter(
            (item) =>
              item.tipo ===
              "blanda"
          );


      const tecnicas =
        contenido
          .habilidades
          .filter(
            (item) =>
              item.tipo ===
              "tecnica"
          );


      const metodologicas =
        contenido
          .habilidades
          .filter(
            (item) =>
              item.tipo ===
              "metodologica"
          );


      if (
        blandas.length < 1
      ) {
        setError(
          "Selecciona al menos una habilidad blanda"
        );

        return;
      }


      if (
        tecnicas.length < 1
      ) {
        setError(
          "Selecciona al menos una habilidad técnica"
        );

        return;
      }


      if (
        metodologicas.length < 1
      ) {
        setError(
          "Selecciona al menos una habilidad metodológica"
        );

        return;
      }


      guardar(
        "habilidades",
        contenido.habilidades
      );
    };


  /* =======================================================
     CARGANDO
  ======================================================= */

  if (
    cargando ||
    !datos
  ) {
    return (
      <main
        style={{
          padding: "40px"
        }}
      >
        Cargando currículum...
      </main>
    );
  }


  const perfil =
    datos.perfil;


  const idiomaNativo =
    contenido
      .idiomas
      .find(
        (idioma) =>
          idioma.es_nativo
      );


  /* =======================================================
     RENDERIZAR SECCIÓN ACTIVA
  ======================================================= */

  const renderSeccion =
    () => {

      /* =====================================================
         1. DATOS PERSONALES
      ===================================================== */

      if (
        seccionActiva ===
        "datos_personales"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                DATOS PERSONALES
              </span>

              <h2>
                Información personal
              </h2>

              <p>
                Esta información se obtiene
                directamente de tu perfil de PoliCV.
              </p>

            </div>


            <div className="cv-detail-form">

              <p>
                <strong>
                  Nombres y apellidos:
                </strong>{" "}
                {perfil.nombres}
                {" "}
                {perfil.apellidos}
              </p>


              <p>
                <strong>
                  Título o perfil profesional:
                </strong>{" "}
                {
                  perfil
                    .titulo_profesional ||
                  "No registrado"
                }
              </p>


              <p>
                <strong>
                  Teléfono:
                </strong>{" "}
                {
                  perfil.telefono ||
                  "No registrado"
                }
              </p>


              <p>
                <strong>
                  Correo:
                </strong>{" "}
                {perfil.email}
              </p>


              <p>
                <strong>
                  Ciudad y país:
                </strong>{" "}
                {
                  perfil
                    .ciudad_pais ||
                  "No registrado"
                }
              </p>


              <p>
                <strong>
                  Carrera:
                </strong>{" "}
                {
                  perfil.carrera ||
                  "No registrada"
                }
              </p>


              <p>
                <strong>
                  Fotografía:
                </strong>{" "}
                {
                  perfil
                    .fotografia_url
                  ? "Registrada"
                  : "No registrada"
                }
              </p>


              <p>
                <strong>
                  LinkedIn:
                </strong>{" "}
                {
                  perfil
                    .linkedin_url ||
                  "No registrado"
                }
              </p>


              <p>
                <strong>
                  GitHub:
                </strong>{" "}
                {
                  perfil
                    .github_url ||
                  "No registrado"
                }
              </p>


              <Link
                to="/perfil"
                className="cv-detail-save"
              >
                Editar en Mi perfil
              </Link>

            </div>

          </section>
        );
      }


      /* =====================================================
         2. DESCRIPCIÓN PROFESIONAL
      ===================================================== */

      if (
        seccionActiva ===
        "descripcion"
      ) {
        const palabras =
          contarPalabras(
            contenido.descripcion
          );


        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                DESCRIPCIÓN PROFESIONAL
              </span>

              <h2>
                Descripción personal o profesional
              </h2>

              <p>
                Escribe entre 40 y 120 palabras
                sobre tu perfil profesional.
              </p>

            </div>


            <div className="cv-detail-form">

              <textarea
                rows="9"
                value={
                  contenido.descripcion
                }
                onChange={
                  (e) => {
                    setContenido(
                      (anterior) => ({
                        ...anterior,

                        descripcion:
                          e.target.value
                      })
                    );

                    setError("");
                    setMensaje("");
                  }
                }
                placeholder="Describe tus conocimientos, fortalezas, objetivos profesionales y áreas de interés."
              />


              <p>
                {palabras}
                {" / 120 palabras"}
              </p>


              {palabras > 0 &&
                palabras < 40 && (
                <p>
                  Faltan{" "}
                  {40 - palabras}
                  {" "}
                  palabras para llegar
                  al mínimo.
                </p>
              )}


              <button
                type="button"
                onClick={
                  mejorarDescripcion
                }
                disabled={
                  mejorando
                }
              >
                {mejorando
                  ? "Mejorando..."
                  : "Mejorar redacción con IA"}
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "descripcion",
                    {
                      texto:
                        contenido
                          .descripcion
                    }
                  )
                }
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar descripción"}
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         3. FORMACIÓN ACADÉMICA
      ===================================================== */

      if (
        seccionActiva ===
        "formacion"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                FORMACIÓN ACADÉMICA
              </span>

              <h2>
                Escuela Politécnica Nacional
              </h2>

              <p>
                La institución, carrera y estado
                académico se obtienen de tu perfil.
              </p>

            </div>


            <div className="cv-detail-form">

              <p>
                <strong>
                  Institución:
                </strong>{" "}
                Escuela Politécnica Nacional - ESFOT
              </p>


              <p>
                <strong>
                  Carrera:
                </strong>{" "}
                {perfil.carrera}
              </p>


              <p>
                <strong>
                  Estado:
                </strong>{" "}
                {perfil
                  .estado_academico ===
                "graduado"
                  ? "Graduado"
                  : "Actualmente cursando"}
              </p>


              <label>
                Fecha de inicio *
              </label>

              <input
                type="date"
                value={
                  contenido
                    .formacion
                    .fecha_inicio
                }
                onChange={
                  (e) =>
                    setContenido(
                      (anterior) => ({
                        ...anterior,

                        formacion: {
                          ...anterior
                            .formacion,

                          fecha_inicio:
                            e.target.value
                        }
                      })
                    )
                }
              />


              {perfil
                .estado_academico ===
                "graduado" && (
                <>
                  <label>
                    Fecha de finalización *
                  </label>

                  <input
                    type="date"
                    value={
                      contenido
                        .formacion
                        .fecha_fin
                    }
                    onChange={
                      (e) =>
                        setContenido(
                          (anterior) => ({
                            ...anterior,

                            formacion: {
                              ...anterior
                                .formacion,

                              fecha_fin:
                                e.target.value
                            }
                          })
                        )
                    }
                  />
                </>
              )}


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "formacion",
                    contenido.formacion
                  )
                }
              >
                Guardar formación
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         4. IDIOMAS
      ===================================================== */

      if (
        seccionActiva ===
        "idiomas"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                IDIOMAS
              </span>

              <h2>
                Idiomas
              </h2>

              <p>
                Selecciona tu idioma nativo y,
                si corresponde, máximo dos
                idiomas adicionales.
              </p>

            </div>


            <div className="cv-detail-form">

              <label>
                Idioma nativo *
              </label>


              <select
                value={
                  idiomaNativo
                    ?.id_idioma_catalogo ||
                  ""
                }
                onChange={
                  (e) =>
                    cambiarIdiomaNativo(
                      e.target.value
                    )
                }
              >

                <option value="">
                  Selecciona tu idioma nativo
                </option>


                {datos.catalogos
                  .idiomas
                  .map(
                    (idioma) => (

                      <option
                        key={
                          idioma
                            .id_idioma_catalogo
                        }
                        value={
                          idioma
                            .id_idioma_catalogo
                        }
                      >
                        {idioma.nombre}
                      </option>

                    )
                  )}

              </select>


              <h3>
                Idiomas adicionales
              </h3>


              {contenido
                .idiomas
                .map(
                  (
                    idioma,
                    indice
                  ) => {

                    if (
                      idioma.es_nativo
                    ) {
                      return null;
                    }


                    return (
                      <div
                        key={indice}
                        style={{
                          border:
                            "1px solid #ddd",

                          padding:
                            "15px",

                          marginBottom:
                            "12px"
                        }}
                      >

                        <label>
                          Idioma
                        </label>


                        <select
                          value={
                            idioma
                              .id_idioma_catalogo ||
                            ""
                          }
                          onChange={
                            (e) =>
                              modificarIdioma(
                                indice,
                                "id_idioma_catalogo",
                                e.target.value
                              )
                          }
                        >

                          <option value="">
                            Selecciona idioma
                          </option>


                          {datos.catalogos
                            .idiomas
                            .map(
                              (catalogo) => (

                                <option
                                  key={
                                    catalogo
                                      .id_idioma_catalogo
                                  }
                                  value={
                                    catalogo
                                      .id_idioma_catalogo
                                  }
                                >
                                  {
                                    catalogo
                                      .nombre
                                  }
                                </option>

                              )
                            )}

                        </select>


                        <label>
                          Nivel
                        </label>


                        <select
                          value={
                            idioma.nivel ||
                            "Básico"
                          }
                          onChange={
                            (e) =>
                              modificarIdioma(
                                indice,
                                "nivel",
                                e.target.value
                              )
                          }
                        >

                          <option value="Básico">
                            Básico
                          </option>

                          <option value="Intermedio">
                            Intermedio
                          </option>

                          <option value="Avanzado">
                            Avanzado
                          </option>

                        </select>


                        <label>

                          <input
                            type="checkbox"
                            checked={
                              Boolean(
                                idioma
                                  .tiene_certificado
                              )
                            }
                            onChange={
                              (e) =>
                                modificarIdioma(
                                  indice,
                                  "tiene_certificado",
                                  e.target.checked
                                )
                            }
                          />

                          Tengo certificado

                        </label>


                        <button
                          type="button"
                          onClick={() =>
                            eliminarElemento(
                              "idiomas",
                              indice
                            )
                          }
                        >
                          Eliminar idioma
                        </button>

                      </div>
                    );
                  }
                )}


              <button
                type="button"
                onClick={
                  agregarIdioma
                }
              >
                Agregar idioma
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "idiomas",
                    contenido.idiomas
                  )
                }
              >
                Guardar idiomas
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         5. HABILIDADES Y DEBILIDADES
      ===================================================== */

      if (
        seccionActiva ===
        "habilidades"
      ) {
        const grupos = [
          {
            tipo:
              "blanda",

            titulo:
              "Habilidades blandas",

            limite:
              "Selecciona mínimo 1 y máximo 5"
          },

          {
            tipo:
              "tecnica",

            titulo:
              "Habilidades técnicas",

            limite:
              "Selecciona mínimo 1 y máximo 5. Estas opciones dependen de tu carrera."
          },

          {
            tipo:
              "metodologica",

            titulo:
              "Habilidades metodológicas",

            limite:
              "Selecciona mínimo 1 y máximo 3"
          }
        ];


        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                HABILIDADES Y DEBILIDADES
              </span>

              <h2>
                Evalúa tus habilidades
              </h2>

              <p>
                Mueve el control entre 0 % y
                100 %. De 0 a 49 % se considera
                debilidad y desde 50 % se
                considera habilidad.
              </p>

            </div>


            <div className="cv-detail-form">

              {grupos.map(
                (grupo) => (

                  <div
                    key={
                      grupo.tipo
                    }
                    style={{
                      marginBottom:
                        "35px"
                    }}
                  >

                    <h3>
                      {grupo.titulo}
                    </h3>


                    <p>
                      {grupo.limite}
                    </p>


                    {habilidadesPorTipo(
                      grupo.tipo
                    ).map(
                      (habilidad) => {

                        const seleccionada =
                          habilidadSeleccionada(
                            habilidad
                              .id_habilidad_catalogo
                          );


                        return (
                          <div
                            key={
                              habilidad
                                .id_habilidad_catalogo
                            }
                            style={{
                              padding:
                                "12px 0",

                              borderBottom:
                                "1px solid #ddd"
                            }}
                          >

                            <label>

                              <input
                                type="checkbox"
                                checked={
                                  Boolean(
                                    seleccionada
                                  )
                                }
                                onChange={() =>
                                  alternarHabilidad(
                                    habilidad
                                  )
                                }
                              />

                              {
                                habilidad
                                  .nombre
                              }

                            </label>


                            {seleccionada && (

                              <div
                                style={{
                                  marginTop:
                                    "10px"
                                }}
                              >

                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={
                                    seleccionada
                                      .porcentaje
                                  }
                                  onChange={
                                    (e) =>
                                      cambiarPorcentaje(
                                        habilidad
                                          .id_habilidad_catalogo,

                                        e.target
                                          .value
                                      )
                                  }
                                />


                                <strong>
                                  {" "}
                                  {
                                    seleccionada
                                      .porcentaje
                                  }
                                  %
                                </strong>


                                <span>
                                  {" — "}

                                  {seleccionada
                                    .porcentaje <
                                  50
                                    ? "Debilidad"
                                    : "Habilidad"}
                                </span>

                              </div>

                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                )
              )}


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={
                  guardarHabilidades
                }
              >
                Guardar habilidades
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         6. CURSOS Y CERTIFICACIONES
      ===================================================== */

      if (
        seccionActiva ===
        "cursos"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                CURSOS Y CERTIFICACIONES
              </span>

              <h2>
                Cursos y certificaciones
              </h2>

              <p>
                Puedes registrar hasta cinco.
              </p>

            </div>


            <div className="cv-detail-form">

              {contenido
                .cursos
                .map(
                  (
                    curso,
                    indice
                  ) => (

                    <div
                      key={indice}
                      style={{
                        border:
                          "1px solid #ddd",

                        padding:
                          "15px",

                        marginBottom:
                          "15px"
                      }}
                    >

                      <label>
                        Nombre
                      </label>

                      <input
                        type="text"
                        value={
                          curso.nombre ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "cursos",
                              indice,
                              "nombre",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Institución
                      </label>

                      <input
                        type="text"
                        value={
                          curso.institucion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "cursos",
                              indice,
                              "institucion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Fecha de obtención
                      </label>

                      <input
                        type="date"
                        value={
                          fechaInput(
                            curso
                              .fecha_obtencion
                          )
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "cursos",
                              indice,
                              "fecha_obtencion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Horas de duración
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          curso
                            .horas_duracion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "cursos",
                              indice,
                              "horas_duracion",
                              e.target.value
                            )
                        }
                      />


                      <label>

                        <input
                          type="checkbox"
                          checked={
                            Boolean(
                              curso
                                .tiene_evidencia
                            )
                          }
                          onChange={
                            (e) =>
                              modificarElemento(
                                "cursos",
                                indice,
                                "tiene_evidencia",
                                e.target.checked
                              )
                          }
                        />

                        Tengo evidencia o certificado

                      </label>


                      {curso
                        .tiene_evidencia && (

                        <>
                          <label>
                            Enlace de evidencia *
                          </label>

                          <input
                            type="url"
                            value={
                              curso.enlace ||
                              ""
                            }
                            onChange={
                              (e) =>
                                modificarElemento(
                                  "cursos",
                                  indice,
                                  "enlace",
                                  e.target.value
                                )
                            }
                          />
                        </>

                      )}


                      <button
                        type="button"
                        onClick={() =>
                          eliminarElemento(
                            "cursos",
                            indice
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  )
                )}


              <button
                type="button"
                onClick={() =>
                  agregarElemento(
                    "cursos",
                    {
                      nombre: "",
                      institucion: "",
                      fecha_obtencion: "",
                      enlace: "",
                      tiene_evidencia:
                        false,
                      horas_duracion: ""
                    },
                    5
                  )
                }
              >
                Agregar curso
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "cursos",
                    contenido.cursos
                  )
                }
              >
                Guardar cursos
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         7. PROYECTOS
      ===================================================== */

      if (
        seccionActiva ===
        "proyectos"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                PROYECTOS
              </span>

              <h2>
                Proyectos
              </h2>

              <p>
                Puedes registrar hasta tres
                proyectos académicos, personales
                o profesionales.
              </p>

            </div>


            <div className="cv-detail-form">

              {contenido
                .proyectos
                .map(
                  (
                    proyecto,
                    indice
                  ) => (

                    <div
                      key={indice}
                      style={{
                        border:
                          "1px solid #ddd",

                        padding:
                          "15px",

                        marginBottom:
                          "15px"
                      }}
                    >

                      <label>
                        Nombre del proyecto
                      </label>

                      <input
                        type="text"
                        value={
                          proyecto.nombre ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "proyectos",
                              indice,
                              "nombre",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Tecnologías o herramientas
                      </label>

                      <input
                        type="text"
                        value={
                          proyecto
                            .tecnologias ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "proyectos",
                              indice,
                              "tecnologias",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Descripción e impacto
                      </label>

                      <textarea
                        rows="5"
                        value={
                          proyecto
                            .descripcion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "proyectos",
                              indice,
                              "descripcion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Enlace o evidencia
                      </label>

                      <input
                        type="url"
                        value={
                          proyecto.enlace ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "proyectos",
                              indice,
                              "enlace",
                              e.target.value
                            )
                        }
                      />


                      <button
                        type="button"
                        onClick={() =>
                          eliminarElemento(
                            "proyectos",
                            indice
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  )
                )}


              <button
                type="button"
                onClick={() =>
                  agregarElemento(
                    "proyectos",
                    {
                      nombre: "",
                      descripcion: "",
                      tecnologias: "",
                      enlace: ""
                    },
                    3
                  )
                }
              >
                Agregar proyecto
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "proyectos",
                    contenido.proyectos
                  )
                }
              >
                Guardar proyectos
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         8. PRÁCTICAS
      ===================================================== */

      if (
        seccionActiva ===
        "practicas"
      ) {
        const comunitarias =
          contenido
            .practicas
            .filter(
              (practica) =>
                practica.tipo ===
                "comunitaria"
            )
            .length;


        const laborales =
          contenido
            .practicas
            .filter(
              (practica) =>
                practica.tipo ===
                "laboral"
            )
            .length;


        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                PRÁCTICAS
              </span>

              <h2>
                Prácticas
              </h2>

              <p>
                Puedes registrar una práctica
                comunitaria y hasta tres
                prácticas laborales.
              </p>

            </div>


            <div className="cv-detail-form">

              {contenido
                .practicas
                .map(
                  (
                    practica,
                    indice
                  ) => (

                    <div
                      key={indice}
                      style={{
                        border:
                          "1px solid #ddd",

                        padding:
                          "15px",

                        marginBottom:
                          "15px"
                      }}
                    >

                      <h3>
                        {practica.tipo ===
                        "comunitaria"
                          ? "Práctica comunitaria"
                          : "Práctica laboral"}
                      </h3>


                      <label>
                        Institución
                      </label>

                      <input
                        type="text"
                        value={
                          practica
                            .institucion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "institucion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Cargo o área
                      </label>

                      <input
                        type="text"
                        value={
                          practica
                            .cargo_area ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "cargo_area",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Fecha de inicio
                      </label>

                      <input
                        type="date"
                        value={
                          fechaInput(
                            practica
                              .fecha_inicio
                          )
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "fecha_inicio",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Fecha de finalización
                      </label>

                      <input
                        type="date"
                        value={
                          fechaInput(
                            practica
                              .fecha_fin
                          )
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "fecha_fin",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Descripción
                      </label>

                      <textarea
                        rows="5"
                        value={
                          practica
                            .descripcion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "descripcion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Herramientas utilizadas
                      </label>

                      <input
                        type="text"
                        value={
                          practica
                            .herramientas ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "herramientas",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Logros o aprendizajes
                      </label>

                      <textarea
                        rows="4"
                        value={
                          practica
                            .logro_aprendizaje ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "practicas",
                              indice,
                              "logro_aprendizaje",
                              e.target.value
                            )
                        }
                      />


                      <button
                        type="button"
                        onClick={() =>
                          eliminarElemento(
                            "practicas",
                            indice
                          )
                        }
                      >
                        Eliminar práctica
                      </button>

                    </div>

                  )
                )}


              {comunitarias < 1 && (

                <button
                  type="button"
                  onClick={() =>
                    agregarElemento(
                      "practicas",
                      {
                        tipo:
                          "comunitaria",

                        institucion:
                          "",

                        cargo_area:
                          "",

                        fecha_inicio:
                          "",

                        fecha_fin:
                          "",

                        descripcion:
                          "",

                        herramientas:
                          "",

                        logro_aprendizaje:
                          ""
                      },
                      4
                    )
                  }
                >
                  Agregar práctica comunitaria
                </button>

              )}


              {laborales < 3 && (

                <button
                  type="button"
                  onClick={() =>
                    agregarElemento(
                      "practicas",
                      {
                        tipo:
                          "laboral",

                        institucion:
                          "",

                        cargo_area:
                          "",

                        fecha_inicio:
                          "",

                        fecha_fin:
                          "",

                        descripcion:
                          "",

                        herramientas:
                          "",

                        logro_aprendizaje:
                          ""
                      },
                      4
                    )
                  }
                >
                  Agregar práctica laboral
                </button>

              )}


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "practicas",
                    contenido.practicas
                  )
                }
              >
                Guardar prácticas
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         9. EXPERIENCIA LABORAL
      ===================================================== */

      if (
        seccionActiva ===
        "experiencia"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                EXPERIENCIA LABORAL
              </span>

              <h2>
                Experiencia laboral
              </h2>

              <p>
                Puedes registrar hasta tres
                experiencias laborales.
              </p>

            </div>


            <div className="cv-detail-form">

              {contenido
                .experiencia
                .map(
                  (
                    experiencia,
                    indice
                  ) => (

                    <div
                      key={indice}
                      style={{
                        border:
                          "1px solid #ddd",

                        padding:
                          "15px",

                        marginBottom:
                          "15px"
                      }}
                    >

                      <label>
                        Empresa o institución
                      </label>

                      <input
                        type="text"
                        value={
                          experiencia.empresa ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "empresa",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Cargo
                      </label>

                      <input
                        type="text"
                        value={
                          experiencia.cargo ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "cargo",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Ciudad y país
                      </label>

                      <input
                        type="text"
                        value={
                          experiencia
                            .ciudad_pais ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "ciudad_pais",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Fecha de inicio
                      </label>

                      <input
                        type="date"
                        value={
                          fechaInput(
                            experiencia
                              .fecha_inicio
                          )
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "fecha_inicio",
                              e.target.value
                            )
                        }
                      />


                      <label>

                        <input
                          type="checkbox"
                          checked={
                            Boolean(
                              experiencia
                                .actualmente
                            )
                          }
                          onChange={
                            (e) =>
                              modificarElemento(
                                "experiencia",
                                indice,
                                "actualmente",
                                e.target.checked
                              )
                          }
                        />

                        Actualmente trabajo aquí

                      </label>


                      {!experiencia
                        .actualmente && (

                        <>
                          <label>
                            Fecha de finalización
                          </label>

                          <input
                            type="date"
                            value={
                              fechaInput(
                                experiencia
                                  .fecha_fin
                              )
                            }
                            onChange={
                              (e) =>
                                modificarElemento(
                                  "experiencia",
                                  indice,
                                  "fecha_fin",
                                  e.target.value
                                )
                            }
                          />
                        </>

                      )}


                      <label>
                        Funciones y logros
                      </label>

                      <textarea
                        rows="5"
                        value={
                          experiencia
                            .descripcion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "descripcion",
                              e.target.value
                            )
                        }
                      />


                      <button
                        type="button"
                        onClick={() =>
                          eliminarElemento(
                            "experiencia",
                            indice
                          )
                        }
                      >
                        Eliminar experiencia
                      </button>

                    </div>

                  )
                )}


              <button
                type="button"
                onClick={() =>
                  agregarElemento(
                    "experiencia",
                    {
                      empresa: "",
                      cargo: "",
                      ciudad_pais:
                        "",
                      fecha_inicio:
                        "",
                      fecha_fin:
                        "",
                      actualmente:
                        false,
                      descripcion:
                        ""
                    },
                    3
                  )
                }
              >
                Agregar experiencia
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "experiencia",
                    contenido.experiencia
                  )
                }
              >
                Guardar experiencia
              </button>

            </div>

          </section>
        );
      }


      /* =====================================================
         10. REFERENCIAS
      ===================================================== */

      if (
        seccionActiva ===
        "referencias"
      ) {
        return (
          <section className="cv-detail-form-card">

            <div className="cv-detail-card-header">

              <span>
                REFERENCIAS
              </span>

              <h2>
                Referencias
              </h2>

              <p>
                Puedes registrar hasta cinco
                referencias personales o
                profesionales.
              </p>

            </div>


            <div className="cv-detail-form">

              {contenido
                .referencias
                .map(
                  (
                    referencia,
                    indice
                  ) => (

                    <div
                      key={indice}
                      style={{
                        border:
                          "1px solid #ddd",

                        padding:
                          "15px",

                        marginBottom:
                          "15px"
                      }}
                    >

                      <label>
                        Nombre y apellido
                      </label>

                      <input
                        type="text"
                        value={
                          referencia
                            .nombre_completo ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "nombre_completo",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Cargo actual
                      </label>

                      <input
                        type="text"
                        value={
                          referencia.cargo ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "cargo",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Empresa o institución
                      </label>

                      <input
                        type="text"
                        value={
                          referencia
                            .empresa_institucion ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "empresa_institucion",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Teléfono
                      </label>

                      <input
                        type="text"
                        value={
                          referencia.telefono ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "telefono",
                              e.target.value
                            )
                        }
                      />


                      <label>
                        Correo electrónico profesional
                      </label>

                      <input
                        type="email"
                        value={
                          referencia.email ||
                          ""
                        }
                        onChange={
                          (e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "email",
                              e.target.value
                            )
                        }
                      />


                      <button
                        type="button"
                        onClick={() =>
                          eliminarElemento(
                            "referencias",
                            indice
                          )
                        }
                      >
                        Eliminar referencia
                      </button>

                    </div>

                  )
                )}


              <button
                type="button"
                onClick={() =>
                  agregarElemento(
                    "referencias",
                    {
                      nombre_completo:
                        "",
                      cargo:
                        "",
                      empresa_institucion:
                        "",
                      telefono:
                        "",
                      email:
                        ""
                    },
                    5
                  )
                }
              >
                Agregar referencia
              </button>


              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando
                }
                onClick={() =>
                  guardar(
                    "referencias",
                    contenido.referencias
                  )
                }
              >
                Guardar referencias
              </button>

            </div>

          </section>
        );
      }


      return (
        <p>
          La sección seleccionada no está disponible.
        </p>
      );
    };


  /* =========================================================
     INTERFAZ PRINCIPAL
  ========================================================= */

  return (
    <div className="student-page">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="student-sidebar">

        <div className="student-brand">

          <div className="student-brand-logo">
            P
          </div>

          <div>

            <h2>
              PoliCV
            </h2>

            <span>
              Estudiante
            </span>

          </div>

        </div>


        <div className="student-profile-mini">

          <div className="student-avatar">

            {perfil.nombres
              ?.charAt(0)
              ?.toUpperCase() ||
              "E"}

          </div>


          <div>

            <strong>
              {perfil.nombres}
            </strong>

            <span>
              {usuario?.email}
            </span>

          </div>

        </div>


        <nav className="student-menu">

          <Link to="/estudiante">

            <span>
              01
            </span>

            Inicio

          </Link>


          <Link to="/perfil">

            <span>
              02
            </span>

            Mi perfil

          </Link>


          <Link
            to="/estudiante/curriculums"
            className="active"
          >

            <span>
              03
            </span>

            Mis currículums

          </Link>


          <Link to="/estudiante/asistente-ia">

            <span>
              04
            </span>

            Asistente IA

          </Link>


          <Link to="/estudiante/propuestas">

            <span>
              05
            </span>

            Propuestas de mejora

          </Link>

        </nav>


        <button
          type="button"
          className="student-logout"
          onClick={
            cerrarSesion
          }
        >
          Cerrar sesión
        </button>

      </aside>


      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="student-main">


        <header className="student-header">

          <div>

            <span className="student-header-label">
              CONTENIDO DEL CURRÍCULUM
            </span>

            <h1>
              {
                datos
                  .curriculum
                  .nombre
              }
            </h1>

            <p>
              {perfil.carrera}
            </p>

          </div>


          <div className="student-header-account">

            <div>

              <span>
                Sesión iniciada como
              </span>

              <strong>
                {usuario?.email}
              </strong>

            </div>


            <div className="student-header-avatar">

              {perfil.nombres
                ?.charAt(0)
                ?.toUpperCase() ||
                "E"}

            </div>

          </div>

        </header>


        <div className="student-content">


          {/* =================================================
              CABECERA
          ================================================= */}

          <section className="cv-detail-heading">

            <div>

              <span>
                ESTRUCTURA PREDETERMINADA
              </span>

              <h2>
                Completa tu currículum
              </h2>

              <p>
                Las secciones y opciones están
                configuradas según tu carrera.
              </p>

            </div>


            <div
              style={{
                display:
                  "flex",

                gap:
                  "10px",

                alignItems:
                  "center",

                flexWrap:
                  "wrap"
              }}
            >

              <button
                type="button"
                className="cv-detail-save"
                onClick={
                  generarPDF
                }
                disabled={
                  generandoPDF
                }
              >

                {generandoPDF
                  ? "Generando PDF..."
                  : "Generar PDF"}

              </button>


              <Link
                to="/estudiante/curriculums"
                className="cv-detail-back"
              >
                Volver a mis currículums
              </Link>

            </div>

          </section>


          {/* =================================================
              SECCIONES
          ================================================= */}

          <section className="cv-detail-tabs">

            {datos.secciones.map(
              (seccion) => (

                <button
                  key={
                    seccion.id_seccion
                  }
                  type="button"
                  className={
                    seccionActiva ===
                    seccion.clave
                      ? "active"
                      : ""
                  }
                  onClick={() => {

                    setSeccionActiva(
                      seccion.clave
                    );

                    setError("");

                    setMensaje("");

                  }}
                >
                  {seccion.nombre}
                </button>

              )
            )}

          </section>


          {/* =================================================
              MENSAJES
          ================================================= */}

          {error && (

            <div className="cv-detail-message error">

              {error}

            </div>

          )}


          {mensaje && (

            <div className="cv-detail-message success">

              {mensaje}

            </div>

          )}


          {/* =================================================
              SECCIÓN ACTIVA
          ================================================= */}

          <div
            style={{
              marginTop:
                "20px"
            }}
          >
            {renderSeccion()}
          </div>




        </div>


      </main>


    </div>
  );
}


export default StudentCVDetailPage;