import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/profile.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    fotografia_url: "",
    linkedin_url: "",
    github_url: "",
    sitio_web: "",
  });

  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  // Cargar perfil al ingresar a la página
  useEffect(() => {
    let activo = true;

    const obtenerPerfil = async () => {
      try {
        const response = await api.get("/perfil");

        if (!activo) return;

        const datos = response.data.perfil;

        setEmail(datos.email || "");

        setPerfil({
          nombres: datos.nombres || "",
          apellidos: datos.apellidos || "",
          telefono: datos.telefono || "",
          direccion: datos.direccion || "",
          fotografia_url: datos.fotografia_url || "",
          linkedin_url: datos.linkedin_url || "",
          github_url: datos.github_url || "",
          sitio_web: datos.sitio_web || "",
        });
      } catch (error) {
        if (!activo) return;

        // Si el token no es válido, regresar al login
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("usuario");

          navigate("/iniciar-sesion");
          return;
        }

        setError("No se pudo cargar el perfil");
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    obtenerPerfil();

    return () => {
      activo = false;
    };
  }, [navigate]);

  // Actualizar los campos del formulario
  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar cambios del perfil
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    try {
      const response = await api.put("/perfil", perfil);

      setMensaje(response.data.mensaje);

      if (response.data.perfil) {
        const datos = response.data.perfil;

        setPerfil({
          nombres: datos.nombres || "",
          apellidos: datos.apellidos || "",
          telefono: datos.telefono || "",
          direccion: datos.direccion || "",
          fotografia_url: datos.fotografia_url || "",
          linkedin_url: datos.linkedin_url || "",
          github_url: datos.github_url || "",
          sitio_web: datos.sitio_web || "",
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudo actualizar el perfil"
      );
    }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };

  if (cargando) {
    return (
      <p className="profile-loading">
        Cargando perfil...
      </p>
    );
  }

  return (
    <main className="profile-page">

      <header className="profile-header">
        <h1>PoliCV</h1>

        <button
          type="button"
          className="logout-button"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </header>

      <section className="profile-container">

        <div className="profile-title">
          <h2>Mi perfil</h2>

          <p>
            Mantén actualizada tu información personal y profesional.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="profile-grid">

            <div>
              <label>Nombre</label>

              <input
                type="text"
                name="nombres"
                value={perfil.nombres}
                onChange={handleChange}
                placeholder="Nombre"
              />
            </div>

            <div>
              <label>Apellido</label>

              <input
                type="text"
                name="apellidos"
                value={perfil.apellidos}
                onChange={handleChange}
                placeholder="Apellido"
              />
            </div>

            <div>
              <label>Correo institucional</label>

              <input
                type="email"
                value={email}
                disabled
              />
            </div>

            <div>
              <label>Teléfono</label>

              <input
                type="text"
                name="telefono"
                value={perfil.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
              />
            </div>

            <div className="full-field">
              <label>Dirección</label>

              <input
                type="text"
                name="direccion"
                value={perfil.direccion}
                onChange={handleChange}
                placeholder="Dirección"
              />
            </div>

            <div>
              <label>LinkedIn</label>

              <input
                type="url"
                name="linkedin_url"
                value={perfil.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label>GitHub</label>

              <input
                type="url"
                name="github_url"
                value={perfil.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label>Sitio web</label>

              <input
                type="url"
                name="sitio_web"
                value={perfil.sitio_web}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <label>URL de fotografía</label>

              <input
                type="url"
                name="fotografia_url"
                value={perfil.fotografia_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

          </div>

          {error && (
            <p className="message error">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="message success">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            className="save-profile-button"
          >
            Guardar cambios
          </button>

        </form>

      </section>

    </main>
  );
}

export default ProfilePage;