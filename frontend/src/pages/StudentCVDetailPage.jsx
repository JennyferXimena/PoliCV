import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../services/api";
import "../styles/student.css";


/* =========================================================
   CONFIGURACIÓN DE SECCIONES
========================================================= */

const SECCIONES = {

  formacion: {
    titulo: "Formación académica",

    descripcion:
      "Registra tus estudios y formación académica.",

    id: "id_formacion",

    campos: [
      {
        nombre: "institucion",
        label: "Institución",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "titulo",
        label: "Título obtenido",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "fecha_inicio",
        label: "Fecha de inicio",
        tipo: "date"
      },
      {
        nombre: "fecha_fin",
        label: "Fecha de fin",
        tipo: "date"
      },
      {
        nombre: "en_curso",
        label: "Actualmente cursando",
        tipo: "checkbox"
      },
      {
        nombre: "descripcion",
        label: "Descripción",
        tipo: "textarea"
      }
    ]
  },


  experiencias: {
    titulo: "Experiencia laboral",

    descripcion:
      "Registra empleos, actividades profesionales o experiencia laboral.",

    id: "id_experiencia",

    campos: [
      {
        nombre: "empresa",
        label: "Empresa",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "cargo",
        label: "Cargo",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "fecha_inicio",
        label: "Fecha de inicio",
        tipo: "date"
      },
      {
        nombre: "fecha_fin",
        label: "Fecha de fin",
        tipo: "date"
      },
      {
        nombre: "actualmente",
        label: "Actualmente trabajo aquí",
        tipo: "checkbox"
      },
      {
        nombre: "descripcion",
        label: "Descripción",
        tipo: "textarea"
      }
    ]
  },


  proyectos: {
    titulo: "Proyectos",

    descripcion:
      "Agrega proyectos académicos, personales o profesionales.",

    id: "id_proyecto",

    campos: [
      {
        nombre: "nombre",
        label: "Nombre del proyecto",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "descripcion",
        label: "Descripción",
        tipo: "textarea"
      },
      {
        nombre: "tecnologias",
        label: "Tecnologías utilizadas",
        tipo: "text"
      },
      {
        nombre: "enlace",
        label: "Enlace",
        tipo: "url"
      }
    ]
  },


  habilidades: {
    titulo: "Habilidades",

    descripcion:
      "Registra tus competencias y habilidades profesionales.",

    id: "id_habilidad",

    campos: [
      {
        nombre: "nombre",
        label: "Habilidad",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "nivel",
        label: "Nivel",
        tipo: "text"
      }
    ]
  },


  idiomas: {
    titulo: "Idiomas",

    descripcion:
      "Registra los idiomas que conoces y tu nivel de dominio.",

    id: "id_idioma",

    campos: [
      {
        nombre: "idioma",
        label: "Idioma",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "nivel",
        label: "Nivel",
        tipo: "text",
        requerido: true
      }
    ]
  },


  cursos: {
    titulo: "Cursos y certificaciones",

    descripcion:
      "Agrega cursos, certificaciones y formación complementaria.",

    id: "id_curso",

    campos: [
      {
        nombre: "nombre",
        label: "Curso o certificación",
        tipo: "text",
        requerido: true
      },
      {
        nombre: "institucion",
        label: "Institución",
        tipo: "text"
      },
      {
        nombre: "fecha_obtencion",
        label: "Fecha de obtención",
        tipo: "date"
      },
      {
        nombre: "enlace",
        label: "Enlace",
        tipo: "url"
      }
    ]
  }

};


/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function crearFormularioVacio(seccion) {

  const configuracion =
    SECCIONES[seccion];


  if (!configuracion) {
    return {};
  }


  const datos = {};


  configuracion.campos.forEach(
    (campo) => {

      datos[campo.nombre] =
        campo.tipo === "checkbox"
          ? false
          : "";

    }
  );


  return datos;
}


function formatearFechaInput(valor) {

  if (!valor) {
    return "";
  }


  if (
    typeof valor === "string" &&
    valor.length >= 10
  ) {

    return valor.substring(
      0,
      10
    );

  }


  return "";
}


