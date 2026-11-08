import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";


function ProfilePage() {
  const navigate = useNavigate();

  const [
    carreras,
    setCarreras
  ] = useState([]);

  const [
    form,
    setForm
  ] = useState({
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
    github_url: ""
  });

  const [
    cargando,
    setCargando
  ] = useState(true);

  const [
    guardando,
    setGuardando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    mensaje,
    setMensaje
  ] = useState("");


  /* =========================================================
     USUARIO GUARDADO
  ========================================================= */

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario =
    usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;


  /* =========================================================
     CARGAR PERFIL Y CARRERAS
  ========================================================= */

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [
          responsePerfil,
          responseCarreras
        ] = await Promise.all([
          api.get(
            "/configuracion-inicial"
          ),

          api.get(
            "/configuracion-inicial/carreras"
          )
        ]);

        if (!activo) {
          return;
        }

        const perfil =
          responsePerfil.data?.perfil;

        setCarreras(
          responseCarreras.data?.carreras ||
          []
        );

        setForm({
          nombres:
            perfil?.nombres || "",

          apellidos:
            perfil?.apellidos || "",

          email:
            perfil?.email || "",

          telefono:
            perfil?.telefono || "",

          ciudad_pais:
            perfil?.ciudad_pais || "",

          id_carrera:
            perfil?.id_carrera || "",

          estado_academico:
            perfil?.estado_academico || "",

          titulo_profesional:
            perfil?.titulo_profesional || "",

          fotografia_url:
            perfil?.fotografia_url || "",

          linkedin_url:
            perfil?.linkedin_url || "",

          github_url:
            perfil?.github_url || ""
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

    cargarDatos();

    return () => {
      activo = false;
    };

  }, []);


  /* =========================================================
     CAMBIAR CAMPOS
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm(
      (anterior) => ({
        ...anterior,
        [name]: value
      })
    );

    setError("");
    setMensaje("");
  };


  /* =========================================================
     GUARDAR CAMBIOS
  ========================================================= */

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
      setError(
        "Completa todos los campos obligatorios"
      );

      return;
    }

    setGuardando(true);

    try {
      const response =
        await api.put(
          "/configuracion-inicial",
          {
            nombres:
              form.nombres,

            apellidos:
              form.apellidos,

            telefono:
              form.telefono,

            ciudad_pais:
              form.ciudad_pais,

            id_carrera:
              Number(
                form.id_carrera
              ),

            estado_academico:
              form.estado_academico,

            titulo_profesional:
              form.titulo_profesional,

            fotografia_url:
              form.fotografia_url,

            linkedin_url:
              form.linkedin_url,

            github_url:
              form.github_url
          }
        );

      setMensaje(
        response.data?.mensaje ||
        "Perfil actualizado correctamente"
      );


      /* =====================================================
         ACTUALIZAR USUARIO GUARDADO
      ===================================================== */

      const perfilActualizado =
        response.data?.perfil;

      if (usuarioGuardado) {
        const usuarioActualizado = {
          ...usuario,

          id_carrera:
            perfilActualizado?.id_carrera,

          carrera:
            perfilActualizado?.carrera,

          estado_academico:
            perfilActualizado?.estado_academico,

          perfil_completado:
            true
        };


        if (
          localStorage.getItem(
            "usuario"
          )
        ) {
          localStorage.setItem(
            "usuario",
            JSON.stringify(
              usuarioActualizado
            )
          );

        } else {
          sessionStorage.setItem(
            "usuario",
            JSON.stringify(
              usuarioActualizado
            )
          );
        }
      }

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron guardar los cambios"
      );

    } finally {
      setGuardando(false);
    }
  };


  /* =========================================================
     CERRAR SESIÓN
  ========================================================= */

  const cerrarSesion = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "usuario"
    );

    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "usuario"
    );

    navigate(
      "/iniciar-sesion"
    );
  };


  /* =========================================================
     CARGANDO
  ========================================================= */

  if (cargando) {
    return (
      <main
        style={{
          padding: "40px"
        }}
      >
        Cargando perfil...
      </main>
    );
  }


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <div className="student-page">

      {/* SIDEBAR */}

      <aside className="student-sidebar">

        <div className="student-brand">

          <div className="student-brand-logo">
            P
          </div>

          <div>
            <h2>
              PoliCV
            </h2>

            <span>
              Estudiante
            </span>
          </div>

        </div>


        <div className="student-profile-mini">

          <div className="student-avatar">

            {form.nombres
              ? form.nombres
                  .charAt(0)
                  .toUpperCase()
              : "E"}

          </div>


          <div>

            <strong>
              {form.nombres ||
                "Estudiante"}
            </strong>

            <span>
              {form.email}
            </span>

          </div>

        </div>


        <nav className="student-menu">

          <a href="/estudiante">
            <span>01</span>
            Inicio
          </a>

          <a
            href="/perfil"
            className="active"
          >
            <span>02</span>
            Mi perfil
          </a>

          <a href="/estudiante/curriculums">
            <span>03</span>
            Mis currículums
          </a>

          <a href="/estudiante/asistente-ia">
            <span>04</span>
            Asistente IA
          </a>

          <a href="/estudiante/propuestas">
            <span>05</span>
            Propuestas de mejora
          </a>

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
              Mantén actualizada tu información
              personal, académica y profesional.
            </p>

          </div>


          <div className="student-header-account">

            <div>

              <span>
                Sesión iniciada como
              </span>

              <strong>
                {form.email}
              </strong>

            </div>


            <div className="student-header-avatar">

              {form.nombres
                ? form.nombres
                    .charAt(0)
                    .toUpperCase()
                : "E"}

            </div>

          </div>

        </header>


        <div className="student-content">


          {/* RESUMEN */}

          <section className="profile-hero">

            <div className="profile-avatar-large">

              {form.nombres
                ? form.nombres
                    .charAt(0)
                    .toUpperCase()
                : "E"}

            </div>


            <div>

              <span>
                PERFIL DEL ESTUDIANTE
              </span>

              <h2>
                {form.nombres}
                {" "}
                {form.apellidos}
              </h2>

              <p>
                {form.titulo_profesional ||
                  "Perfil profesional"}
              </p>

            </div>

          </section>


          {/* FORMULARIO */}

          <section className="profile-form-card">

            <div className="profile-section-heading">

              <span>
                DATOS DEL PERFIL
              </span>

              <h2>
                Información personal y académica
              </h2>

              <p>
                Modifica únicamente la información
                que necesites actualizar.
              </p>

            </div>


            <form
              onSubmit={
                guardarPerfil
              }
              className="profile-form"
            >

              {/* NOMBRES */}

              <div>

                <label>
                  Nombres *
                </label>

                <input
                  type="text"
                  name="nombres"
                  value={
                    form.nombres
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* APELLIDOS */}

              <div>

                <label>
                  Apellidos *
                </label>

                <input
                  type="text"
                  name="apellidos"
                  value={
                    form.apellidos
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* CORREO */}

              <div>

                <label>
                  Correo institucional
                </label>

                <input
                  type="email"
                  value={
                    form.email
                  }
                  disabled
                />

              </div>


              {/* TELÉFONO */}

              <div>

                <label>
                  Teléfono *
                </label>

                <input
                  type="text"
                  name="telefono"
                  value={
                    form.telefono
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* CIUDAD */}

              <div className="full">

                <label>
                  Ciudad y país *
                </label>

                <input
                  type="text"
                  name="ciudad_pais"
                  value={
                    form.ciudad_pais
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Quito, Ecuador"
                  required
                />

              </div>


              {/* CARRERA */}

              <div className="full">

                <label>
                  Carrera *
                </label>

                <select
                  name="id_carrera"
                  value={
                    form.id_carrera
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Selecciona una carrera
                  </option>


                  {carreras.map(
                    (carrera) => (

                      <option
                        key={
                          carrera.id_carrera
                        }
                        value={
                          carrera.id_carrera
                        }
                      >
                        {carrera.nombre}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* ESTADO ACADÉMICO */}

              <div>

                <label>
                  Estado académico *
                </label>

                <select
                  name="estado_academico"
                  value={
                    form.estado_academico
                  }
                  onChange={
                    handleChange
                  }
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


              {/* TITULO PROFESIONAL */}

              <div>

                <label>
                  Título o perfil profesional *
                </label>

                <input
                  type="text"
                  name="titulo_profesional"
                  value={
                    form.titulo_profesional
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* FOTO */}

              <div className="full">

                <label>
                  URL de fotografía
                </label>

                <input
                  type="url"
                  name="fotografia_url"
                  value={
                    form.fotografia_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Opcional"
                />

              </div>


              {/* LINKEDIN */}

              <div>

                <label>
                  LinkedIn
                </label>

                <input
                  type="url"
                  name="linkedin_url"
                  value={
                    form.linkedin_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://linkedin.com/in/..."
                />

              </div>


              {/* GITHUB */}

              <div>

                <label>
                  GitHub
                </label>

                <input
                  type="url"
                  name="github_url"
                  value={
                    form.github_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://github.com/..."
                />

              </div>


              {/* MENSAJES */}

              {error && (

                <p className="message error full">
                  {error}
                </p>

              )}


              {mensaje && (

                <p className="message success full">
                  {mensaje}
                </p>

              )}


              {/* BOTÓN */}

              <div className="full">

                <button
                  type="submit"
                  disabled={
                    guardando
                  }
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


export default ProfilePage;