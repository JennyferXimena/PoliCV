import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/administrador/administrador.css";

function AdminStatisticsPage() {
  const navigate = useNavigate();

  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuarioActual = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };

  const porcentaje = (valor, total) => {
    if (!total) {
      return 0;
    }

    return Math.round(
      (Number(valor) / Number(total)) * 100
    );
  };

  useEffect(() => {
    let activo = true;

    const cargarEstadisticas = async () => {
      try {
        const response = await api.get(
          "/admin/estadisticas"
        );

        if (!activo) {
          return;
        }

        setEstadisticas(
          response.data.estadisticas ||
          response.data.datos ||
          response.data
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar las estadísticas"
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarEstadisticas();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <main style={{ padding: "40px" }}>
        <p>
          Cargando estadísticas...
        </p>
      </main>
    );
  }

  if (!estadisticas) {
    return (
      <main style={{ padding: "40px" }}>
        <p>
          {error ||
            "No existen estadísticas disponibles"}
        </p>
      </main>
    );
  }

  const usuarios =
    estadisticas.usuarios || {};

  const secciones =
    estadisticas.secciones || {};

  const plantillas =
    estadisticas.plantillas || {};

  const propuestas =
    estadisticas.propuestas || {};

  const totalUsuarios =
    Number(usuarios.total || 0);

  const usuariosActivos =
    Number(usuarios.activos || 0);

  const usuariosInactivos =
    Number(usuarios.inactivos || 0);

  const estudiantes =
    Number(usuarios.estudiantes || 0);

  const administradores =
    Number(usuarios.administradores || 0);

  const totalSecciones =
    Number(secciones.total || 0);

  const seccionesActivas =
    Number(secciones.activas || 0);

  const totalPlantillas =
    Number(plantillas.total || 0);

  const plantillasActivas =
    Number(plantillas.activas || 0);

  const totalPropuestas =
    Number(propuestas.total || 0);

  const propuestasPendientes =
    Number(propuestas.pendientes || 0);

  const propuestasAceptadas =
    Number(propuestas.aceptadas || 0);

  const propuestasRechazadas =
    Number(propuestas.rechazadas || 0);

  const porcentajeActivos =
    porcentaje(
      usuariosActivos,
      totalUsuarios
    );

  const porcentajeSecciones =
    porcentaje(
      seccionesActivas,
      totalSecciones
    );

  const porcentajePlantillas =
    porcentaje(
      plantillasActivas,
      totalPlantillas
    );

  return (
    <div className="admin-page">

      {/* SIDEBAR */}
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
            {usuarioActual?.email
              ? usuarioActual.email
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div>
            <strong>
              Administrador
            </strong>

            <span>
              {usuarioActual?.email}
            </span>
          </div>

        </div>


        <nav className="admin-menu">

          <Link to="/admin">
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

          <Link
            to="/admin/estadisticas"
            className="active"
          >
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


      {/* CONTENIDO */}
      <main className="admin-main">

        <header className="admin-header">

          <div>

            <span className="admin-header-label">
              INFORMACIÓN DEL SISTEMA
            </span>

            <h1>
              Estadísticas de uso
            </h1>

            <p>
              Consulta un resumen general
              sobre el uso y configuración
              actual de PoliCV.
            </p>

          </div>


          <div className="admin-header-account">

            <div>
              <span>
                Sesión iniciada como
              </span>

              <strong>
                {usuarioActual?.email}
              </strong>
            </div>

            <div className="admin-header-avatar">
              {usuarioActual?.email
                ? usuarioActual.email
                    .charAt(0)
                    .toUpperCase()
                : "A"}
            </div>

          </div>

        </header>


        <div className="admin-content">

          {error && (
            <div className="users-message error">
              {error}
            </div>
          )}


          {/* ENCABEZADO */}
          <section className="statistics-heading">

            <div>

              <span>
                RESUMEN GENERAL
              </span>

              <h2>
                Estado actual de PoliCV
              </h2>

              <p>
                Los siguientes indicadores
                muestran información general
                de usuarios, configuración y
                propuestas de mejora.
              </p>

            </div>


            <Link
              to="/admin"
              className="users-back-link"
            >
              Volver al panel
            </Link>

          </section>


          {/* TARJETAS PRINCIPALES */}
          <section className="statistics-summary-grid">

            <article className="statistics-summary-card">

              <span>
                USUARIOS
              </span>

              <strong>
                {totalUsuarios}
              </strong>

              <p>
                Usuarios registrados
              </p>

            </article>


            <article className="statistics-summary-card">

              <span>
                ESTUDIANTES
              </span>

              <strong>
                {estudiantes}
              </strong>

              <p>
                Cuentas de estudiantes
              </p>

            </article>


            <article className="statistics-summary-card">

              <span>
                SECCIONES
              </span>

              <strong>
                {totalSecciones}
              </strong>

              <p>
                Secciones configuradas
              </p>

            </article>


            <article className="statistics-summary-card">

              <span>
                PLANTILLAS
              </span>

              <strong>
                {totalPlantillas}
              </strong>

              <p>
                Plantillas registradas
              </p>

            </article>


            <article className="statistics-summary-card">

              <span>
                PROPUESTAS
              </span>

              <strong>
                {totalPropuestas}
              </strong>

              <p>
                Propuestas recibidas
              </p>

            </article>

          </section>


          {/* CÍRCULOS */}
          <section className="statistics-card">

            <div className="statistics-card-heading">

              <div>

                <span>
                  INDICADORES
                </span>

                <h3>
                  Estado general
                </h3>

              </div>

              <p>
                Porcentaje de elementos
                activos en la plataforma.
              </p>

            </div>


            <div className="statistics-circles">

              <article className="statistics-circle-item">

                <div
                  className="statistics-circle"
                  style={{
                    background: `conic-gradient(
                      var(--admin-teal) ${porcentajeActivos}%,
                      #e5edf2 ${porcentajeActivos}% 100%
                    )`
                  }}
                >

                  <div className="statistics-circle-center">
                    <strong>
                      {porcentajeActivos}%
                    </strong>

                    <span>
                      Activos
                    </span>
                  </div>

                </div>


                <h4>
                  Usuarios
                </h4>

                <p>
                  {usuariosActivos} de {totalUsuarios}
                  {" "}usuarios activos
                </p>

              </article>


              <article className="statistics-circle-item">

                <div
                  className="statistics-circle"
                  style={{
                    background: `conic-gradient(
                      var(--admin-blue) ${porcentajeSecciones}%,
                      #e5edf2 ${porcentajeSecciones}% 100%
                    )`
                  }}
                >

                  <div className="statistics-circle-center">
                    <strong>
                      {porcentajeSecciones}%
                    </strong>

                    <span>
                      Activas
                    </span>
                  </div>

                </div>


                <h4>
                  Secciones
                </h4>

                <p>
                  {seccionesActivas} de {totalSecciones}
                  {" "}secciones activas
                </p>

              </article>


              <article className="statistics-circle-item">

                <div
                  className="statistics-circle"
                  style={{
                    background: `conic-gradient(
                      #4f7fa3 ${porcentajePlantillas}%,
                      #e5edf2 ${porcentajePlantillas}% 100%
                    )`
                  }}
                >

                  <div className="statistics-circle-center">
                    <strong>
                      {porcentajePlantillas}%
                    </strong>

                    <span>
                      Activas
                    </span>
                  </div>

                </div>


                <h4>
                  Plantillas
                </h4>

                <p>
                  {plantillasActivas} de {totalPlantillas}
                  {" "}plantillas activas
                </p>

              </article>

            </div>

          </section>


          {/* BARRAS */}
          <section className="statistics-two-columns">

            {/* USUARIOS */}
            <article className="statistics-card">

              <div className="statistics-card-heading">

                <div>

                  <span>
                    USUARIOS
                  </span>

                  <h3>
                    Distribución de cuentas
                  </h3>

                </div>

              </div>


              <div className="statistics-bars">

                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Estudiantes
                    </span>

                    <strong>
                      {estudiantes}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill teal"
                      style={{
                        width:
                          `${porcentaje(
                            estudiantes,
                            totalUsuarios
                          )}%`
                      }}
                    />

                  </div>

                </div>


                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Administradores
                    </span>

                    <strong>
                      {administradores}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill blue"
                      style={{
                        width:
                          `${porcentaje(
                            administradores,
                            totalUsuarios
                          )}%`
                      }}
                    />

                  </div>

                </div>


                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Usuarios activos
                    </span>

                    <strong>
                      {usuariosActivos}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill teal"
                      style={{
                        width:
                          `${porcentajeActivos}%`
                      }}
                    />

                  </div>

                </div>


                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Usuarios inactivos
                    </span>

                    <strong>
                      {usuariosInactivos}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill gray"
                      style={{
                        width:
                          `${porcentaje(
                            usuariosInactivos,
                            totalUsuarios
                          )}%`
                      }}
                    />

                  </div>

                </div>

              </div>

            </article>


            {/* PROPUESTAS */}
            <article className="statistics-card">

              <div className="statistics-card-heading">

                <div>

                  <span>
                    PROPUESTAS
                  </span>

                  <h3>
                    Estado de propuestas
                  </h3>

                </div>

              </div>


              <div className="statistics-bars">

                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Pendientes
                    </span>

                    <strong>
                      {propuestasPendientes}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill pending"
                      style={{
                        width:
                          `${porcentaje(
                            propuestasPendientes,
                            totalPropuestas
                          )}%`
                      }}
                    />

                  </div>

                </div>


                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Aceptadas
                    </span>

                    <strong>
                      {propuestasAceptadas}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill accepted"
                      style={{
                        width:
                          `${porcentaje(
                            propuestasAceptadas,
                            totalPropuestas
                          )}%`
                      }}
                    />

                  </div>

                </div>


                <div className="statistics-bar-item">

                  <div className="statistics-bar-info">

                    <span>
                      Rechazadas
                    </span>

                    <strong>
                      {propuestasRechazadas}
                    </strong>

                  </div>


                  <div className="statistics-bar-track">

                    <div
                      className="statistics-bar-fill rejected"
                      style={{
                        width:
                          `${porcentaje(
                            propuestasRechazadas,
                            totalPropuestas
                          )}%`
                      }}
                    />

                  </div>

                </div>

              </div>

            </article>

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminStatisticsPage;