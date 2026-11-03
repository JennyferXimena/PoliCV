import {
  Link,
  useNavigate
} from "react-router-dom";

import "../styles/student.css";


function StudentAIAssistantPage() {

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


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="student-header">


          <div>

            <span className="student-header-label">
              ASISTENCIA PROFESIONAL
            </span>

            <h1>
              Asistente de PoliCV
            </h1>

            <p>
              Utiliza inteligencia artificial para
              crear un currículum desde cero o mejorar
              la presentación de uno que ya hayas creado.
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


          {/* =================================================
              INTRODUCCIÓN
          ================================================= */}

          <section className="ai-page-heading">


            <div>

              <span>
                ASISTENTE INTELIGENTE
              </span>

              <h2>
                ¿Cómo deseas trabajar tu currículum?
              </h2>

              <p>
                PoliCV puede guiarte para completar
                tu información profesional desde cero
                o ayudarte a mejorar la redacción de
                un currículum que ya tengas registrado.
              </p>

            </div>


          </section>


          {/* =================================================
              OPCIONES
          ================================================= */}

          <section className="ai-professional-layout">


            {/* ===============================================
                CREAR DESDE CERO
            =============================================== */}

            <article className="ai-sidebar-panel">


              <span className="ai-section-label">
                OPCIÓN 01
              </span>


              <h3>
                Crear CV desde cero con IA
              </h3>


              <p>
                El asistente te guiará paso a paso
                utilizando la estructura profesional
                definida por PoliCV.
              </p>


              <div className="ai-help-section">


                <div>

                  <strong>
                    Datos del perfil
                  </strong>

                  <p>
                    PoliCV utilizará la información
                    personal y académica que ya
                    registraste en tu perfil.
                  </p>

                </div>


                <div>

                  <strong>
                    Preguntas guiadas
                  </strong>

                  <p>
                    Completarás formación, idiomas,
                    habilidades, cursos, proyectos,
                    prácticas, experiencia y referencias.
                  </p>

                </div>


                <div>

                  <strong>
                    Opciones predeterminadas
                  </strong>

                  <p>
                    Los idiomas y habilidades se
                    seleccionarán desde los catálogos
                    establecidos para tu carrera.
                  </p>

                </div>


                <div>

                  <strong>
                    Redacción asistida
                  </strong>

                  <p>
                    La IA corregirá ortografía,
                    gramática y redacción sin inventar
                    información profesional.
                  </p>

                </div>


              </div>


              <Link
                to="/estudiante/crear-cv-ia"
                className="ai-create-cv-button"
              >
                Crear currículum desde cero
              </Link>


            </article>


            {/* ===============================================
                MEJORAR CV EXISTENTE
            =============================================== */}

            <article className="ai-sidebar-panel">


              <span className="ai-section-label">
                OPCIÓN 02
              </span>


              <h3>
                Mejorar un CV existente
              </h3>


              <p>
                Selecciona uno de tus currículums
                creados y utiliza la IA para mejorar
                únicamente los campos que necesitan
                redacción.
              </p>


              <div className="ai-help-section">


                <div>

                  <strong>
                    Seleccionar currículum
                  </strong>

                  <p>
                    PoliCV cargará automáticamente
                    la información que ya tengas
                    registrada.
                  </p>

                </div>


                <div>

                  <strong>
                    Sin repetir información
                  </strong>

                  <p>
                    No volverá a preguntarte carrera,
                    idiomas, habilidades ni otros
                    datos que ya estén guardados.
                  </p>

                </div>


                <div>

                  <strong>
                    Revisar redacción
                  </strong>

                  <p>
                    Podrás mejorar descripción
                    profesional, proyectos, prácticas,
                    formación y experiencia laboral.
                  </p>

                </div>


                <div>

                  <strong>
                    Tú decides
                  </strong>

                  <p>
                    La sugerencia de la IA nunca se
                    guardará automáticamente. Podrás
                    aplicarla o conservar tu texto.
                  </p>

                </div>


              </div>


              <Link
                to="/estudiante/asistente-ia/mejorar"
                className="ai-create-cv-button"
              >
                Mejorar currículum existente
              </Link>


            </article>


          </section>


          {/* =================================================
              REGLA DE LA IA
          ================================================= */}

          <section className="ai-page-heading">


            <div>

              <span>
                CONTROL DEL ESTUDIANTE
              </span>

              <h2>
                La IA ayuda, pero no inventa información
              </h2>

              <p>
                PoliCV puede interpretar errores
                ortográficos, corregir la gramática,
                organizar ideas y mejorar la forma
                de presentar la información. Sin embargo,
                no agregará estudios, habilidades,
                tecnologías, experiencia, responsabilidades
                o logros que no hayas proporcionado.
              </p>

            </div>


          </section>


        </div>


      </main>


    </div>

  );
}


export default StudentAIAssistantPage;