function obtenerListaRespuesta(response) {

  if (
    Array.isArray(
      response.data
    )
  ) {

    return response.data;

  }


  if (
    Array.isArray(
      response.data?.registros
    )
  ) {

    return response.data.registros;

  }


  if (
    Array.isArray(
      response.data?.datos
    )
  ) {

    return response.data.datos;

  }


  return [];
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
    curriculum,
    setCurriculum
  ] = useState(null);


  const [
    seccionActiva,
    setSeccionActiva
  ] = useState(
    "formacion"
  );


  const [
    registros,
    setRegistros
  ] = useState([]);


  const [
    form,
    setForm
  ] = useState(
    crearFormularioVacio(
      "formacion"
    )
  );


  const [
    idEdicion,
    setIdEdicion
  ] = useState(null);


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    mejorandoTexto,
    setMejorandoTexto
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


  const config =
    SECCIONES[
      seccionActiva
    ];


  /* =======================================================
     CERRAR SESIÓN
  ======================================================= */

  const cerrarSesion = () => {

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
     CARGAR REGISTROS
  ======================================================= */

  const cargarRegistros =
    async (
      seccion =
        seccionActiva
    ) => {

      const response =
        await api.get(
          `/curriculums/${id}/secciones/${seccion}`
        );


      setRegistros(
        obtenerListaRespuesta(
          response
        )
      );

    };


  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {

    let activo = true;


    const cargarInicial =
      async () => {

        try {

          const [
            responseCurriculum,
            responseFormacion
          ] =
            await Promise.all([
              api.get(
                `/curriculums/${id}`
              ),

              api.get(
                `/curriculums/${id}/secciones/formacion`
              )
            ]);


          if (!activo) {
            return;
          }


          const datosCurriculum =
            responseCurriculum
              .data
              ?.curriculum ||

            responseCurriculum
              .data
              ?.datos ||

            responseCurriculum
              .data;


          setCurriculum(
            datosCurriculum
          );


          setRegistros(
            obtenerListaRespuesta(
              responseFormacion
            )
          );


          setForm(
            crearFormularioVacio(
              "formacion"
            )
          );


        } catch (error) {

          if (!activo) {
            return;
          }


          setError(
            error.response
              ?.data
              ?.mensaje ||

            "No se pudo cargar la información del currículum"
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
     CAMBIAR SECCIÓN
  ======================================================= */

  const cambiarSeccion =
    async (
      nuevaSeccion
    ) => {

      setSeccionActiva(
        nuevaSeccion
      );


      setForm(
        crearFormularioVacio(
          nuevaSeccion
        )
      );


      setIdEdicion(
        null
      );


      setMensaje("");

      setError("");


      try {

        const response =
          await api.get(
            `/curriculums/${id}/secciones/${nuevaSeccion}`
          );


        setRegistros(
          obtenerListaRespuesta(
            response
          )
        );


      } catch (error) {

        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudieron cargar los registros"
        );

      }

    };


  /* =======================================================
     CAMBIOS DEL FORMULARIO
  ======================================================= */

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked
      } = e.target;


      setForm(
        (anterior) => ({

          ...anterior,

          [name]:
            type === "checkbox"
              ? checked
              : value

        })
      );

    };


  /* =======================================================
     LIMPIAR FORMULARIO
  ======================================================= */

  const limpiarFormulario =
    () => {

      setForm(
        crearFormularioVacio(
          seccionActiva
        )
      );


      setIdEdicion(
        null
      );

    };


  /* =======================================================
     MEJORAR DESCRIPCIÓN CON IA
  ======================================================= */

  const mejorarDescripcionIA =
    async () => {

      const texto =
        form.descripcion
          ?.trim();


      if (!texto) {

        setError(
          "Escribe primero una descripción para poder mejorarla"
        );

        return;

      }


      setError("");

      setMensaje("");

      setMejorandoTexto(
        true
      );


      try {

        /*
          Convertimos el nombre de la sección
          al tipo que enviamos a la IA.
        */

        let tipo =
          seccionActiva;


        if (
          seccionActiva ===
          "experiencias"
        ) {

          tipo =
            "experiencia";

        }


        if (
          seccionActiva ===
          "formacion"
        ) {

          tipo =
            "formacion";

        }


        if (
          seccionActiva ===
          "proyectos"
        ) {

          tipo =
            "proyecto";

        }


        const response =
          await api.post(
            "/ia/mejorar-texto",
            {
              tipo,
              texto
            }
          );


        const sugerencia =
          response.data
            ?.sugerencia;


        if (!sugerencia) {

          setError(
            "No se recibió una sugerencia de la IA"
          );

          return;

        }


        setForm(
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

        setMejorandoTexto(
          false
        );

      }

    };


  /* =======================================================
     GUARDAR / ACTUALIZAR
  ======================================================= */

  const guardarRegistro =
    async (
      e
    ) => {

      e.preventDefault();


      setError("");

      setMensaje("");

      setGuardando(
        true
      );


      try {

        const datos = {};


        config.campos.forEach(
          (campo) => {

            const valor =
              form[
                campo.nombre
              ];


            if (
              campo.tipo ===
              "checkbox"
            ) {

              datos[
                campo.nombre
              ] =
                valor
                  ? 1
                  : 0;

            } else {

              datos[
                campo.nombre
              ] =
                valor === ""
                  ? null
                  : valor;

            }

          }
        );


        let response;


        if (idEdicion) {

          response =
            await api.put(
              `/curriculums/${id}/secciones/${seccionActiva}/${idEdicion}`,
              datos
            );


        } else {

          response =
            await api.post(
              `/curriculums/${id}/secciones/${seccionActiva}`,
              datos
            );

        }


        setMensaje(
          response.data
            ?.mensaje ||

          (
            idEdicion
              ? "Información actualizada correctamente"
              : "Información agregada correctamente"
          )
        );


        limpiarFormulario();


        await cargarRegistros(
          seccionActiva
        );


      } catch (error) {

        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudo guardar la información"
        );


      } finally {

        setGuardando(
          false
        );

      }

    };


  /* =======================================================
     EDITAR
  ======================================================= */

  const editarRegistro =
    (
      registro
    ) => {

      const nuevoForm =
        {};


      config.campos.forEach(
        (campo) => {

          const valor =
            registro[
              campo.nombre
            ];


          if (
            campo.tipo ===
            "checkbox"
          ) {

            nuevoForm[
              campo.nombre
            ] =
              Boolean(
                valor
              );


          } else if (
            campo.tipo ===
            "date"
          ) {

            nuevoForm[
              campo.nombre
            ] =
              formatearFechaInput(
                valor
              );


          } else {

            nuevoForm[
              campo.nombre
            ] =
              valor ?? "";

          }

        }
      );


      setForm(
        nuevoForm
      );


      setIdEdicion(
        registro[
          config.id
        ]
      );


      setError("");

      setMensaje("");


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    };


  /* =======================================================
     ELIMINAR
  ======================================================= */

  const eliminarRegistro =
    async (
      registro
    ) => {

      const idRegistro =
        registro[
          config.id
        ];


      const confirmar =
        window.confirm(
          "¿Deseas eliminar este registro?"
        );


      if (!confirmar) {
        return;
      }


      try {

        setError("");

        setMensaje("");


        const response =
          await api.delete(
            `/curriculums/${id}/secciones/${seccionActiva}/${idRegistro}`
          );


        setMensaje(
          response.data
            ?.mensaje ||

          "Registro eliminado correctamente"
        );


        await cargarRegistros(
          seccionActiva
        );


      } catch (error) {

        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudo eliminar el registro"
        );

      }

    };


  /* =======================================================
     RESUMEN REGISTRO
  ======================================================= */

  const obtenerResumenRegistro =
    (
      registro
    ) => {

      switch (
        seccionActiva
      ) {

        case "formacion":

          return {
            principal:
              registro.titulo,

            secundario:
              registro.institucion
          };


        case "experiencias":

          return {
            principal:
              registro.cargo,

            secundario:
              registro.empresa
          };


        case "proyectos":

          return {
            principal:
              registro.nombre,

            secundario:
              registro.tecnologias
          };


        case "habilidades":

          return {
            principal:
              registro.nombre,

            secundario:
              registro.nivel
          };


        case "idiomas":

          return {
            principal:
              registro.idioma,

            secundario:
              registro.nivel
          };


        case "cursos":

          return {
            principal:
              registro.nombre,

            secundario:
              registro.institucion
          };


        default:

          return {
            principal:
              "Registro",

            secundario:
              ""
          };

      }

    };


  /* =======================================================
     CARGANDO
  ======================================================= */

  if (cargando) {

    return (

      <main className="cv-detail-loading">

        Cargando currículum...

      </main>

    );

  }


  /* =======================================================
     INTERFAZ
  ======================================================= */

  return (

    <div className="student-page">


      {/* ===================================================
          SIDEBAR
      =================================================== */}

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

            {usuario?.email
              ? usuario.email
                  .charAt(0)
                  .toUpperCase()
              : "E"}

          </div>


          <div>

            <strong>
              Estudiante
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


      {/* ===================================================
          CONTENIDO
      =================================================== */}

      <main className="student-main">


        {/* HEADER */}

        <header className="student-header">


          <div>


            <span className="student-header-label">

              CONTENIDO DEL CURRÍCULUM

            </span>


            <h1>

              {curriculum
                ?.nombre ||
                "Mi currículum"}

            </h1>


            <p>

              {curriculum
                ?.titulo_profesional ||
                "Completa la información de tu currículum profesional."}

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


              {usuario?.email
                ? usuario.email
                    .charAt(0)
                    .toUpperCase()
                : "E"}


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

                INFORMACIÓN PROFESIONAL

              </span>


              <h2>

                Completa tu currículum

              </h2>


              <p>

                Organiza tu formación,
                experiencia, proyectos,
                habilidades, idiomas y
                certificaciones.

              </p>


            </div>


            <Link
              to="/estudiante/curriculums"
              className="cv-detail-back"
            >

              Volver a mis currículums

            </Link>


          </section>


          {/* =================================================
              PESTAÑAS
          ================================================= */}

          <section className="cv-detail-tabs">


            {Object.entries(
              SECCIONES
            ).map(
              ([
                clave,
                seccion
              ]) => (

                <button
                  key={clave}
                  type="button"
                  className={
                    seccionActiva ===
                    clave
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    cambiarSeccion(
                      clave
                    )
                  }
                >

                  {seccion.titulo}

                </button>

              )
            )}


          </section>


          {/* =================================================
              CONTENIDO
          ================================================= */}

          <section className="cv-detail-grid">


            {/* ===============================================
                FORMULARIO
            =============================================== */}

            <article className="cv-detail-form-card">


              <div className="cv-detail-card-header">


                <span>

                  {idEdicion
                    ? "EDITAR INFORMACIÓN"
                    : "NUEVO REGISTRO"}

                </span>


                <h2>

                  {config.titulo}

                </h2>


                <p>

                  {config.descripcion}

                </p>


              </div>


              <form
                className="cv-detail-form"
                onSubmit={
                  guardarRegistro
                }
              >


                {config.campos.map(
                  (campo) => {


                    /* ===============================
                       CHECKBOX
                    =============================== */

                    if (
                      campo.tipo ===
                      "checkbox"
                    ) {

                      return (

                        <label
                          key={
                            campo.nombre
                          }
                          className="cv-detail-checkbox"
                        >


                          <input
                            type="checkbox"
                            name={
                              campo.nombre
                            }
                            checked={
                              Boolean(
                                form[
                                  campo.nombre
                                ]
                              )
                            }
                            onChange={
                              handleChange
                            }
                          />


                          <span>

                            {campo.label}

                          </span>


                        </label>

                      );

                    }


                    /* ===============================
                       TEXTAREA + IA
                    =============================== */

                    if (
                      campo.tipo ===
                      "textarea"
                    ) {

                      const mostrarIA =
                        campo.nombre ===
                          "descripcion" &&

                        [
                          "formacion",
                          "experiencias",
                          "proyectos"
                        ].includes(
                          seccionActiva
                        );


                      return (

                        <div
                          key={
                            campo.nombre
                          }
                          className="cv-detail-field full"
                        >


                          <div className="cv-description-heading">


                            <label
                              htmlFor={
                                campo.nombre
                              }
                            >

                              {campo.label}

                            </label>


                            {mostrarIA && (

                              <button
                                type="button"
                                className="cv-ai-improve-button"
                                onClick={
                                  mejorarDescripcionIA
                                }
                                disabled={
                                  mejorandoTexto
                                }
                              >

                                {mejorandoTexto
                                  ? "Mejorando..."
                                  : "Mejorar redacción"}

                              </button>

                            )}


                          </div>


                          <textarea
                            id={
                              campo.nombre
                            }
                            name={
                              campo.nombre
                            }
                            value={
                              form[
                                campo.nombre
                              ] || ""
                            }
                            onChange={
                              handleChange
                            }
                            required={
                              campo.requerido
                            }
                            rows="5"
                          />


                          {mostrarIA && (

                            <small className="cv-ai-help">

                              Puedes escribir con
                              tus propias palabras.
                              PoliCV puede ayudarte
                              a corregir y presentar
                              mejor la información
                              sin cambiar su
                              significado.

                            </small>

                          )}


                        </div>

                      );

                    }


                    /* ===============================
                       INPUT NORMAL
                    =============================== */

                    return (

                      <div
                        key={
                          campo.nombre
                        }
                        className="cv-detail-field"
                      >


                        <label
                          htmlFor={
                            campo.nombre
                          }
                        >

                          {campo.label}

                        </label>


                        <input
                          id={
                            campo.nombre
                          }
                          type={
                            campo.tipo
                          }
                          name={
                            campo.nombre
                          }
                          value={
                            form[
                              campo.nombre
                            ] || ""
                          }
                          onChange={
                            handleChange
                          }
                          required={
                            campo.requerido
                          }
                        />


                      </div>

                    );

                  }
                )}


                {/* ===============================
                    MENSAJES
                =============================== */}

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


                {/* ===============================
                    BOTONES
                =============================== */}

                <div className="cv-detail-form-actions">


                  <button
                    type="submit"
                    className="cv-detail-save"
                    disabled={
                      guardando ||
                      mejorandoTexto
                    }
                  >

                    {guardando
                      ? "Guardando..."
                      : idEdicion
                        ? "Guardar cambios"
                        : "Agregar información"}

                  </button>


                  {idEdicion && (

                    <button
                      type="button"
                      className="cv-detail-cancel"
                      onClick={
                        limpiarFormulario
                      }
                    >

                      Cancelar edición

                    </button>

                  )}


                </div>


              </form>


            </article>


            {/* ===============================================
                REGISTROS
            =============================================== */}

            <article className="cv-detail-records-card">


              <div className="cv-detail-card-header">


                <span>

                  INFORMACIÓN GUARDADA

                </span>


                <h2>

                  Registros

                </h2>


                <p>

                  {registros.length}

                  {" "}

                  registro

                  {registros.length !== 1
                    ? "s"
                    : ""}

                  {" "}

                  en esta sección.

                </p>


              </div>


              <div className="cv-detail-records">


                {registros.length ===
                0 ? (


                  <div className="cv-detail-empty">


                    <strong>

                      Todavía no existen registros

                    </strong>


                    <p>

                      Utiliza el formulario
                      para agregar información
                      a esta sección.

                    </p>


                  </div>


                ) : (


                  registros.map(
                    (
                      registro
                    ) => {


                      const resumen =
                        obtenerResumenRegistro(
                          registro
                        );


                      return (

                        <div
                          key={
                            registro[
                              config.id
                            ]
                          }
                          className="cv-detail-record"
                        >


                          <div className="cv-detail-record-info">


                            <span>

                              {config.titulo}

                            </span>


                            <strong>

                              {resumen.principal ||
                                "Sin información"}

                            </strong>


                            {resumen.secundario && (

                              <p>

                                {
                                  resumen.secundario
                                }

                              </p>

                            )}


                          </div>


                          <div className="cv-detail-record-actions">


                            <button
                              type="button"
                              className="cv-detail-edit"
                              onClick={() =>
                                editarRegistro(
                                  registro
                                )
                              }
                            >

                              Editar

                            </button>


                            <button
                              type="button"
                              className="cv-detail-delete"
                              onClick={() =>
                                eliminarRegistro(
                                  registro
                                )
                              }
                            >

                              Eliminar

                            </button>


                          </div>


                        </div>

                      );

                    }
                  )


                )}


              </div>


            </article>


          </section>


        </div>


      </main>


    </div>

  );

}


export default StudentCVDetailPage;