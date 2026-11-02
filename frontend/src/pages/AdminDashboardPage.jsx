import { Link, useNavigate } from "react-router-dom";
import "../styles/admin.css";

function AdminDashboardPage() {
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
    <div className="admin-page">

      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-brand-logo">
            P
          </div>

          <div>
            <h2>PoliCV</h2>
            <span>Administración</span>
          </div>
        </div>

        <div className="admin-profile">

          <div className="admin-avatar">
            {usuario?.email
              ? usuario.email
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div>
            <strong>
              Administrador
            </strong>

            <span>
              {usuario?.email}
            </span>
          </div>

        </div>

        <nav className="admin-menu">

          <Link
            to="/admin"
            className="active"
          >
            <span>01</span>
            Panel principal
          </Link>

          <Link to="/admin/usuarios">
            <span>02</span>
            Gestionar usuarios
          </Link>

          <Link to="/admin/secciones">
            <span>03</span>
            Secciones del CV
          </Link>

          <Link to="/admin/plantillas">
            <span>04</span>
            Plantillas
          </Link>

          <Link to="/admin/estadisticas">
            <span>05</span>
            Estadísticas
          </Link>

          <Link to="/admin/propuestas">
            <span>06</span>
            Propuestas
          </Link>

        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </aside>


      <main className="admin-main">

        <header className="admin-header">

          <div>
            <span className="admin-header-label">
              PANEL DE ADMINISTRACIÓN
            </span>

            <h1>
              Panel principal
            </h1>

            <p>
              Gestiona y supervisa los principales
              módulos de PoliCV.
            </p>
          </div>

          <div className="admin-header-account">

            <div>
              <span>
                Sesión iniciada como
              </span>

              <strong>
                {usuario?.email}
              </strong>
            </div>

            <div className="admin-header-avatar">
              {usuario?.email
                ? usuario.email
                    .charAt(0)
                    .toUpperCase()
                : "A"}
            </div>

          </div>

        </header>


        <div className="admin-content">

          <section className="admin-hero">

            <div className="admin-hero-content">

              <span>
                ADMINISTRACIÓN DE POLICV
              </span>

              <h2>
                Gestiona la plataforma
                desde un solo lugar
              </h2>

              <p>
                Administra usuarios, configura las
                secciones del currículum, gestiona
                plantillas, consulta estadísticas
                y revisa las propuestas enviadas
                por los estudiantes.
              </p>

            </div>

            <div className="admin-hero-panels">

              <div>
                <strong>
                  Usuarios
                </strong>

                <span>
                  Gestión de cuentas
                </span>
              </div>

              <div>
                <strong>
                  Currículums
                </strong>

                <span>
                  Configuración general
                </span>
              </div>

              <div>
                <strong>
                  Estadísticas
                </strong>

                <span>
                  Información del sistema
                </span>
              </div>

            </div>

          </section>


          <section className="admin-modules">

            <div className="admin-section-heading">

              <div>
                <span>
                  ACCESO RÁPIDO
                </span>

                <h2>
                  Módulos de administración
                </h2>
              </div>

              <p>
                Selecciona una opción para comenzar.
              </p>

            </div>


            <div className="admin-grid">

              <Link
                to="/admin/usuarios"
                className="admin-card"
              >
                <div className="admin-card-number">
                  01
                </div>

                <span className="admin-card-tag">
                  USUARIOS
                </span>

                <h3>
                  Gestionar usuarios
                </h3>

                <p>
                  Consulta las cuentas registradas,
                  busca usuarios y administra su
                  estado dentro de PoliCV.
                </p>

                <strong>
                  Ir a usuarios →
                </strong>
              </Link>


              <Link
                to="/admin/secciones"
                className="admin-card"
              >
                <div className="admin-card-number teal">
                  02
                </div>

                <span className="admin-card-tag">
                  CURRÍCULUM
                </span>

                <h3>
                  Gestionar secciones
                </h3>

                <p>
                  Administra las secciones que
                  conforman los currículums de
                  los estudiantes.
                </p>

                <strong>
                  Ir a secciones →
                </strong>
              </Link>


              <Link
                to="/admin/plantillas"
                className="admin-card"
              >
                <div className="admin-card-number">
                  03
                </div>

                <span className="admin-card-tag">
                  DISEÑO
                </span>

                <h3>
                  Gestionar plantillas
                </h3>

                <p>
                  Registra y administra los diseños
                  disponibles para la presentación
                  de los currículums.
                </p>

                <strong>
                  Ir a plantillas →
                </strong>
              </Link>


              <Link
                to="/admin/estadisticas"
                className="admin-card"
              >
                <div className="admin-card-number teal">
                  04
                </div>

                <span className="admin-card-tag">
                  ESTADÍSTICAS
                </span>

                <h3>
                  Consultar estadísticas
                </h3>

                <p>
                  Consulta información general
                  sobre usuarios, secciones,
                  plantillas y propuestas.
                </p>

                <strong>
                  Ver estadísticas →
                </strong>
              </Link>


              <Link
                to="/admin/propuestas"
                className="admin-card"
              >
                <div className="admin-card-number">
                  05
                </div>

                <span className="admin-card-tag">
                  MEJORA CONTINUA
                </span>

                <h3>
                  Propuestas de mejora
                </h3>

                <p>
                  Revisa las propuestas enviadas
                  por los estudiantes y registra
                  una respuesta administrativa.
                </p>

                <strong>
                  Revisar propuestas →
                </strong>
              </Link>

            </div>

          </section>


          <section className="admin-bottom">

            <article className="admin-info">

              <span>
                POLICV
              </span>

              <h2>
                Administración centralizada
              </h2>

              <p>
                El panel administrativo reúne las
                herramientas principales para
                mantener organizada y actualizada
                la configuración de la plataforma.
              </p>

            </article>


            <article className="admin-status">

              <div className="admin-status-title">

                <div>
                  <span>
                    ESTADO GENERAL
                  </span>

                  <h3>
                    Plataforma operativa
                  </h3>
                </div>

                <strong>
                  Activo
                </strong>

              </div>


              <div className="admin-status-list">

                <div>
                  <span>
                    Gestión de usuarios
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Secciones del CV
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Plantillas
                  </span>

                  <strong>
                    Disponible
                  </strong>
                </div>

                <div>
                  <span>
                    Estadísticas
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

export default AdminDashboardPage;