import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";


function StudentProposalsPage() {
  const navigate = useNavigate();

  const [propuestas, setPropuestas] =
    useState([]);

  const [form, setForm] =
    useState({
      titulo: "",
      descripcion: ""
    });

  const [cargando, setCargando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario =
    usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;


  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };


  const obtenerLista = (response) => {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      Array.isArray(
        response.data.propuestas
      )
    ) {
      return response.data.propuestas;
    }

    if (
      Array.isArray(
        response.data.datos
      )
    ) {
      return response.data.datos;
    }

    return [];
  };


  const cargarPropuestas = async () => {
    try {
      const response =
        await api.get(
          "/propuestas"
        );

      setPropuestas(
        obtenerLista(response)
      );

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar tus propuestas"
      );
    }
  };


  useEffect(() => {
    let activo = true;

    const cargarInicial = async () => {
      try {
        const response =
          await api.get(
            "/propuestas"
          );

        if (!activo) {
          return;
        }

        setPropuestas(
          obtenerLista(response)
        );

      } catch (error) {
        if (!activo) {
          return;
        }

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar tus propuestas"
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

    setForm((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };


  const enviarPropuesta = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (
      !form.titulo.trim() ||
      !form.descripcion.trim()
    ) {
      setError(
        "Completa el título y la descripción"
      );

      return;
    }

    setEnviando(true);

    try {
      const response =
        await api.post(
          "/propuestas",
          {
            titulo:
              form.titulo.trim(),

            descripcion:
              form.descripcion.trim()
          }
        );

      setMensaje(
        response.data.mensaje ||
        "Propuesta enviada correctamente"
      );

      setForm({
        titulo: "",
        descripcion: ""
      });

      await cargarPropuestas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo enviar la propuesta"
      );

    } finally {
      setEnviando(false);
    }
  };


  const obtenerEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";

      case "en_revision":
        return "En revisión";

      case "aceptada":
        return "Aceptada";

      case "rechazada":
        return "Rechazada";

      default:
        return estado || "Pendiente";
    }
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

          <Link to="/estudiante/curriculums">
            <span>03</span>
            Mis currículums
          </Link>

          <Link to="/estudiante/asistente-ia">
            <span>04</span>
            Asistente IA
          </Link>

          <Link
            to="/estudiante/propuestas"
            className="active"
          >
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
              PARTICIPACIÓN DEL ESTUDIANTE
            </span>

            <h1>
              Propuestas de mejora
            </h1>

            <p>
              Envía sugerencias para contribuir
              al mejoramiento de PoliCV.
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

          <section className="proposal-page-heading">

            <div>

              <span>
                MEJORA CONTINUA
              </span>

              <h2>
                Comparte tus ideas
              </h2>

              <p>
                Si encuentras una función que podría
                mejorarse o tienes una nueva idea,
                puedes enviarla desde este espacio.
              </p>

            </div>


            <div className="proposal-count">

              <span>
                Propuestas enviadas
              </span>

              <strong>
                {propuestas.length}
              </strong>

            </div>

          </section>


          {/* FORMULARIO */}

          <section className="proposal-form-card">

            <div className="proposal-form-info">

              <span>
                NUEVA PROPUESTA
              </span>

              <h3>
                Enviar una sugerencia
              </h3>

              <p>
                Describe de forma clara qué aspecto
                de la plataforma consideras que
                podría mejorarse.
              </p>

            </div>


            <form
              className="proposal-form"
              onSubmit={enviarPropuesta}
            >

              <div className="proposal-field">

                <label htmlFor="titulo">
                  Título
                </label>

                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ejemplo: Mejorar filtros de ofertas"
                  required
                />

              </div>


              <div className="proposal-field">

                <label htmlFor="descripcion">
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Explica tu propuesta de mejora..."
                  rows="5"
                  required
                />

              </div>


              {error && (
                <div className="proposal-message error">
                  {error}
                </div>
              )}


              {mensaje && (
                <div className="proposal-message success">
                  {mensaje}
                </div>
              )}


              <div className="proposal-form-actions">

                <button
                  type="submit"
                  disabled={enviando}
                >
                  {enviando
                    ? "Enviando..."
                    : "Enviar propuesta"}
                </button>

              </div>

            </form>

          </section>


          {/* PROPUESTAS */}

          <section className="student-proposals-card">

            <div className="student-proposals-header">

              <div>

                <span>
                  HISTORIAL
                </span>

                <h3>
                  Mis propuestas
                </h3>

              </div>

              <p>
                Consulta el estado y la respuesta
                de cada propuesta enviada.
              </p>

            </div>


            {cargando ? (

              <div className="student-proposals-empty">
                Cargando propuestas...
              </div>

            ) : propuestas.length === 0 ? (

              <div className="student-proposals-empty">

                <strong>
                  No tienes propuestas enviadas
                </strong>

                <p>
                  Cuando envíes una sugerencia
                  aparecerá en este espacio.
                </p>

              </div>

            ) : (

              <div className="student-proposals-list">

                {propuestas.map(
                  (propuesta) => (

                    <article
                      key={
                        propuesta.id_propuesta
                      }
                      className="student-proposal-item"
                    >

                      <div className="student-proposal-main">

                        <span className="student-proposal-label">
                          PROPUESTA
                        </span>

                        <h4>
                          {propuesta.titulo}
                        </h4>

                        <p>
                          {propuesta.descripcion}
                        </p>

                      </div>


                      <div className="student-proposal-status-area">

                        <span
                          className={
                            `student-proposal-status ${
                              propuesta.estado ||
                              "pendiente"
                            }`
                          }
                        >
                          {obtenerEstado(
                            propuesta.estado
                          )}
                        </span>

                      </div>


                      <div className="student-proposal-response">

                        <span>
                          Respuesta
                        </span>

                        <p>
                          {propuesta.respuesta_admin ||
                            "Todavía no existe una respuesta."}
                        </p>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default StudentProposalsPage;