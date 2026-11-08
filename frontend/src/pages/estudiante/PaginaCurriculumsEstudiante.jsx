import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";

function StudentCVPage() {
  const navigate = useNavigate();

  const [curriculums, setCurriculums] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    titulo_profesional: "",
    resumen_profesional: "",
    id_plantilla: ""
  });

  const [idEdicion, setIdEdicion] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

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

  const cargarCurriculums = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await api.get(
        "/curriculums"
      );

      const lista =
        response.data.curriculums ||
        response.data.datos ||
        [];

      setCurriculums(lista);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar los currículums"
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
          "/curriculums"
        );

        if (!activo) {
          return;
        }

        const lista =
          response.data.curriculums ||
          response.data.datos ||
          [];

        setCurriculums(lista);

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar los currículums"
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
      titulo_profesional: "",
      resumen_profesional: "",
      id_plantilla: ""
    });

    setIdEdicion(null);
  };

  const guardarCurriculum = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!form.nombre.trim()) {
      setError(
        "El nombre del currículum es obligatorio"
      );

      return;
    }

    try {
      const datos = {
        nombre:
          form.nombre.trim(),

        titulo_profesional:
          form.titulo_profesional.trim(),

        resumen_profesional:
          form.resumen_profesional.trim(),

        id_plantilla:
          form.id_plantilla
            ? Number(form.id_plantilla)
            : null
      };

      let response;

      if (idEdicion) {
        response = await api.put(
          `/curriculums/${idEdicion}`,
          datos
        );

      } else {
        response = await api.post(
          "/curriculums",
          datos
        );
      }

      setMensaje(
        response.data.mensaje ||
        (
          idEdicion
            ? "Currículum actualizado correctamente"
            : "Currículum creado correctamente"
        )
      );

      limpiarFormulario();

      await cargarCurriculums();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar el currículum"
      );
    }
  };

  const editarCurriculum = (curriculum) => {
    setIdEdicion(
      curriculum.id_curriculum
    );

    setForm({
      nombre:
        curriculum.nombre || "",

      titulo_profesional:
        curriculum.titulo_profesional || "",

      resumen_profesional:
        curriculum.resumen_profesional || "",

      id_plantilla:
        curriculum.id_plantilla || ""
    });

    setError("");
    setMensaje("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const eliminarCurriculum = async (
    curriculum
  ) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar el currículum "${curriculum.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.delete(
        `/curriculums/${curriculum.id_curriculum}`
      );

      setMensaje(
        response.data.mensaje ||
        "Currículum eliminado correctamente"
      );

      await cargarCurriculums();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo eliminar el currículum"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(
      fecha
    ).toLocaleDateString();
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

          <Link to="/estudiante">
            <span>01</span>
            Inicio
          </Link>

          <Link to="/perfil">
            <span>02</span>
            Mi perfil
          </Link>

          <Link
            to="/estudiante/curriculums"
            className="active"
          >
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
              GESTIÓN DEL CURRÍCULUM
            </span>

            <h1>
              Mis currículums
            </h1>

            <p>
              Crea y administra diferentes
              versiones de tu currículum profesional.
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

          {/* CABECERA */}
          <section className="cv-heading">

            <div>

              <span>
                CURRÍCULUM PROFESIONAL
              </span>

              <h2>
                Gestiona tus currículums
              </h2>

              <p>
                Puedes crear diferentes versiones
                de tu CV y completar la información
                necesaria para cada una.
              </p>

            </div>


            <div className="cv-counter">

              <span>
                Currículums creados
              </span>

              <strong>
                {curriculums.length}
              </strong>

            </div>

          </section>


          {/* FORMULARIO */}
          <section className="cv-form-card">

            <div className="cv-form-info">

              <span>
                {idEdicion
                  ? "EDITAR CURRÍCULUM"
                  : "NUEVO CURRÍCULUM"}
              </span>

              <h3>
                {idEdicion
                  ? "Actualizar currículum"
                  : "Crear currículum"}
              </h3>

              <p>
                Asigna un nombre para identificar
                tu CV y registra la información
                profesional principal.
              </p>

            </div>


            <form
              className="cv-form"
              onSubmit={guardarCurriculum}
            >

              <div className="cv-field">

                <label htmlFor="nombre">
                  Nombre del currículum
                </label>

                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ejemplo: CV Desarrollo Software"
                />

              </div>


              <div className="cv-field">

                <label htmlFor="titulo_profesional">
                  Título profesional
                </label>

                <input
                  id="titulo_profesional"
                  type="text"
                  name="titulo_profesional"
                  value={
                    form.titulo_profesional
                  }
                  onChange={handleChange}
                  placeholder="Ejemplo: Desarrollador de Software"
                />

              </div>


              <div className="cv-field full">

                <label htmlFor="resumen_profesional">
                  Resumen profesional
                </label>

                <textarea
                  id="resumen_profesional"
                  name="resumen_profesional"
                  value={
                    form.resumen_profesional
                  }
                  onChange={handleChange}
                  rows="5"
                  placeholder="Escribe una breve descripción de tu perfil profesional..."
                />

              </div>


              <div className="cv-field">

                <label htmlFor="id_plantilla">
                  ID de plantilla
                </label>

                <input
                  id="id_plantilla"
                  type="number"
                  min="1"
                  name="id_plantilla"
                  value={form.id_plantilla}
                  onChange={handleChange}
                  placeholder="Ejemplo: 1"
                />

                <small>
                  Puedes dejarlo vacío y seleccionar
                  una plantilla posteriormente.
                </small>

              </div>


              <div className="cv-form-actions">

                <button
                  type="submit"
                  className="cv-primary-button"
                >
                  {idEdicion
                    ? "Guardar cambios"
                    : "Crear currículum"}
                </button>


                {idEdicion && (
                  <button
                    type="button"
                    className="cv-secondary-button"
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
            <div className="cv-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="cv-message success">
              {mensaje}
            </div>
          )}


          {/* LISTADO */}
          <section className="cv-list-card">

            <div className="cv-list-header">

              <div>

                <span>
                  MIS DOCUMENTOS
                </span>

                <h3>
                  Currículums creados
                </h3>

              </div>

              <p>
                Selecciona Gestionar contenido
                para completar las secciones.
              </p>

            </div>


            {cargando ? (

              <div className="cv-empty">
                Cargando currículums...
              </div>

            ) : curriculums.length === 0 ? (

              <div className="cv-empty">

                <strong>
                  Todavía no tienes currículums
                </strong>

                <p>
                  Utiliza el formulario superior
                  para crear tu primer currículum.
                </p>

              </div>

            ) : (

              <div className="cv-table-wrapper">

                <table className="cv-table">

                  <thead>

                    <tr>
                      <th>Currículum</th>
                      <th>Título profesional</th>
                      <th>Plantilla</th>
                      <th>Actualización</th>
                      <th>Acciones</th>
                    </tr>

                  </thead>


                  <tbody>

                    {curriculums.map(
                      (curriculum) => (

                        <tr
                          key={
                            curriculum.id_curriculum
                          }
                        >

                          <td>

                            <div className="cv-name-cell">

                              <div className="cv-document-icon">
                                CV
                              </div>

                              <div>

                                <strong>
                                  {curriculum.nombre}
                                </strong>

                                <span>
                                  Currículum PoliCV
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>
                            {curriculum.titulo_profesional ||
                              "Sin título profesional"}
                          </td>


                          <td>

                            {curriculum.nombre_plantilla ? (
                              <span className="cv-template-badge">
                                {
                                  curriculum.nombre_plantilla
                                }
                              </span>
                            ) : (
                              <span className="cv-no-template">
                                Sin plantilla
                              </span>
                            )}

                          </td>


                          <td>
                            {formatearFecha(
                              curriculum.actualizado_en ||
                              curriculum.updated_at ||
                              curriculum.fecha_actualizacion
                            )}
                          </td>


                          <td>

                            <div className="cv-actions">

                              <Link
                                to={
                                  `/estudiante/curriculums/${curriculum.id_curriculum}`
                                }
                                className="cv-manage-button"
                              >
                                Gestionar contenido
                              </Link>


                              <button
                                type="button"
                                className="cv-edit-button"
                                onClick={() =>
                                  editarCurriculum(
                                    curriculum
                                  )
                                }
                              >
                                Editar
                              </button>


                              <button
                                type="button"
                                className="cv-delete-button"
                                onClick={() =>
                                  eliminarCurriculum(
                                    curriculum
                                  )
                                }
                              >
                                Eliminar
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

export default StudentCVPage;