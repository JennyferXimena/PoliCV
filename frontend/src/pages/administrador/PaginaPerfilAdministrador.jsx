import { useEffect,useState } from "react";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/perfilAdministrador.css";

const URL_BACKEND = "http://localhost:3000";

const formularioVacio = {
  nombres:"",
  apellidos:"",
  email:"",
  telefono:"",
  direccion:"",
  fotografia_url:"",
  linkedin_url:"",
  github_url:"",
  sitio_web:""
};

function obtenerUrlFoto(ruta) {
  if (!ruta) return "";
  return ruta.startsWith("/") ? `${URL_BACKEND}${ruta}` : ruta;
}

function actualizarUsuarioGuardado(perfil) {
  const almacenamiento = localStorage.getItem("usuario")
    ? localStorage
    : sessionStorage.getItem("usuario")
      ? sessionStorage
      : null;

  if (!almacenamiento) return;

  try {
    const usuario = JSON.parse(almacenamiento.getItem("usuario"));

    almacenamiento.setItem(
      "usuario",
      JSON.stringify({
        ...usuario,
        nombres:perfil.nombres,
        apellidos:perfil.apellidos,
        fotografia_url:perfil.fotografia_url
      })
    );
  } catch {
    return;
  }
}

function PaginaPerfilAdministrador() {
  const [form,setForm] = useState(formularioVacio);
  const [cargando,setCargando] = useState(true);
  const [guardando,setGuardando] = useState(false);
  const [subiendoFoto,setSubiendoFoto] = useState(false);
  const [fotoError,setFotoError] = useState(false);
  const [error,setError] = useState("");
  const [mensaje,setMensaje] = useState("");

  useEffect(() => {
    let cancelado = false;

    api.get("/admin/perfil")
      .then((respuesta) => {
        if (cancelado) return;

        const perfil = respuesta.data.perfil || {};

        setForm({
          nombres:perfil.nombres || "",
          apellidos:perfil.apellidos || "",
          email:perfil.email || "",
          telefono:perfil.telefono || "",
          direccion:perfil.direccion || "",
          fotografia_url:perfil.fotografia_url || "",
          linkedin_url:perfil.linkedin_url || "",
          github_url:perfil.github_url || "",
          sitio_web:perfil.sitio_web || ""
        });

        actualizarUsuarioGuardado(perfil);
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudo cargar el perfil"
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const cambiar = (e) => {
    const { name,value } = e.target;

    setForm((actual) => ({
      ...actual,
      [name]:value
    }));

    setError("");
    setMensaje("");
  };

  const seleccionarFotografia = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    const formatosPermitidos = [
      "image/jpeg",
      "image/png"
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      setError("Solo se permiten fotografías JPG, JPEG o PNG");
      e.target.value = "";
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError("La fotografía no puede superar 5 MB");
      e.target.value = "";
      return;
    }

    try {
      setSubiendoFoto(true);
      setError("");
      setMensaje("");

      const datos = new FormData();
      datos.append("fotografia",archivo);

      const respuesta = await api.post(
        "/admin/perfil/fotografia",
        datos,
        {
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );

      const fotografiaUrl = respuesta.data.fotografia_url;

      setForm((actual) => ({
        ...actual,
        fotografia_url:fotografiaUrl
      }));

      setFotoError(false);

      actualizarUsuarioGuardado({
        ...form,
        fotografia_url:fotografiaUrl
      });

      setMensaje(
        respuesta.data.mensaje ||
        "Fotografía actualizada correctamente"
      );
    } catch(error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo subir la fotografía"
      );
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  };

  const guardar = async (e) => {
    e.preventDefault();

    const nombres = form.nombres.trim();
    const apellidos = form.apellidos.trim();

    if (!nombres || !apellidos) {
      setError("Nombres y apellidos son obligatorios");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const respuesta = await api.put(
        "/admin/perfil",
        {
          nombres,
          apellidos,
          telefono:form.telefono.trim(),
          direccion:form.direccion.trim(),
          fotografia_url:form.fotografia_url,
          linkedin_url:form.linkedin_url.trim(),
          github_url:form.github_url.trim(),
          sitio_web:form.sitio_web.trim()
        }
      );

      const perfil = respuesta.data.perfil;

      setForm({
        nombres:perfil.nombres || "",
        apellidos:perfil.apellidos || "",
        email:perfil.email || "",
        telefono:perfil.telefono || "",
        direccion:perfil.direccion || "",
        fotografia_url:perfil.fotografia_url || "",
        linkedin_url:perfil.linkedin_url || "",
        github_url:perfil.github_url || "",
        sitio_web:perfil.sitio_web || ""
      });

      actualizarUsuarioGuardado(perfil);

      setMensaje(
        respuesta.data.mensaje ||
        "Perfil actualizado correctamente"
      );
    } catch(error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el perfil"
      );
    } finally {
      setGuardando(false);
    }
  };

  const inicial =
    form.nombres?.charAt(0)?.toUpperCase() ||
    form.email?.charAt(0)?.toUpperCase() ||
    "A";

  const urlFoto = obtenerUrlFoto(form.fotografia_url);

  if (cargando) {
    return (
      <div className="admin-layout">
        <MenuLateral />

        <main className="admin-main">
          <div className="admin-content">
            <div className="admin-state-card">
              Cargando perfil...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              INFORMACIÓN PERSONAL
            </span>

            <h1>Mi perfil</h1>

            <p>
              Mantén actualizados tus datos principales como administrador de TalentoESFOT.
            </p>
          </div>

          <div className="admin-header-badge">
            Administrador
          </div>
        </header>

        <div className="admin-content">
          <section className="perfil-admin-resumen">
            <div className="perfil-admin-foto">
              {urlFoto && !fotoError ? (
                <img
                  src={urlFoto}
                  alt="Fotografía del administrador"
                  onError={() => setFotoError(true)}
                />
              ) : (
                <span>{inicial}</span>
              )}
            </div>

            <div>
              <span>PERFIL ADMINISTRATIVO</span>

              <h2>
                {form.nombres || "Administrador"}{" "}
                {form.apellidos}
              </h2>

              <p>{form.email}</p>
            </div>
          </section>

          <section className="perfil-admin-card">
            <div className="perfil-admin-titulo">
              <span>DATOS PERSONALES</span>
              <h2>Información principal</h2>

              <p>
                El correo institucional no puede modificarse desde esta pantalla.
              </p>
            </div>

            <form
              className="perfil-admin-form"
              onSubmit={guardar}
            >
              <div>
                <label>Nombres *</label>

                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={cambiar}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label>Apellidos *</label>

                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={cambiar}
                  maxLength={100}
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
                <label>Teléfono</label>

                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={cambiar}
                  maxLength={10}
                  placeholder="09XXXXXXXX"
                />
              </div>

              <div className="full">
                <label>Ciudad o ubicación</label>

                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={cambiar}
                  maxLength={150}
                  placeholder="Quito, Ecuador"
                />
              </div>

              <div className="full">
                <label>Fotografía</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={seleccionarFotografia}
                  disabled={subiendoFoto}
                />

                <small>
                  JPG, JPEG o PNG. Máximo 5 MB.
                  {subiendoFoto && " Subiendo fotografía..."}
                </small>
              </div>

              <div>
                <label>LinkedIn</label>

                <input
                  type="url"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={cambiar}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label>GitHub</label>

                <input
                  type="url"
                  name="github_url"
                  value={form.github_url}
                  onChange={cambiar}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="full">
                <label>Sitio web o portafolio</label>

                <input
                  type="url"
                  name="sitio_web"
                  value={form.sitio_web}
                  onChange={cambiar}
                  placeholder="https://..."
                />
              </div>

              {error && (
                <div className="admin-message error full">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="perfil-admin-exito full">
                  {mensaje}
                </div>
              )}

              <div className="full perfil-admin-acciones">
                <button
                  type="submit"
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

export default PaginaPerfilAdministrador; 