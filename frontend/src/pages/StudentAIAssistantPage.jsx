import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../services/api";
import "../styles/student.css";


function StudentAIAssistantPage() {

  const navigate = useNavigate();


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
    curriculumSeleccionado,
    setCurriculumSeleccionado
  ] = useState("");


  const [
    mensajes,
    setMensajes
  ] = useState([
    {
      role: "assistant",
      content:
        "Hola, soy el asistente de PoliCV. Selecciona uno de tus currículums para comenzar."
    }
  ]);


  const [
    mensaje,
    setMensaje
  ] = useState("");


  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    cargandoCurriculums,
    setCargandoCurriculums
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


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


    const cargarCurriculums = async () => {

      try {

        const response =
          await api.get(
            "/curriculums"
          );


        if (!activo) {
          return;
        }


        const lista =
          response.data.curriculums ||
          response.data.datos ||
          [];


        setCurriculums(
          lista
        );


      } catch (error) {

        if (!activo) {
          return;
        }


        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar tus currículums"
        );


      } finally {

        if (activo) {
          setCargandoCurriculums(
            false
          );
        }
      }
    };


    cargarCurriculums();


    return () => {
      activo = false;
    };

  }, []);


  /* =========================================================
     CAMBIAR CURRÍCULUM
  ========================================================= */

  const cambiarCurriculum = (
    e
  ) => {

    const idCurriculum =
      e.target.value;


    setCurriculumSeleccionado(
      idCurriculum
    );


    setMensaje("");

    setError("");


    if (!idCurriculum) {

      setMensajes([
        {
          role: "assistant",
          content:
            "Hola, soy el asistente de PoliCV. Selecciona uno de tus currículums para comenzar."
        }
      ]);

      return;
    }


    const curriculum =
      curriculums.find(
        (item) =>
          String(
            item.id_curriculum
          ) ===
          String(
            idCurriculum
          )
      );


    setMensajes([
      {
        role: "assistant",
        content:
          `Perfecto. Trabajaremos con el currículum "${curriculum?.nombre || "seleccionado"}". Puedes contarme qué parte deseas mejorar o preguntarme qué podrías fortalecer.`
      }
    ]);
  };


  /* =========================================================
     ENVIAR MENSAJE
  ========================================================= */

  const enviarMensaje = async (
    e
  ) => {

    e.preventDefault();


    const texto =
      mensaje.trim();


    if (
      !texto ||
      cargando
    ) {
      return;
    }


    if (
      !curriculumSeleccionado
    ) {

      setError(
        "Selecciona primero un currículum"
      );

      return;
    }


    setError("");


    const mensajeUsuario = {
      role: "user",
      content: texto
    };


    /*
      El historial contiene los mensajes
      anteriores de la conversación.
    */

    const historialAnterior =
      mensajes.map(
        (item) => ({
          role: item.role,
          content: item.content
        })
      );


    /*
      Mostramos inmediatamente el mensaje
      del estudiante en pantalla.
    */

    setMensajes(
      (anteriores) => [
        ...anteriores,
        mensajeUsuario
      ]
    );


    setMensaje("");

    setCargando(true);


    try {

      /*
        Enviamos:
        - mensaje actual
        - historial
        - currículum seleccionado

        El backend utiliza el id_curriculum
        para obtener su información desde MySQL.
      */

      const response =
        await api.post(
          "/ia/chat",
          {
            mensaje: texto,

            historial:
              historialAnterior,

            id_curriculum:
              Number(
                curriculumSeleccionado
              )
          }
        );


      const respuestaIA =
        response.data.respuesta ||
        response.data.mensajeIA ||
        "No se pudo generar una respuesta.";


      const mensajeIA = {
        role: "assistant",
        content:
          respuestaIA
      };


      setMensajes(
        (anteriores) => [
          ...anteriores,
          mensajeIA
        ]
      );


    } catch (error) {

      setError(
        error.response?.data?.mensaje ||
        "No se pudo obtener una respuesta del asistente"
      );


    } finally {

      setCargando(false);
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
          CONTENIDO PRINCIPAL
      ===================================================== */}

      <main className="student-main">


        {/* HEADER */}

        <header className="student-header">


          <div>

            <span className="student-header-label">
              ASISTENCIA PROFESIONAL
            </span>


            <h1>
              Asistente de PoliCV
            </h1>


            <p>
              Revisa y mejora el contenido
              de tu currículum con asistencia
              inteligente.
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


        {/* ===================================================
            CONTENIDO
        =================================================== */}

        <div className="student-content">


          {/* INTRODUCCIÓN */}

          <section className="ai-page-heading">


            <div>

              <span>
                ASISTENCIA PARA TU CURRÍCULUM
              </span>


              <h2>
                Mejora la presentación de tu perfil
              </h2>


              <p>
                Selecciona uno de tus currículums
                y conversa con PoliCV para revisar
                la redacción, organizar información
                y mejorar tus descripciones
                profesionales.
              </p>

            </div>


            <Link
              to="/estudiante/crear-cv-ia"
              className="ai-create-cv-button"
            >
              Crear currículum desde cero
            </Link>


          </section>


          {/* =================================================
              ESPACIO DEL ASISTENTE
          ================================================= */}

          <section className="ai-professional-layout">


            {/* ===============================================
                PANEL IZQUIERDO
            =============================================== */}

            <aside className="ai-sidebar-panel">


              <span className="ai-section-label">
                CURRÍCULUM DE TRABAJO
              </span>


              <h3>
                Selecciona un currículum
              </h3>


              <p>
                PoliCV utilizará la información
                del currículum seleccionado como
                referencia para ofrecer sugerencias.
              </p>


              <label htmlFor="curriculum">
                Currículum
              </label>


              <select
                id="curriculum"
                className="ai-cv-select"
                value={
                  curriculumSeleccionado
                }
                onChange={
                  cambiarCurriculum
                }
                disabled={
                  cargandoCurriculums
                }
              >

                <option value="">

                  {cargandoCurriculums
                    ? "Cargando currículums..."
                    : "Selecciona un currículum"}

                </option>


                {curriculums.map(
                  (curriculum) => (

                    <option
                      key={
                        curriculum.id_curriculum
                      }
                      value={
                        curriculum.id_curriculum
                      }
                    >
                      {curriculum.nombre}
                    </option>

                  )
                )}


              </select>


              {/* FUNCIONES */}

              <div className="ai-help-section">


                <span>
                  Funciones disponibles
                </span>


                <div>

                  <strong>
                    Revisar redacción
                  </strong>

                  <p>
                    Corrige errores de escritura
                    y textos poco claros.
                  </p>

                </div>


                <div>

                  <strong>
                    Mejorar descripciones
                  </strong>

                  <p>
                    Presenta experiencias,
                    proyectos y actividades
                    de manera profesional.
                  </p>

                </div>


                <div>

                  <strong>
                    Organizar información
                  </strong>

                  <p>
                    Ayuda a estructurar mejor
                    el contenido de tu currículum.
                  </p>

                </div>


                <div>

                  <strong>
                    Recibir sugerencias
                  </strong>

                  <p>
                    Identifica aspectos que
                    podrían fortalecer tu perfil.
                  </p>

                </div>


              </div>


            </aside>


            {/* ===============================================
                CHAT
            =============================================== */}

            <article className="ai-professional-chat">


              {/* HEADER DEL CHAT */}

              <header className="ai-professional-header">


                <div className="ai-professional-avatar">
                  IA
                </div>


                <div>

                  <h3>
                    Asistente PoliCV
                  </h3>

                  <span>
                    Apoyo para la elaboración
                    de tu currículum
                  </span>

                </div>


                <div className="ai-professional-status">
                  Disponible
                </div>


              </header>


              {/* =============================================
                  MENSAJES
              ============================================= */}

              <div className="ai-professional-messages">


                {mensajes.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      className={
                        item.role ===
                        "user"
                          ? "ai-professional-row user"
                          : "ai-professional-row assistant"
                      }
                    >


                      <span className="ai-professional-author">

                        {item.role ===
                        "user"
                          ? "Tú"
                          : "PoliCV"}

                      </span>


                      <div
                        className={
                          item.role ===
                          "user"
                            ? "ai-professional-message user"
                            : "ai-professional-message assistant"
                        }
                      >

                        {item.content}

                      </div>


                    </div>

                  )
                )}


                {/* RESPUESTA EN PROCESO */}

                {cargando && (

                  <div className="ai-professional-row assistant">


                    <span className="ai-professional-author">
                      PoliCV
                    </span>


                    <div className="ai-professional-message assistant">
                      Analizando tu información...
                    </div>


                  </div>

                )}


              </div>


              {/* =============================================
                  ERROR
              ============================================= */}

              {error && (

                <div className="ai-professional-error">
                  {error}
                </div>

              )}


              {/* =============================================
                  ESCRIBIR MENSAJE
              ============================================= */}

              <form
                className="ai-professional-input"
                onSubmit={
                  enviarMensaje
                }
              >


                <textarea
                  value={
                    mensaje
                  }
                  onChange={
                    (e) =>
                      setMensaje(
                        e.target.value
                      )
                  }
                  placeholder={
                    curriculumSeleccionado
                      ? "Escribe tu consulta o cuéntame tu experiencia..."
                      : "Selecciona primero un currículum"
                  }
                  disabled={
                    !curriculumSeleccionado ||
                    cargando
                  }
                  rows="3"
                />


                <div className="ai-input-footer">


                  <span>
                    Puedes escribir de forma
                    natural. PoliCV puede ayudarte
                    a organizar y mejorar la
                    redacción de la información
                    que proporciones.
                  </span>


                  <button
                    type="submit"
                    disabled={
                      !curriculumSeleccionado ||
                      cargando ||
                      !mensaje.trim()
                    }
                  >

                    {cargando
                      ? "Enviando..."
                      : "Enviar mensaje"}

                  </button>


                </div>


              </form>


            </article>


          </section>


        </div>


      </main>


    </div>

  );
}


export default StudentAIAssistantPage;