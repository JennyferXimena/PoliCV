import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/admin.css";

function AdminSectionsPage() {
  const navigate = useNavigate();

  const [secciones, setSecciones] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: ""
  });

  const [idEdicion, setIdEdicion] = useState(null);

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

  const cargarSecciones = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get(
        "/admin/secciones"
      );

      setSecciones(
        response.data.secciones || []
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las secciones"
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
          "/admin/secciones"
        );

        if (!activo) {
          return;
        }

        setSecciones(
          response.data.secciones || []
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar las secciones"
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

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      descripcion: ""
    });

    setIdEdicion(null);
  };

  const guardarSeccion = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.nombre.trim()) {
      setError(
        "El nombre de la sección es obligatorio"
      );

      return;
    }

    try {
      let response;

      if (idEdicion) {
        response = await api.put(
          `/admin/secciones/${idEdicion}`,
          {
            nombre: form.nombre.trim(),
            descripcion:
              form.descripcion.trim()
          }
        );

      } else {
        response = await api.post(
          "/admin/secciones",
          {
            nombre: form.nombre.trim(),
            descripcion:
              form.descripcion.trim()
          }
        );
      }

      setMensaje(
        response.data.mensaje
      );

      limpiarFormulario();

      await cargarSecciones();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar la sección"
      );
    }
  };

  const editarSeccion = (seccion) => {
    setIdEdicion(
      seccion.id_seccion
    );

    setForm({
      nombre:
        seccion.nombre || "",

      descripcion:
        seccion.descripcion || ""
    });

    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const cambiarEstado = async (seccion) => {
    const nuevoEstado =
      !seccion.estado;

    const accion =
      nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} la sección "${seccion.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/secciones/${seccion.id_seccion}/estado`,
        {
          estado: nuevoEstado
        }
      );

      setMensaje(
        response.data.mensaje
      );

      await cargarSecciones();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el estado de la sección"
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

          <Link to="/admin/usuarios">
            <span>02</span>
            Gestionar usuarios
          </Link>

          <Link
            to="/admin/secciones"
            className="active"
          >
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
              CONFIGURACIÓN DEL CURRÍCULUM
            </span>

            <h1>
              Secciones del CV
            </h1>

            <p>
              Administra las secciones que forman
              parte del currículum de los estudiantes.
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
          <section className="sections-heading">

            <div>

              <span className="sections-label">
                ADMINISTRACIÓN
              </span>

              <h2>
                Gestionar secciones
              </h2>

              <p>
                Crea nuevas secciones, modifica
                su información y controla cuáles
                permanecen disponibles.
              </p>

            </div>


            <div className="sections-counter">

              <span>
                Secciones registradas
              </span>

              <strong>
                {secciones.length}
              </strong>

            </div>

          </section>


          {/* FORMULARIO */}
          <section className="sections-form-card">

            <div className="sections-form-info">

              <span>
                {idEdicion
                  ? "EDITAR SECCIÓN"
                  : "NUEVA SECCIÓN"}
              </span>

              <h3>
                {idEdicion
                  ? "Actualizar información"
                  : "Registrar sección"}
              </h3>

              <p>
                Define el nombre y una descripción
                clara para identificar la sección
                dentro del currículum.
              </p>

            </div>


            <form
              className="sections-form"
              onSubmit={guardarSeccion}
            >

              <div className="sections-field">

                <label htmlFor="nombre">
                  Nombre
                </label>

                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ejemplo: Formación académica"
                />

              </div>


              <div className="sections-field">

                <label htmlFor="descripcion">
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe brevemente el propósito de esta sección..."
                  rows="4"
                />

              </div>


              <div className="sections-form-actions">

                <button
                  type="submit"
                  className="sections-btn-primary"
                >
                  {idEdicion
                    ? "Guardar cambios"
                    : "Crear sección"}
                </button>


                {idEdicion && (
                  <button
                    type="button"
                    className="sections-btn-secondary"
                    onClick={limpiarFormulario}
                  >
                    Cancelar edición
                  </button>
                )}

              </div>

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
          <section className="sections-table-card">

            <div className="sections-table-header">

              <div>

                <span>
                  CONFIGURACIÓN ACTUAL
                </span>

                <h3>
                  Secciones disponibles
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
                Cargando secciones...
              </div>

            ) : secciones.length === 0 ? (

              <div className="users-empty">

                <strong>
                  No existen secciones registradas
                </strong>

                <p>
                  Utiliza el formulario superior
                  para crear la primera sección.
                </p>

              </div>

            ) : (

              <div className="users-table-wrapper">

                <table className="sections-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Sección</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {secciones.map(
                      (seccion) => {

                        const activa =
                          seccion.estado;

                        return (
                          <tr
                            key={
                              seccion.id_seccion
                            }
                          >

                            <td className="user-id">
                              #{seccion.id_seccion}
                            </td>


                            <td>

                              <div className="section-name-cell">

                                <div className="section-table-number">
                                  {seccion.id_seccion}
                                </div>

                                <strong>
                                  {seccion.nombre}
                                </strong>

                              </div>

                            </td>


                            <td className="section-description">
                              {seccion.descripcion ||
                                "Sin descripción"}
                            </td>


                            <td>

                              <span
                                className={
                                  activa
                                    ? "status-badge active"
                                    : "status-badge inactive"
                                }
                              >
                                {activa
                                  ? "Activa"
                                  : "Inactiva"}
                              </span>

                            </td>


                            <td>

                              <div className="section-actions">

                                <button
                                  type="button"
                                  className="section-edit-btn"
                                  onClick={() =>
                                    editarSeccion(
                                      seccion
                                    )
                                  }
                                >
                                  Editar
                                </button>


                                <button
                                  type="button"
                                  className={
                                    activa
                                      ? "user-action deactivate"
                                      : "user-action activate"
                                  }
                                  onClick={() =>
                                    cambiarEstado(
                                      seccion
                                    )
                                  }
                                >
                                  {activa
                                    ? "Desactivar"
                                    : "Activar"}
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
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

export default AdminSectionsPage;