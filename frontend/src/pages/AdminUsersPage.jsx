import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/admin.css";

function AdminUsersPage() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [buscar, setBuscar] = useState("");
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

  const cargarUsuarios = async (termino = "") => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get(
        "/admin/usuarios",
        {
          params: {
            buscar: termino
          }
        }
      );

      setUsuarios(
        response.data.usuarios || []
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar los usuarios"
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
          "/admin/usuarios",
          {
            params: {
              buscar: ""
            }
          }
        );

        if (!activo) {
          return;
        }

        setUsuarios(
          response.data.usuarios || []
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar los usuarios"
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

  const buscarUsuarios = async (e) => {
    e.preventDefault();

    setMensaje("");

    await cargarUsuarios(
      buscar.trim()
    );
  };

  const mostrarTodos = async () => {
    setBuscar("");
    setMensaje("");
    setError("");

    await cargarUsuarios();
  };

  const cambiarEstado = async (usuario) => {
    const nuevoEstado =
      !usuario.estado;

    const accion =
      nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} la cuenta de ${usuario.email}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/usuarios/${usuario.id_usuario}/estado`,
        {
          estado: nuevoEstado
        }
      );

      setMensaje(
        response.data.mensaje
      );

      await cargarUsuarios(
        buscar.trim()
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el estado del usuario"
      );
    }
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

          <Link
            to="/admin/usuarios"
            className="active"
          >
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


      {/* CONTENIDO */}
      <main className="admin-main">

        <header className="admin-header">

          <div>

            <span className="admin-header-label">
              GESTIÓN DE USUARIOS
            </span>

            <h1>
              Usuarios registrados
            </h1>

            <p>
              Consulta, busca y administra
              el estado de las cuentas
              registradas en PoliCV.
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
          <section className="users-heading">

            <div>

              <span className="users-label">
                ADMINISTRACIÓN
              </span>

              <h2>
                Gestionar usuarios
              </h2>

              <p>
                Revisa las cuentas existentes,
                identifica su rol y administra
                su acceso a la plataforma.
              </p>

            </div>


            <div className="users-counter">

              <span>
                Usuarios mostrados
              </span>

              <strong>
                {usuarios.length}
              </strong>

            </div>

          </section>


          {/* BUSCADOR */}
          <section className="users-search-card">

            <div className="users-search-title">

              <div>

                <span>
                  BÚSQUEDA
                </span>

                <h3>
                  Buscar usuario
                </h3>

              </div>

              <p>
                Busca por nombre,
                apellido o correo institucional.
              </p>

            </div>


            <form
              className="users-search-form"
              onSubmit={buscarUsuarios}
            >

              <input
                type="text"
                value={buscar}
                onChange={(e) =>
                  setBuscar(
                    e.target.value
                  )
                }
                placeholder="Nombre, apellido o correo..."
              />

              <button
                type="submit"
                className="users-btn-primary"
              >
                Buscar
              </button>

              <button
                type="button"
                className="users-btn-secondary"
                onClick={mostrarTodos}
              >
                Mostrar todos
              </button>

            </form>

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
          <section className="users-table-card">

            <div className="users-table-header">

              <div>

                <span>
                  LISTADO
                </span>

                <h3>
                  Usuarios de PoliCV
                </h3>

              </div>


              <Link
                to="/admin"
                className="users-back-link"
              >
                Volver al panel
              </Link>

            </div>


            {cargando ? (

              <div className="users-loading">
                Cargando usuarios...
              </div>

            ) : usuarios.length === 0 ? (

              <div className="users-empty">

                <strong>
                  No se encontraron usuarios
                </strong>

                <p>
                  Intenta realizar otra búsqueda
                  o selecciona Mostrar todos.
                </p>

              </div>

            ) : (

              <div className="users-table-wrapper">

                <table className="users-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Correo institucional</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>

                  </thead>


                  <tbody>

                    {usuarios.map((usuario) => {

                      const nombreCompleto =
                        `${usuario.nombres || ""} ${usuario.apellidos || ""}`
                          .trim();

                      const estaActivo =
                        usuario.estado;

                      return (
                        <tr
                          key={
                            usuario.id_usuario
                          }
                        >

                          <td className="user-id">
                            #{usuario.id_usuario}
                          </td>


                          <td>

                            <div className="user-cell">

                              <div className="user-table-avatar">

                                {nombreCompleto
                                  ? nombreCompleto
                                      .charAt(0)
                                      .toUpperCase()
                                  : usuario.email
                                      ?.charAt(0)
                                      .toUpperCase()
                                }

                              </div>


                              <div>

                                <strong>
                                  {nombreCompleto ||
                                    "Sin nombre registrado"}
                                </strong>

                                <span>
                                  Usuario PoliCV
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>
                            {usuario.email}
                          </td>


                          <td>

                            <span
                              className={
                                usuario.rol ===
                                "Administrador"
                                  ? "role-badge admin"
                                  : "role-badge student"
                              }
                            >
                              {usuario.rol}
                            </span>

                          </td>


                          <td>

                            <span
                              className={
                                estaActivo
                                  ? "status-badge active"
                                  : "status-badge inactive"
                              }
                            >
                              {estaActivo
                                ? "Activo"
                                : "Inactivo"}
                            </span>

                          </td>


                          <td>

                            <button
                              type="button"
                              className={
                                estaActivo
                                  ? "user-action deactivate"
                                  : "user-action activate"
                              }
                              onClick={() =>
                                cambiarEstado(
                                  usuario
                                )
                              }
                            >
                              {estaActivo
                                ? "Desactivar"
                                : "Activar"}
                            </button>

                          </td>

                        </tr>
                      );
                    })}

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

export default AdminUsersPage;