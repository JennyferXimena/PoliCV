import { Link, useNavigate } from "react-router-dom";
import "../../styles/estudiante/estudiante.css";

function StudentDashboardPage() {
  const navigate = useNavigate();

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };

  return (
    <div className="student-page">

      {/* SIDEBAR */}
      <aside className="student-sidebar">

        <div className="student-brand">

          <div className="student-brand-logo">
            P
          </div>

          <div>
            <h2>PoliCV</h2>
            <span>Estudiante</span>
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

          <Link
            to="/estudiante"
            className="active"
          >
            <span>01</span>
            Inicio
          </Link>

          <Link to="/perfil">
            <span>02</span>
            Mi perfil
          </Link>

          <Link to="/estudiante/curriculums">
            <span>03</span>
            Mis currículums
          </Link>

          <Link to="/estudiante/asistente-ia">
            <span>04</span>
            Asistente IA
          </Link>

          <Link to="/estudiante/propuestas">
            <span>05</span>
            Propuestas de mejora
          </Link>

        </nav>


        <button
          type="button"
          className="student-logout"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </aside>


      {/* CONTENIDO */}
      <main className="student-main">

        <header className="student-header">

          <div>

            <span className="student-header-label">
              ESPACIO DEL ESTUDIANTE
            </span>

            <h1>
              Mi panel
            </h1>

            <p>
              Organiza tu perfil, currículums
              y herramientas profesionales.
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

          {/* HERO */}
          <section className="student-hero">

            <div className="student-hero-content">

              <span>
                TU PERFIL PROFESIONAL
              </span>

              <h2>
                Construye tu perfil
                paso a paso
              </h2>

              <p>
                Completa tu información,
                organiza tus currículums y
                utiliza las herramientas de PoliCV
                para presentar mejor tu experiencia,
                formación y habilidades.
              </p>


              <div className="student-hero-actions">

                <Link
                  to="/estudiante/curriculums"
                  className="student-primary-button"
                >
                  Ver mis currículums
                </Link>

                <Link
                  to="/estudiante/asistente-ia"
                  className="student-secondary-button"
                >
                  Usar asistente IA
                </Link>

              </div>

            </div>


            <div className="student-progress-panel">

              <span>
                AVANCE DE TU PERFIL
              </span>

              <div className="student-progress-circle">

                <div>
                  <strong>
                    60%
                  </strong>

                  <span>
                    completado
                  </span>
                </div>

              </div>

              <p>
                Continúa completando tu información
                para fortalecer tu perfil profesional.
              </p>

            </div>

          </section>


          {/* ACCESOS */}
          <section className="student-section">

            <div className="student-section-heading">

              <div>

                <span>
                  ACCESO RÁPIDO
                </span>

                <h2>
                  Herramientas de PoliCV
                </h2>

              </div>

              <p>
                Accede rápidamente a las
                principales funciones de tu cuenta.
              </p>

            </div>


            <div className="student-card-grid">

              <Link
                to="/perfil"
                className="student-card"
              >

                <div className="student-card-number">
                  01
                </div>

                <span className="student-card-tag">
                  PERFIL
                </span>

                <h3>
                  Mi perfil
                </h3>

                <p>
                  Consulta y actualiza tu información
                  personal, datos de contacto y
                  enlaces profesionales.
                </p>

                <strong>
                  Ver perfil →
                </strong>

              </Link>


              <Link
                to="/estudiante/curriculums"
                className="student-card"
              >

                <div className="student-card-number light">
                  02
                </div>

                <span className="student-card-tag">
                  CURRÍCULUM
                </span>

                <h3>
                  Mis currículums
                </h3>

                <p>
                  Crea, edita y organiza tu formación,
                  experiencia, proyectos, habilidades
                  e idiomas.
                </p>

                <strong>
                  Gestionar CV →
                </strong>

              </Link>


              <Link
                to="/estudiante/asistente-ia"
                className="student-card"
              >

                <div className="student-card-number">
                  03
                </div>

                <span className="student-card-tag">
                  ASISTENTE
                </span>

                <h3>
                  Asistente IA
                </h3>

                <p>
                  Mejora la redacción de tu currículum,
                  corrige textos y recibe sugerencias
                  para presentar mejor tu experiencia.
                </p>

                <strong>
                  Abrir asistente →
                </strong>

              </Link>


              <Link
                to="/estudiante/crear-cv-ia"
                className="student-card"
              >

                <div className="student-card-number light">
                  04
                </div>

                <span className="student-card-tag">
                  CREACIÓN GUIADA
                </span>

                <h3>
                  Crear CV con IA
                </h3>

                <p>
                  Construye un currículum desde cero
                  mediante una conversación guiada
                  con PoliCV.
                </p>

                <strong>
                  Crear currículum →
                </strong>

              </Link>


              <Link
                to="/estudiante/propuestas"
                className="student-card"
              >

                <div className="student-card-number">
                  05
                </div>

                <span className="student-card-tag">
                  PARTICIPACIÓN
                </span>

                <h3>
                  Propuestas de mejora
                </h3>

                <p>
                  Envía sugerencias para contribuir
                  al mejoramiento continuo de la
                  plataforma PoliCV.
                </p>

                <strong>
                  Ver propuestas →
                </strong>

              </Link>

            </div>

          </section>


          {/* PARTE INFERIOR */}
          <section className="student-bottom-grid">

            <article className="student-tip-card">

              <span>
                RECOMENDACIÓN
              </span>

              <h2>
                Mantén actualizado tu currículum
              </h2>

              <p>
                Agrega nuevos proyectos, cursos,
                experiencias y habilidades conforme
                avances en tu formación profesional.
              </p>

            </article>


            <article className="student-status-card">

              <div className="student-status-header">

                <div>

                  <span>
                    TU ESPACIO POLICV
                  </span>

                  <h3>
                    Funciones disponibles
                  </h3>

                </div>

                <strong>
                  Activo
                </strong>

              </div>


              <div className="student-status-list">

                <div>
                  <span>
                    Perfil
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Currículums
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Asistente IA
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Propuestas
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

              </div>

            </article>

          </section>

        </div>

      </main>

    </div>
  );
}

export default StudentDashboardPage;