import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/admin.css";

function AdminTemplatesPage() {
  const navigate = useNavigate();

  const [plantillas, setPlantillas] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    imagen_url: ""
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

  const cargarPlantillas = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get(
        "/admin/plantillas"
      );

      setPlantillas(
        response.data.plantillas || []
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las plantillas"
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
          "/admin/plantillas"
        );

        if (!activo) {
          return;
        }

        setPlantillas(
          response.data.plantillas || []
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar las plantillas"
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
      codigo: "",
      descripcion: "",
      imagen_url: ""
    });

    setIdEdicion(null);
  };

  const guardarPlantilla = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.nombre.trim()) {
      setError(
        "El nombre de la plantilla es obligatorio"
      );

      return;
    }

    if (!form.codigo.trim()) {
      setError(
        "El código de la plantilla es obligatorio"
      );

      return;
    }

    try {
      let response;

      const datos = {
        nombre:
          form.nombre.trim(),

        codigo:
          form.codigo.trim(),

        descripcion:
          form.descripcion.trim(),

        imagen_url:
          form.imagen_url.trim()
      };

      if (idEdicion) {
        response = await api.put(
          `/admin/plantillas/${idEdicion}`,
          datos
        );

      } else {
        response = await api.post(
          "/admin/plantillas",
          datos
        );
      }

      setMensaje(
        response.data.mensaje
      );

      limpiarFormulario();

      await cargarPlantillas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar la plantilla"
      );
    }
  };

  const editarPlantilla = (plantilla) => {
    setIdEdicion(
      plantilla.id_plantilla
    );

    setForm({
      nombre:
        plantilla.nombre || "",

      codigo:
        plantilla.codigo || "",

      descripcion:
        plantilla.descripcion || "",

      imagen_url:
        plantilla.imagen_url || ""
    });

    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const cambiarEstado = async (plantilla) => {
    const nuevoEstado =
      !plantilla.estado;

    const accion =
      nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmar = window.confirm(
      `¿Deseas ${accion} la plantilla "${plantilla.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/plantillas/${plantilla.id_plantilla}/estado`,
        {
          estado: nuevoEstado
        }
      );

      setMensaje(
        response.data.mensaje
      );

      await cargarPlantillas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el estado de la plantilla"
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

          <Link to="/admin/secciones">
            <span>03</span>
            Secciones del CV
          </Link>

          <Link
            to="/admin/plantillas"
            className="active"
          >
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
              CONFIGURACIÓN VISUAL
            </span>

            <h1>
              Plantillas
            </h1>

            <p>
              Administra los diseños disponibles
              para la presentación de los
              currículums de los estudiantes.
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
          <section className="templates-admin-heading">

            <div>

              <span className="templates-admin-label">
                ADMINISTRACIÓN
              </span>

              <h2>
                Gestionar plantillas
              </h2>

              <p>
                Registra nuevos diseños, modifica
                su información y controla cuáles
                permanecen disponibles para los estudiantes.
              </p>

            </div>


            <div className="templates-admin-counter">

              <span>
                Plantillas registradas
              </span>

              <strong>
                {plantillas.length}
              </strong>

            </div>

          </section>


          {/* FORMULARIO */}
          <section className="templates-admin-form-card">

            <div className="templates-admin-form-info">

              <span>
                {idEdicion
                  ? "EDITAR PLANTILLA"
                  : "NUEVA PLANTILLA"}
              </span>

              <h3>
                {idEdicion
                  ? "Actualizar diseño"
                  : "Registrar plantilla"}
              </h3>

              <p>
                Define un nombre, código,
                descripción y una imagen
                representativa para identificar
                cada diseño.
              </p>

            </div>


            <form
              className="templates-admin-form"
              onSubmit={guardarPlantilla}
            >

              <div className="templates-admin-field">

                <label htmlFor="nombre">
                  Nombre
                </label>

                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ejemplo: Moderna"
                />

              </div>


              <div className="templates-admin-field">

                <label htmlFor="codigo">
                  Código
                </label>

                <input
                  id="codigo"
                  type="text"
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="Ejemplo: moderna"
                />

              </div>


              <div className="templates-admin-field full">

                <label htmlFor="descripcion">
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe brevemente el estilo de la plantilla..."
                  rows="4"
                />

              </div>


              <div className="templates-admin-field full">

                <label htmlFor="imagen_url">
                  URL de imagen
                </label>

                <input
                  id="imagen_url"
                  type="text"
                  name="imagen_url"
                  value={form.imagen_url}
                  onChange={handleChange}
                  placeholder="Ejemplo: /images/plantilla1.png"
                />

                <small>
                  Puedes utilizar una ruta de imagen
                  almacenada en PoliCV.
                </small>

              </div>


              <div className="templates-admin-form-actions">

                <button
                  type="submit"
                  className="templates-admin-btn-primary"
                >
                  {idEdicion
                    ? "Guardar cambios"
                    : "Crear plantilla"}
                </button>


                {idEdicion && (
                  <button
                    type="button"
                    className="templates-admin-btn-secondary"
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
          <section className="templates-admin-table-card">

            <div className="templates-admin-table-header">

              <div>

                <span>
                  DISEÑOS DISPONIBLES
                </span>

                <h3>
                  Plantillas de PoliCV
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
                Cargando plantillas...
              </div>

            ) : plantillas.length === 0 ? (

              <div className="users-empty">

                <strong>
                  No existen plantillas registradas
                </strong>

                <p>
                  Utiliza el formulario superior
                  para registrar la primera plantilla.
                </p>

              </div>

            ) : (

              <div className="users-table-wrapper">

                <table className="templates-admin-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Plantilla</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {plantillas.map(
                      (plantilla) => {

                        const activa =
                          plantilla.estado;

                        return (
                          <tr
                            key={
                              plantilla.id_plantilla
                            }
                          >

                            <td className="user-id">
                              #{plantilla.id_plantilla}
                            </td>


                            <td>

                              <div className="template-admin-name-cell">

                                <div className="template-admin-icon">
                                  CV
                                </div>

                                <div>

                                  <strong>
                                    {plantilla.nombre}
                                  </strong>

                                  <span>
                                    Diseño PoliCV
                                  </span>

                                </div>

                              </div>

                            </td>


                            <td>

                              <span className="template-code">
                                {plantilla.codigo}
                              </span>

                            </td>


                            <td className="template-admin-description">
                              {plantilla.descripcion ||
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
                                    editarPlantilla(
                                      plantilla
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
                                      plantilla
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

export default AdminTemplatesPage;