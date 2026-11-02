import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/student.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    linkedin_url: "",
    github_url: "",
    sitio_web: "",
    fotografia_url: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

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

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      try {
        const response = await api.get(
          "/perfil"
        );

        if (!activo) {
          return;
        }

        const datos =
          response.data.perfil ||
          response.data.usuario ||
          response.data;

        setPerfil({
          nombres:
            datos.nombres || "",

          apellidos:
            datos.apellidos || "",

          email:
            datos.email ||
            usuario?.email ||
            "",

          telefono:
            datos.telefono || "",

          direccion:
            datos.direccion || "",

          linkedin_url:
            datos.linkedin_url || "",

          github_url:
            datos.github_url || "",

          sitio_web:
            datos.sitio_web || "",

          fotografia_url:
            datos.fotografia_url || ""
        });

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudo cargar el perfil"
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [usuario?.email]);

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setPerfil((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      const response = await api.put(
        "/perfil",
        {
          nombres:
            perfil.nombres,

          apellidos:
            perfil.apellidos,

          telefono:
            perfil.telefono,

          direccion:
            perfil.direccion,

          linkedin_url:
            perfil.linkedin_url,

          github_url:
            perfil.github_url,

          sitio_web:
            perfil.sitio_web,

          fotografia_url:
            perfil.fotografia_url
        }
      );

      setMensaje(
        response.data.mensaje ||
        "Perfil actualizado correctamente"
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el perfil"
      );

    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="profile-loading">
        Cargando perfil...
      </main>
    );
  }

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
            {perfil.nombres
              ? perfil.nombres
                  .charAt(0)
                  .toUpperCase()
              : usuario?.email
                ?.charAt(0)
                .toUpperCase() || "E"}
          </div>

          <div>
            <strong>
              {perfil.nombres ||
                "Estudiante"}
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

          <Link
            to="/perfil"
            className="active"
          >
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
              INFORMACIÓN PERSONAL
            </span>

            <h1>
              Mi perfil
            </h1>

            <p>
              Mantén actualizados tus datos
              personales y profesionales.
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
              {perfil.nombres
                ? perfil.nombres
                    .charAt(0)
                    .toUpperCase()
                : "E"}
            </div>

          </div>

        </header>


        <div className="student-content">

          {/* CABECERA PERFIL */}
          <section className="profile-hero">

            <div className="profile-photo-area">

              {perfil.fotografia_url ? (
                <img
                  src={perfil.fotografia_url}
                  alt="Fotografía de perfil"
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  {perfil.nombres
                    ? perfil.nombres
                        .charAt(0)
                        .toUpperCase()
                    : "E"}
                </div>
              )}

            </div>


            <div className="profile-hero-info">

              <span>
                PERFIL DEL ESTUDIANTE
              </span>

              <h2>
                {perfil.nombres || "Estudiante"}{" "}
                {perfil.apellidos || ""}
              </h2>

              <p>
                Completa tu información para que
                pueda utilizarse posteriormente
                en tus currículums y presentación
                profesional.
              </p>


              <div className="profile-hero-data">

                <div>
                  <span>
                    Correo institucional
                  </span>

                  <strong>
                    {perfil.email ||
                      usuario?.email}
                  </strong>
                </div>

                <div>
                  <span>
                    Teléfono
                  </span>

                  <strong>
                    {perfil.telefono ||
                      "No registrado"}
                  </strong>
                </div>

              </div>

            </div>

          </section>


          {/* FORMULARIO */}
          <section className="profile-form-card">

            <div className="profile-form-heading">

              <div>
                <span>
                  DATOS DEL PERFIL
                </span>

                <h2>
                  Información personal
                </h2>

                <p>
                  Edita los campos que necesites
                  actualizar.
                </p>
              </div>

            </div>


            <form
              onSubmit={guardarPerfil}
              className="profile-form"
            >

              <div className="profile-field">

                <label htmlFor="nombres">
                  Nombre
                </label>

                <input
                  id="nombres"
                  type="text"
                  name="nombres"
                  value={perfil.nombres}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label htmlFor="apellidos">
                  Apellido
                </label>

                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  value={perfil.apellidos}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="profile-field">

                <label>
                  Correo institucional
                </label>

                <input
                  type="email"
                  value={
                    perfil.email ||
                    usuario?.email ||
                    ""
                  }
                  disabled
                  className="profile-disabled"
                />

                <small>
                  El correo institucional no
                  puede modificarse desde el perfil.
                </small>

              </div>


              <div className="profile-field">

                <label htmlFor="telefono">
                  Teléfono
                </label>

                <input
                  id="telefono"
                  type="text"
                  name="telefono"
                  value={perfil.telefono}
                  onChange={handleChange}
                  placeholder="Ejemplo: 0999999999"
                />

              </div>


              <div className="profile-field full">

                <label htmlFor="direccion">
                  Dirección
                </label>

                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={perfil.direccion}
                  onChange={handleChange}
                  placeholder="Ciudad o dirección de residencia"
                />

              </div>


              <div className="profile-field">

                <label htmlFor="linkedin_url">
                  LinkedIn
                </label>

                <input
                  id="linkedin_url"
                  type="url"
                  name="linkedin_url"
                  value={perfil.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />

              </div>


              <div className="profile-field">

                <label htmlFor="github_url">
                  GitHub
                </label>

                <input
                  id="github_url"
                  type="url"
                  name="github_url"
                  value={perfil.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />

              </div>


              <div className="profile-field">

                <label htmlFor="sitio_web">
                  Sitio web
                </label>

                <input
                  id="sitio_web"
                  type="url"
                  name="sitio_web"
                  value={perfil.sitio_web}
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>


              <div className="profile-field">

                <label htmlFor="fotografia_url">
                  URL de fotografía
                </label>

                <input
                  id="fotografia_url"
                  type="url"
                  name="fotografia_url"
                  value={perfil.fotografia_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>


              {error && (
                <div className="profile-message error">
                  {error}
                </div>
              )}


              {mensaje && (
                <div className="profile-message success">
                  {mensaje}
                </div>
              )}


              <div className="profile-actions">

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>

                <Link
                  to="/estudiante"
                  className="profile-cancel-button"
                >
                  Volver al panel
                </Link>

              </div>

            </form>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ProfilePage;