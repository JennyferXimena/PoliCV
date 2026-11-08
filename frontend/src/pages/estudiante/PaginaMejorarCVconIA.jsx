import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";


function StudentAIImproveCVPage() {

  const navigate =
    useNavigate();


  /* =========================================================
     USUARIO
  ========================================================= */

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");


  const usuario =
    usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    curriculums,
    setCurriculums
  ] = useState([]);


  const [
    idCurriculum,
    setIdCurriculum
  ] = useState("");


  const [
    curriculum,
    setCurriculum
  ] = useState(null);


  const [
    contenido,
    setContenido
  ] = useState(null);


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    cargandoCV,
    setCargandoCV
  ] = useState(false);


  const [
    mejorandoIA,
    setMejorandoIA
  ] = useState(false);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    exito,
    setExito
  ] = useState("");


  const [
    sugerenciaIA,
    setSugerenciaIA
  ] = useState(null);


  /* =========================================================
     CERRAR SESIÓN
  ========================================================= */

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


  /* =========================================================
     CARGAR CURRÍCULUMS
  ========================================================= */

  useEffect(() => {

    let activo = true;


    const cargarCurriculums =
      async () => {

        try {

          const response =
            await api.get(
              "/curriculums"
            );


          if (!activo) {
            return;
          }


          setCurriculums(
            response.data.curriculums ||
            []
          );


        } catch (error) {

          if (!activo) {
            return;
          }


          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar tus currículums."
          );


        } finally {

          if (activo) {
            setCargando(false);
          }

        }
      };


    cargarCurriculums();


    return () => {
      activo = false;
    };

  }, []);


  /* =========================================================
     SELECCIONAR Y CARGAR CV
  ========================================================= */

  const seleccionarCurriculum =
    async (e) => {

      const id =
        e.target.value;


      setIdCurriculum(
        id
      );

      setError("");
      setExito("");
      setSugerenciaIA(null);


      if (!id) {

        setCurriculum(null);
        setContenido(null);

        return;
      }


      setCargandoCV(true);


      try {

        const response =
          await api.get(
            `/curriculums/${id}/contenido-fijo`
          );


        const datos =
          response.data.datos ||
          response.data;


        setCurriculum(
          datos.curriculum
        );


        setContenido({
          descripcion:
            datos.contenido
              ?.descripcion ||
            "",

          formacion:
            datos.contenido
              ?.formacion ||
            null,

          proyectos:
            datos.contenido
              ?.proyectos ||
            [],

          practicas:
            datos.contenido
              ?.practicas ||
            [],

          experiencia:
            datos.contenido
              ?.experiencia ||
            []
        });


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo cargar el contenido del currículum."
        );


      } finally {

        setCargandoCV(false);

      }
    };


  /* =========================================================
     SOLICITAR MEJORA CON IA
  ========================================================= */

  const mejorarTexto =
    async (
      tipo,
      texto,
      contexto
    ) => {

      if (
        !texto ||
        !texto.trim()
      ) {

        setError(
          "Primero debe existir un texto para poder mejorarlo."
        );

        return;
      }


      setError("");
      setExito("");
      setMejorandoIA(true);


      try {

        const response =
          await api.post(
            "/ia/mejorar-texto",
            {
              tipo,
              texto
            }
          );


        setSugerenciaIA({
          original:
            response.data.original ||
            texto,

          sugerencia:
            response.data.sugerencia,

          contexto
        });


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo obtener una sugerencia de la IA."
        );


      } finally {

        setMejorandoIA(false);

      }
    };


  /* =========================================================
     APLICAR SUGERENCIA
  ========================================================= */

  const aplicarSugerencia = () => {

    if (!sugerenciaIA) {
      return;
    }


    const {
      sugerencia,
      contexto
    } = sugerenciaIA;


    /* DESCRIPCIÓN PROFESIONAL */

    if (
      contexto.seccion ===
      "descripcion"
    ) {

      setContenido(
        (anterior) => ({
          ...anterior,

          descripcion:
            sugerencia
        })
      );

    }


    /* FORMACIÓN */

    if (
      contexto.seccion ===
      "formacion"
    ) {

      setContenido(
        (anterior) => ({
          ...anterior,

          formacion: {
            ...anterior.formacion,

            descripcion:
              sugerencia
          }
        })
      );

    }


    /* PROYECTOS */

    if (
      contexto.seccion ===
      "proyectos"
    ) {

      setContenido(
        (anterior) => ({
          ...anterior,

          proyectos:
            anterior.proyectos.map(
              (item, index) =>
                index ===
                contexto.index
                  ? {
                      ...item,

                      descripcion:
                        sugerencia
                    }
                  : item
            )
        })
      );

    }


    /* PRÁCTICAS */

    if (
      contexto.seccion ===
      "practicas"
    ) {

      setContenido(
        (anterior) => ({
          ...anterior,

          practicas:
            anterior.practicas.map(
              (item, index) => {

                if (
                  index !==
                  contexto.index
                ) {
                  return item;
                }


                return {
                  ...item,

                  [contexto.campo]:
                    sugerencia
                };
              }
            )
        })
      );

    }


    /* EXPERIENCIA */

    if (
      contexto.seccion ===
      "experiencia"
    ) {

      setContenido(
        (anterior) => ({
          ...anterior,

          experiencia:
            anterior.experiencia.map(
              (item, index) =>
                index ===
                contexto.index
                  ? {
                      ...item,

                      descripcion:
                        sugerencia
                    }
                  : item
            )
        })
      );

    }


    setSugerenciaIA(
      null
    );


    setExito(
      "La sugerencia se aplicó en pantalla. Presiona Guardar cambios para almacenarla."
    );
  };


  /* =========================================================
     ACTUALIZAR CAMPOS
  ========================================================= */

  const actualizarProyecto =
    (
      index,
      valor
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          proyectos:
            anterior.proyectos.map(
              (item, posicion) =>
                posicion === index
                  ? {
                      ...item,

                      descripcion:
                        valor
                    }
                  : item
            )
        })
      );
    };


  const actualizarPractica =
    (
      index,
      campo,
      valor
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          practicas:
            anterior.practicas.map(
              (item, posicion) =>
                posicion === index
                  ? {
                      ...item,

                      [campo]:
                        valor
                    }
                  : item
            )
        })
      );
    };


  const actualizarExperiencia =
    (
      index,
      valor
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          experiencia:
            anterior.experiencia.map(
              (item, posicion) =>
                posicion === index
                  ? {
                      ...item,

                      descripcion:
                        valor
                    }
                  : item
            )
        })
      );
    };


  /* =========================================================
     GUARDAR CAMBIOS
  ========================================================= */

  const guardarCambios =
    async () => {

      if (
        !idCurriculum ||
        !contenido
      ) {
        return;
      }


      setError("");
      setExito("");
      setGuardando(true);


      try {

        /* DESCRIPCIÓN */

        if (
          contenido.descripcion
            ?.trim()
        ) {

          await api.put(
            `/curriculums/${idCurriculum}/contenido-fijo/descripcion`,
            {
              datos: {
                texto:
                  contenido.descripcion
              }
            }
          );

        }


        /* FORMACIÓN */

        if (
          contenido.formacion
        ) {

          await api.put(
            `/curriculums/${idCurriculum}/contenido-fijo/formacion`,
            {
              datos:
                contenido.formacion
            }
          );

        }


        /* PROYECTOS */

        await api.put(
          `/curriculums/${idCurriculum}/contenido-fijo/proyectos`,
          {
            datos:
              contenido.proyectos
          }
        );


        /* PRÁCTICAS */

        await api.put(
          `/curriculums/${idCurriculum}/contenido-fijo/practicas`,
          {
            datos:
              contenido.practicas
          }
        );


        /* EXPERIENCIA */

        await api.put(
          `/curriculums/${idCurriculum}/contenido-fijo/experiencia`,
          {
            datos:
              contenido.experiencia
          }
        );


        setExito(
          "Las mejoras del currículum se guardaron correctamente."
        );


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron guardar los cambios."
        );


      } finally {

        setGuardando(false);

      }
    };


  /* =========================================================
     INTERFAZ
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


          <Link to="/estudiante/curriculums">

            <span>
              03
            </span>

            Mis currículums

          </Link>


          <Link
            to="/estudiante/asistente-ia"
            className="active"
          >

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
              ASISTENTE IA
            </span>

            <h1>
              Mejorar currículum existente
            </h1>

            <p>
              Revisa y mejora la redacción de
              un currículum que ya tengas creado.
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


          <section className="ai-page-heading">


            <div>

              <span>
                MEJORA ASISTIDA
              </span>

              <h2>
                Selecciona tu currículum
              </h2>

              <p>
                PoliCV no modificará tus
                habilidades, idiomas, carrera ni
                datos personales. La IA se
                utilizará únicamente para mejorar
                textos ya registrados.
              </p>

            </div>


            <Link
              to="/estudiante/asistente-ia"
              className="ai-create-cv-button"
            >
              Volver
            </Link>


          </section>


          {/* =================================================
              SELECCIÓN
          ================================================= */}

          <section className="ai-sidebar-panel">


            <label htmlFor="curriculum">
              Currículum
            </label>


            <select
              id="curriculum"
              value={
                idCurriculum
              }
              onChange={
                seleccionarCurriculum
              }
              disabled={
                cargando
              }
            >

              <option value="">

                {cargando
                  ? "Cargando currículums..."
                  : "Selecciona un currículum"}

              </option>


              {curriculums.map(
                (item) => (

                  <option
                    key={
                      item.id_curriculum
                    }
                    value={
                      item.id_curriculum
                    }
                  >
                    {item.nombre}
                  </option>

                )
              )}

            </select>


          </section>


          {cargandoCV && (

            <p>
              Cargando contenido del currículum...
            </p>

          )}


          {/* =================================================
              CONTENIDO DEL CV
          ================================================= */}

          {contenido && !cargandoCV && (

            <>


              <section className="ai-page-heading">

                <div>

                  <span>
                    CURRÍCULUM SELECCIONADO
                  </span>

                  <h2>
                    {curriculum?.nombre}
                  </h2>

                  <p>
                    Revisa cada campo. Puedes
                    modificarlo manualmente o pedir
                    una sugerencia a PoliCV.
                  </p>

                </div>

              </section>


              {/* =============================================
                  DESCRIPCIÓN PROFESIONAL
              ============================================= */}

              <section className="ai-sidebar-panel">

                <h3>
                  Descripción profesional
                </h3>


                <textarea
                  rows="7"
                  value={
                    contenido.descripcion
                  }
                  onChange={
                    (e) =>
                      setContenido(
                        (anterior) => ({
                          ...anterior,

                          descripcion:
                            e.target.value
                        })
                      )
                  }
                  style={{
                    width: "100%"
                  }}
                />


                <button
                  type="button"
                  disabled={
                    mejorandoIA
                  }
                  onClick={
                    () =>
                      mejorarTexto(
                        "perfil_profesional",

                        contenido.descripcion,

                        {
                          seccion:
                            "descripcion"
                        }
                      )
                  }
                >
                  Mejorar redacción con IA
                </button>

              </section>


              {/* =============================================
                  FORMACIÓN
              ============================================= */}

              {contenido.formacion && (

                <section className="ai-sidebar-panel">

                  <h3>
                    Formación académica
                  </h3>


                  <p>
                    {contenido.formacion.titulo}
                    {" - "}
                    {contenido.formacion.institucion}
                  </p>


                  <label>
                    Logros o actividades académicas
                  </label>


                  <textarea
                    rows="5"
                    value={
                      contenido.formacion
                        .descripcion ||
                      ""
                    }
                    onChange={
                      (e) =>
                        setContenido(
                          (anterior) => ({
                            ...anterior,

                            formacion: {
                              ...anterior.formacion,

                              descripcion:
                                e.target.value
                            }
                          })
                        )
                    }
                    style={{
                      width: "100%"
                    }}
                  />


                  <button
                    type="button"
                    disabled={
                      mejorandoIA
                    }
                    onClick={
                      () =>
                        mejorarTexto(
                          "formacion",

                          contenido.formacion
                            .descripcion,

                          {
                            seccion:
                              "formacion"
                          }
                        )
                    }
                  >
                    Mejorar redacción con IA
                  </button>

                </section>

              )}


              {/* =============================================
                  PROYECTOS
              ============================================= */}

              {contenido.proyectos.length >
                0 && (

                <section className="ai-sidebar-panel">

                  <h3>
                    Proyectos
                  </h3>


                  {contenido.proyectos.map(
                    (
                      proyecto,
                      index
                    ) => (

                      <div
                        key={
                          proyecto.id_proyecto ||
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #ddd",

                          paddingBottom:
                            "20px",

                          marginBottom:
                            "20px"
                        }}
                      >

                        <strong>
                          {proyecto.nombre}
                        </strong>


                        <textarea
                          rows="5"
                          value={
                            proyecto.descripcion ||
                            ""
                          }
                          onChange={
                            (e) =>
                              actualizarProyecto(
                                index,
                                e.target.value
                              )
                          }
                          style={{
                            width: "100%",
                            marginTop: "10px"
                          }}
                        />


                        <button
                          type="button"
                          disabled={
                            mejorandoIA
                          }
                          onClick={
                            () =>
                              mejorarTexto(
                                "proyecto",

                                proyecto.descripcion,

                                {
                                  seccion:
                                    "proyectos",

                                  index
                                }
                              )
                          }
                        >
                          Mejorar descripción con IA
                        </button>

                      </div>

                    )
                  )}

                </section>

              )}


              {/* =============================================
                  PRÁCTICAS
              ============================================= */}

              {contenido.practicas.length >
                0 && (

                <section className="ai-sidebar-panel">

                  <h3>
                    Prácticas
                  </h3>


                  {contenido.practicas.map(
                    (
                      practica,
                      index
                    ) => (

                      <div
                        key={
                          practica.id_practica ||
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #ddd",

                          paddingBottom:
                            "20px",

                          marginBottom:
                            "20px"
                        }}
                      >

                        <strong>
                          {practica.tipo ===
                          "comunitaria"
                            ? "Práctica comunitaria"
                            : "Práctica laboral"}
                        </strong>


                        <p>
                          {practica.institucion}
                        </p>


                        <label>
                          Descripción
                        </label>


                        <textarea
                          rows="5"
                          value={
                            practica.descripcion ||
                            ""
                          }
                          onChange={
                            (e) =>
                              actualizarPractica(
                                index,
                                "descripcion",
                                e.target.value
                              )
                          }
                          style={{
                            width: "100%"
                          }}
                        />


                        <button
                          type="button"
                          disabled={
                            mejorandoIA
                          }
                          onClick={
                            () =>
                              mejorarTexto(
                                "practica",

                                practica.descripcion,

                                {
                                  seccion:
                                    "practicas",

                                  index,

                                  campo:
                                    "descripcion"
                                }
                              )
                          }
                        >
                          Mejorar descripción con IA
                        </button>


                        <br />
                        <br />


                        <label>
                          Logro o aprendizaje
                        </label>


                        <textarea
                          rows="5"
                          value={
                            practica
                              .logro_aprendizaje ||
                            ""
                          }
                          onChange={
                            (e) =>
                              actualizarPractica(
                                index,
                                "logro_aprendizaje",
                                e.target.value
                              )
                          }
                          style={{
                            width: "100%"
                          }}
                        />


                        <button
                          type="button"
                          disabled={
                            mejorandoIA
                          }
                          onClick={
                            () =>
                              mejorarTexto(
                                "logro_practica",

                                practica
                                  .logro_aprendizaje,

                                {
                                  seccion:
                                    "practicas",

                                  index,

                                  campo:
                                    "logro_aprendizaje"
                                }
                              )
                          }
                        >
                          Mejorar logro con IA
                        </button>

                      </div>

                    )
                  )}

                </section>

              )}


              {/* =============================================
                  EXPERIENCIA
              ============================================= */}

              {contenido.experiencia.length >
                0 && (

                <section className="ai-sidebar-panel">

                  <h3>
                    Experiencia laboral
                  </h3>


                  {contenido.experiencia.map(
                    (
                      experiencia,
                      index
                    ) => (

                      <div
                        key={
                          experiencia.id_experiencia ||
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #ddd",

                          paddingBottom:
                            "20px",

                          marginBottom:
                            "20px"
                        }}
                      >

                        <strong>
                          {experiencia.cargo}
                        </strong>


                        <p>
                          {experiencia.empresa}
                        </p>


                        <textarea
                          rows="5"
                          value={
                            experiencia.descripcion ||
                            ""
                          }
                          onChange={
                            (e) =>
                              actualizarExperiencia(
                                index,
                                e.target.value
                              )
                          }
                          style={{
                            width: "100%"
                          }}
                        />


                        <button
                          type="button"
                          disabled={
                            mejorandoIA
                          }
                          onClick={
                            () =>
                              mejorarTexto(
                                "experiencia",

                                experiencia.descripcion,

                                {
                                  seccion:
                                    "experiencia",

                                  index
                                }
                              )
                          }
                        >
                          Mejorar funciones y logros con IA
                        </button>

                      </div>

                    )
                  )}

                </section>

              )}


              {/* =============================================
                  SUGERENCIA IA
              ============================================= */}

              {sugerenciaIA && (

                <section className="ai-sidebar-panel">

                  <span className="ai-section-label">
                    SUGERENCIA DE POLICV
                  </span>


                  <h3>
                    Revisa antes de aplicar
                  </h3>


                  <strong>
                    Texto actual
                  </strong>

                  <p>
                    {sugerenciaIA.original}
                  </p>


                  <strong>
                    Sugerencia
                  </strong>

                  <p>
                    {sugerenciaIA.sugerencia}
                  </p>


                  <button
                    type="button"
                    onClick={
                      aplicarSugerencia
                    }
                  >
                    Aplicar sugerencia
                  </button>


                  {" "}


                  <button
                    type="button"
                    onClick={
                      () =>
                        setSugerenciaIA(
                          null
                        )
                    }
                  >
                    Conservar original
                  </button>

                </section>

              )}


              {/* =============================================
                  GUARDAR
              ============================================= */}

              <section className="ai-sidebar-panel">

                <h3>
                  Guardar mejoras
                </h3>


                <p>
                  Ninguna sugerencia se almacena
                  automáticamente. Guarda únicamente
                  cuando estés conforme con los textos.
                </p>


                <button
                  type="button"
                  onClick={
                    guardarCambios
                  }
                  disabled={
                    guardando
                  }
                >

                  {guardando
                    ? "Guardando..."
                    : "Guardar cambios"}

                </button>


                {" "}


                <Link
                  to={`/estudiante/curriculums/${idCurriculum}`}
                >
                  Ver currículum completo
                </Link>

              </section>


            </>

          )}


          {/* =================================================
              MENSAJES
          ================================================= */}

          {error && (

            <div className="ai-professional-error">
              {error}
            </div>

          )}


          {exito && (

            <p>
              {exito}
            </p>

          )}


        </div>


      </main>


    </div>

  );
}


export default StudentAIImproveCVPage;