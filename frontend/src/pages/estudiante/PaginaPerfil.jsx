import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";
import "../../styles/estudiante/perfil.css";

function PaginaPerfil() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const idCurriculum = parametros.get("volverCurriculum");

  const [carreras, setCarreras] = useState([]);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    ciudad_pais: "",
    id_carrera: "",
    estado_academico: "",
    titulo_profesional: "",
    fotografia_url: "",
    linkedin_url: "",
    github_url: "",
    sitio_web: ""
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const urlBackend = String(api.defaults.baseURL || "")
    .replace(/\/api\/?$/, "");

  const urlFotografia = form.fotografia_url
    ? form.fotografia_url.startsWith("http")
      ? form.fotografia_url
      : `${urlBackend}${form.fotografia_url}`
    : "";

  useEffect(() => {
    let activo = true;

    Promise.all([
      api.get("/configuracion-inicial"),
      api.get("/configuracion-inicial/carreras")
    ])
      .then(([responsePerfil, responseCarreras]) => {
        if (!activo) return;

        const perfil = responsePerfil.data?.perfil || {};

        setCarreras(responseCarreras.data?.carreras || []);

        setForm({
          nombres: perfil.nombres || "",
          apellidos: perfil.apellidos || "",
          email: perfil.email || "",
          telefono: perfil.telefono || "",
          ciudad_pais: perfil.ciudad_pais || "",
          id_carrera: perfil.id_carrera || "",
          estado_academico: perfil.estado_academico || "",
          titulo_profesional: perfil.titulo_profesional || "",
          fotografia_url: perfil.fotografia_url || "",
          linkedin_url: perfil.linkedin_url || "",
          github_url: perfil.github_url || "",
          sitio_web: perfil.sitio_web || ""
        });
      })
      .catch((errorPeticion) => {
        if (!activo) return;

        setError(
          errorPeticion.response?.data?.mensaje ||
          "No se pudo cargar el perfil"
        );
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const cambiarCampo = (e) => {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value
    }));

    setError("");
    setMensaje("");
  };

  const seleccionarFotografia = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    const extensiones = [".jpg", ".jpeg", ".png"];
    const nombre = archivo.name.toLowerCase();

    if (!extensiones.some((extension) => nombre.endsWith(extension))) {
      setError("La fotografía debe ser JPG, JPEG o PNG");
      e.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError("La fotografía no puede superar 5 MB");
      e.target.value = "";
      return;
    }

    setSubiendoFoto(true);
    setError("");
    setMensaje("");

    try {
      const datos = new FormData();
      datos.append("fotografia", archivo);

      const response = await api.post(
        "/configuracion-inicial/fotografia",
        datos
      );

      setForm((anterior) => ({
        ...anterior,
        fotografia_url: response.data?.fotografia_url || ""
      }));

      setMensaje("Fotografía cargada correctamente");
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo cargar la fotografía"
      );
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (
      !form.nombres.trim() ||
      !form.apellidos.trim() ||
      !form.telefono.trim() ||
      !form.ciudad_pais.trim() ||
      !form.id_carrera ||
      !form.estado_academico ||
      !form.titulo_profesional.trim()
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (!form.fotografia_url) {
      setError("Selecciona una fotografía para completar tu perfil");
      return;
    }

    setGuardando(true);

    try {
      const response = await api.put(
        "/configuracion-inicial",
        {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          telefono: form.telefono.trim(),
          ciudad_pais: form.ciudad_pais.trim(),
          id_carrera: Number(form.id_carrera),
          estado_academico: form.estado_academico,
          titulo_profesional: form.titulo_profesional.trim(),
          fotografia_url: form.fotografia_url,
          linkedin_url: form.linkedin_url.trim(),
          github_url: form.github_url.trim(),
          sitio_web: form.sitio_web.trim()
        }
      );

      const perfilActualizado = response.data?.perfil;

      setMensaje(
        response.data?.mensaje ||
        "Perfil actualizado correctamente"
      );

      if (usuarioGuardado) {
        const usuarioActualizado = {
          ...usuario,
          id_carrera: perfilActualizado?.id_carrera,
          carrera: perfilActualizado?.carrera,
          estado_academico:
            perfilActualizado?.estado_academico,
          perfil_completado: true
        };

        if (localStorage.getItem("usuario")) {
          localStorage.setItem(
            "usuario",
            JSON.stringify(usuarioActualizado)
          );
        } else {
          sessionStorage.setItem(
            "usuario",
            JSON.stringify(usuarioActualizado)
          );
        }
      }
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudieron guardar los cambios"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/iniciar-sesion");
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
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-logo">P</div>

          <div>
            <h2>PoliCV</h2>
            <span>Estudiante</span>
          </div>
        </div>

        <div className="student-profile-mini">
          {urlFotografia ? (
            <img
              src={urlFotografia}
              alt="Perfil"
              className="profile-sidebar-photo"
            />
          ) : (
            <div className="student-avatar">
              {form.nombres
                ? form.nombres.charAt(0).toUpperCase()
                : "E"}
            </div>
          )}

          <div>
            <strong>{form.nombres || "Estudiante"}</strong>
            <span>{form.email}</span>
          </div>
        </div>

        <nav className="student-menu">
          <Link to="/estudiante">
            <span>01</span>
            Inicio
          </Link>

          <Link
            to={
              idCurriculum
                ? `/perfil?volverCurriculum=${idCurriculum}`
                : "/perfil"
            }
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

      <main className="student-main">
        <header className="student-header">
          <div>
            <span className="student-header-label">
              INFORMACIÓN PERSONAL
            </span>

            <h1>Mi perfil</h1>

            <p>
              Mantén actualizada tu información personal,
              académica y profesional.
            </p>
          </div>

          <div className="student-header-account">
            <div>
              <span>Sesión iniciada como</span>
              <strong>{form.email}</strong>
            </div>

            {urlFotografia ? (
              <img
                src={urlFotografia}
                alt="Perfil"
                className="profile-header-photo"
              />
            ) : (
              <div className="student-header-avatar">
                {form.nombres
                  ? form.nombres.charAt(0).toUpperCase()
                  : "E"}
              </div>
            )}
          </div>
        </header>

        <div className="student-content">
          {idCurriculum && (
            <div className="profile-return-card">
              <div>
                <span>CURRÍCULUM EN EDICIÓN</span>
                <strong>
                  Cuando termines puedes regresar directamente
                  al currículum que estabas completando.
                </strong>
              </div>

              <Link
                to={`/estudiante/curriculums/${idCurriculum}`}
                className="profile-return-button"
              >
                ← Regresar a gestionar currículum
              </Link>
            </div>
          )}

          <section className="profile-hero">
            <div className="profile-photo-area">
              {urlFotografia ? (
                <img
                  src={urlFotografia}
                  alt="Fotografía del estudiante"
                  className="profile-photo-large"
                />
              ) : (
                <div className="profile-avatar-large">
                  {form.nombres
                    ? form.nombres.charAt(0).toUpperCase()
                    : "E"}
                </div>
              )}

              <div className="profile-photo-info">
                <span>FOTOGRAFÍA PROFESIONAL</span>
                <p>JPG, JPEG o PNG. Máximo 5 MB.</p>
              </div>
            </div>

            <div className="profile-hero-info">
              <span>PERFIL DEL ESTUDIANTE</span>

              <h2>
                {form.nombres} {form.apellidos}
              </h2>

              <p>
                {form.titulo_profesional ||
                  "Perfil profesional"}
              </p>
            </div>
          </section>

          <section className="profile-form-card">
            <div className="profile-section-heading">
              <span>DATOS DEL PERFIL</span>
              <h2>Información personal y académica</h2>
              <p>
                Estos datos se reutilizan en tus currículums.
              </p>
            </div>

            <form
              onSubmit={guardarPerfil}
              className="profile-form"
            >
              <div>
                <label>Nombres *</label>
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={cambiarCampo}
                  required
                />
              </div>

              <div>
                <label>Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={cambiarCampo}
                  required
                />
              </div>

              <div>
                <label>Correo institucional</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                />
              </div>

              <div>
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={cambiarCampo}
                  placeholder="09xxxxxxxx"
                  required
                />
              </div>

              <div>
                <label>Ciudad y provincia *</label>
                <input
                  type="text"
                  name="ciudad_pais"
                  value={form.ciudad_pais}
                  onChange={cambiarCampo}
                  placeholder="Quito, Pichincha"
                  required
                />
              </div>

              <div>
                <label>Carrera *</label>
                <select
                  name="id_carrera"
                  value={form.id_carrera}
                  onChange={cambiarCampo}
                  required
                >
                  <option value="">
                    Selecciona una carrera
                  </option>

                  {carreras.map((carrera) => (
                    <option
                      key={carrera.id_carrera}
                      value={carrera.id_carrera}
                    >
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Estado académico *</label>
                <select
                  name="estado_academico"
                  value={form.estado_academico}
                  onChange={cambiarCampo}
                  required
                >
                  <option value="">
                    Selecciona una opción
                  </option>
                  <option value="cursando">
                    Actualmente cursando
                  </option>
                  <option value="graduado">
                    Graduado
                  </option>
                </select>
              </div>

              <div>
                <label>Título o perfil profesional *</label>
                <input
                  type="text"
                  name="titulo_profesional"
                  value={form.titulo_profesional}
                  onChange={cambiarCampo}
                  required
                />
              </div>

              <div className="full">
                <label>Fotografía *</label>

                <div className="profile-photo-upload">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={seleccionarFotografia}
                    disabled={subiendoFoto}
                  />

                  <div>
                    <strong>
                      {subiendoFoto
                        ? "Subiendo fotografía..."
                        : form.fotografia_url
                          ? "Fotografía registrada"
                          : "Selecciona una fotografía"}
                    </strong>

                    <span>
                      El archivo se guarda en PoliCV.
                      No necesitas colocar una URL.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={cambiarCampo}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label>GitHub</label>
                <input
                  type="url"
                  name="github_url"
                  value={form.github_url}
                  onChange={cambiarCampo}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="full">
                <label>Sitio web o portafolio</label>
                <input
                  type="url"
                  name="sitio_web"
                  value={form.sitio_web}
                  onChange={cambiarCampo}
                  placeholder="https://miportafolio.com"
                />
              </div>

              {error && (
                <div className="profile-message error full">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="profile-message success full">
                  {mensaje}
                </div>
              )}

              <div className="profile-actions full">
                {idCurriculum && (
                  <Link
                    to={`/estudiante/curriculums/${idCurriculum}`}
                    className="profile-secondary-button"
                  >
                    Regresar al currículum
                  </Link>
                )}

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={guardando || subiendoFoto}
                >
                  {guardando
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PaginaPerfil;
