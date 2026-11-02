import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/admin.css";

function AdminProposalsPage() {
  const navigate = useNavigate();

  const [propuestas, setPropuestas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
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

  const cargarPropuestas = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get(
        "/admin/propuestas"
      );

      setPropuestas(
        response.data.propuestas || []
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las propuestas"
      );

    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargarInicial = async () => {
      try {
        const response = await api.get(
          "/admin/propuestas"
        );

        if (!activo) {
          return;
        }

        setPropuestas(
          response.data.propuestas || []
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar las propuestas"
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarInicial();

    return () => {
      activo = false;
    };
  }, []);

  const actualizarPropuesta = async (
    propuesta,
    nuevoEstado
  ) => {
    let respuestaAdmin =
      propuesta.respuesta_admin || "";

    if (
      nuevoEstado === "aceptada" ||
      nuevoEstado === "rechazada"
    ) {
      const respuesta = window.prompt(
        nuevoEstado === "aceptada"
          ? "Escribe una respuesta para aceptar la propuesta:"
          : "Escribe una respuesta para rechazar la propuesta:",
        respuestaAdmin
      );

      if (respuesta === null) {
        return;
      }

      respuestaAdmin =
        respuesta.trim();
    }

    const nombresEstados = {
      en_revision: "marcar en revisión",
      aceptada: "aceptar",
      rechazada: "rechazar"
    };

    const confirmar = window.confirm(
      `¿Deseas ${nombresEstados[nuevoEstado]} la propuesta "${propuesta.titulo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/propuestas/${propuesta.id_propuesta}`,
        {
          estado: nuevoEstado,
          respuesta_admin:
            respuestaAdmin || null
        }
      );

      setMensaje(
        response.data.mensaje
      );

      await cargarPropuestas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar la propuesta"
      );
    }
  };

  const obtenerNombreEstudiante = (
    propuesta
  ) => {
    const nombre =
      `${propuesta.nombres || ""} ${propuesta.apellidos || ""}`
        .trim();

    return nombre ||
      "Estudiante";
  };

  const obtenerEstadoTexto = (
    estado
  ) => {
    const estados = {
      pendiente: "Pendiente",
      en_revision: "En revisión",
      aceptada: "Aceptada",
      rechazada: "Rechazada"
    };

    return estados[estado] ||
      estado;
  };

  const contarEstado = (estado) => {
    return propuestas.filter(
      (propuesta) =>
        propuesta.estado === estado
    ).length;
  };

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

          <Link to="/admin/estadisticas">
            <span>05</span>
            Estadísticas
          </Link>

          <Link
            to="/admin/propuestas"
            className="active"
          >
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
              MEJORA CONTINUA
            </span>

            <h1>
              Propuestas de mejora
            </h1>

            <p>
              Revisa las sugerencias enviadas
              por los estudiantes y registra
              una respuesta administrativa.
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

          {/* ENCABEZADO */}
          <section className="proposals-heading">

            <div>

              <span>
                PARTICIPACIÓN ESTUDIANTIL
              </span>

              <h2>
                Gestionar propuestas
              </h2>

              <p>
                Consulta las sugerencias enviadas
                por los estudiantes, revisa su
                estado y responde cada solicitud.
              </p>

            </div>


            <Link
              to="/admin"
              className="users-back-link"
            >
              Volver al panel
            </Link>

          </section>


          {/* RESUMEN */}
          <section className="proposals-summary">

            <article>
              <span>
                TOTAL
              </span>

              <strong>
                {propuestas.length}
              </strong>

              <p>
                Propuestas recibidas
              </p>
            </article>


            <article>
              <span>
                PENDIENTES
              </span>

              <strong>
                {contarEstado(
                  "pendiente"
                )}
              </strong>

              <p>
                Esperando revisión
              </p>
            </article>


            <article>
              <span>
                EN REVISIÓN
              </span>

              <strong>
                {contarEstado(
                  "en_revision"
                )}
              </strong>

              <p>
                Actualmente revisadas
              </p>
            </article>


            <article>
              <span>
                ACEPTADAS
              </span>

              <strong>
                {contarEstado(
                  "aceptada"
                )}
              </strong>

              <p>
                Propuestas aprobadas
              </p>
            </article>


            <article>
              <span>
                RECHAZADAS
              </span>

              <strong>
                {contarEstado(
                  "rechazada"
                )}
              </strong>

              <p>
                Propuestas descartadas
              </p>
            </article>

          </section>


          {/* MENSAJES */}
          {error && (
            <div className="users-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="users-message success">
              {mensaje}
            </div>
          )}


          {/* TABLA */}
          <section className="proposals-table-card">

            <div className="proposals-table-header">

              <div>

                <span>
                  PROPUESTAS REGISTRADAS
                </span>

                <h3>
                  Solicitudes de mejora
                </h3>

              </div>

              <p>
                Administra el estado de
                cada propuesta recibida.
              </p>

            </div>


            {cargando ? (

              <div className="users-loading">
                Cargando propuestas...
              </div>

            ) : propuestas.length === 0 ? (

              <div className="users-empty">

                <strong>
                  No existen propuestas registradas
                </strong>

                <p>
                  Las propuestas enviadas por
                  los estudiantes aparecerán aquí.
                </p>

              </div>

            ) : (

              <div className="users-table-wrapper">

                <table className="proposals-table">

                  <thead>

                    <tr>
                      <th>Estudiante</th>
                      <th>Propuesta</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Respuesta</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {propuestas.map(
                      (propuesta) => (

                        <tr
                          key={
                            propuesta.id_propuesta
                          }
                        >

                          {/* ESTUDIANTE */}
                          <td>

                            <div className="proposal-student">

                              <div className="proposal-avatar">

                                {obtenerNombreEstudiante(
                                  propuesta
                                )
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {obtenerNombreEstudiante(
                                    propuesta
                                  )}
                                </strong>

                                <span>
                                  {propuesta.email}
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* TITULO */}
                          <td>

                            <strong className="proposal-title">
                              {propuesta.titulo}
                            </strong>

                          </td>


                          {/* DESCRIPCION */}
                          <td>

                            <p className="proposal-description">
                              {propuesta.descripcion}
                            </p>

                          </td>


                          {/* ESTADO */}
                          <td>

                            <span
                              className={
                                `proposal-status ${
                                  propuesta.estado
                                }`
                              }
                            >
                              {obtenerEstadoTexto(
                                propuesta.estado
                              )}
                            </span>

                          </td>


                          {/* RESPUESTA */}
                          <td>

                            {propuesta.respuesta_admin ? (

                              <p className="proposal-response">
                                {
                                  propuesta.respuesta_admin
                                }
                              </p>

                            ) : (

                              <span className="proposal-no-response">
                                Sin respuesta
                              </span>

                            )}

                          </td>


                          {/* ACCIONES */}
                          <td>

                            <div className="proposal-actions">

                              <button
                                type="button"
                                className="proposal-review-btn"
                                onClick={() =>
                                  actualizarPropuesta(
                                    propuesta,
                                    "en_revision"
                                  )
                                }
                              >
                                Revisar
                              </button>


                              <button
                                type="button"
                                className="proposal-accept-btn"
                                onClick={() =>
                                  actualizarPropuesta(
                                    propuesta,
                                    "aceptada"
                                  )
                                }
                              >
                                Aceptar
                              </button>


                              <button
                                type="button"
                                className="proposal-reject-btn"
                                onClick={() =>
                                  actualizarPropuesta(
                                    propuesta,
                                    "rechazada"
                                  )
                                }
                              >
                                Rechazar
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminProposalsPage;