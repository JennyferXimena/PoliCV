import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";
import "../../styles/estudiante/curriculums.css";

function PaginaCurriculumsEstudiante() {
  const navigate = useNavigate();

  const [curriculums, setCurriculums] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [limite, setLimite] = useState(3);
  const [idEdicion, setIdEdicion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    titulo_profesional: "",
    resumen_profesional: "",
    id_plantilla: ""
  });

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const limiteAlcanzado =
    curriculums.length >= limite && !idEdicion;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/iniciar-sesion");
  };

const cargarDatos = async () => {
  try {
    const [respuestaCurriculums, respuestaPlantillas] =
      await Promise.all([
        api.get("/curriculums"),
        api.get("/curriculums/plantillas-disponibles")
      ]);

    const listaCurriculums =
      respuestaCurriculums.data.curriculums ||
      respuestaCurriculums.data.datos ||
      [];

    const listaPlantillas =
      respuestaPlantillas.data.plantillas ||
      respuestaPlantillas.data.datos ||
      [];

    setCurriculums(listaCurriculums);
    setPlantillas(listaPlantillas);
    setLimite(
      Number(respuestaCurriculums.data.limite || 3)
    );
  } catch (error) {
    setError(
      error.response?.data?.mensaje ||
      "No se pudo cargar la información de tus currículums"
    );
  } finally {
    setCargando(false);
  }
}; 

useEffect(() => {
  let cancelado = false;

  Promise.all([
    api.get("/curriculums"),
    api.get("/curriculums/plantillas-disponibles")
  ])
    .then(([respuestaCurriculums, respuestaPlantillas]) => {
      if (cancelado) return;

      const listaCurriculums =
        respuestaCurriculums.data.curriculums ||
        respuestaCurriculums.data.datos ||
        [];

      const listaPlantillas =
        respuestaPlantillas.data.plantillas ||
        respuestaPlantillas.data.datos ||
        [];

      setCurriculums(listaCurriculums);
      setPlantillas(listaPlantillas);
      setLimite(
        Number(respuestaCurriculums.data.limite || 3)
      );
    })
    .catch((error) => {
      if (cancelado) return;

      setError(
        error.response?.data?.mensaje ||
        "No se pudo cargar la información de tus currículums"
      );
    })
    .finally(() => {
      if (!cancelado) {
        setCargando(false);
      }
    });

  return () => {
    cancelado = true;
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

  const seleccionarPlantilla = (idPlantilla) => {
    setForm((anterior) => ({
      ...anterior,
      id_plantilla: String(idPlantilla)
    }));

    setError("");
    setMensaje("");
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "",
      titulo_profesional: "",
      resumen_profesional: "",
      id_plantilla: ""
    });

    setIdEdicion(null);
    setError("");
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      setError(
        "El nombre del currículum es obligatorio"
      );
      return false;
    }

    if (!form.id_plantilla) {
      setError(
        "Selecciona una plantilla para el currículum"
      );
      return false;
    }

    if (limiteAlcanzado) {
      setError(
        `Solo puedes tener un máximo de ${limite} currículums`
      );
      return false;
    }

    return true;
  };

  const guardarCurriculum = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);

      const datos = {
        nombre: form.nombre.trim(),
        titulo_profesional:
          form.titulo_profesional.trim(),
        resumen_profesional:
          form.resumen_profesional.trim(),
        id_plantilla:
          Number(form.id_plantilla)
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
        response.data?.mensaje ||
        (idEdicion
          ? "Currículum actualizado correctamente"
          : "Currículum creado correctamente")
      );

      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar el currículum"
      );
    } finally {
      setGuardando(false);
    }
  };

  const editarCurriculum = (curriculum) => {
    setIdEdicion(
      curriculum.id_curriculum
    );

    setForm({
      nombre: curriculum.nombre || "",
      titulo_profesional:
        curriculum.titulo_profesional || "",
      resumen_profesional:
        curriculum.resumen_profesional || "",
      id_plantilla:
        String(
          curriculum.id_plantilla || ""
        )
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

      if (
        Number(idEdicion) ===
        Number(curriculum.id_curriculum)
      ) {
        limpiarFormulario();
      }

      setMensaje(
        response.data?.mensaje ||
        "Currículum eliminado correctamente"
      );

      await cargarDatos();
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo eliminar el currículum"
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleDateString(
      "es-EC",
      {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }
    );
  };

  const obtenerNombrePlantilla = (
    curriculum
  ) => {
    return (
      curriculum.nombre_plantilla ||
      curriculum.plantilla_nombre ||
      curriculum.plantilla ||
      "Sin plantilla"
    );
  };

  const obtenerCodigoPlantilla = (
    plantilla
  ) => {
    return (
      plantilla.codigo ||
      plantilla.plantilla_codigo ||
      "moderna"
    );
  };

  return (
    <div className="student-page">
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
            <strong>Estudiante</strong>
            <span>{usuario?.email}</span>
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

      <main className="student-main">
        <header className="student-header">
          <div>
            <span className="student-header-label">
              GESTIÓN DEL CURRÍCULUM
            </span>

            <h1>Mis currículums</h1>

            <p>
              Crea hasta tres versiones de tu
              currículum según el tipo de vacante
              al que quieras postular.
            </p>
          </div>

          <div className="student-header-account">
            <div>
              <span>Sesión iniciada como</span>
              <strong>{usuario?.email}</strong>
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
          <section className="curriculums-hero">
            <div>
              <span className="curriculums-etiqueta">
                CURRÍCULUM PROFESIONAL
              </span>

              <h2>
                Prepara un CV para cada objetivo
                profesional
              </h2>

              <p>
                Puedes crear distintas versiones,
                completar sus diez secciones,
                seleccionar una plantilla, generar
                el PDF y publicar una Landing Page.
              </p>
            </div>

            <div className="curriculums-limite">
              <span>CURRÍCULUMS CREADOS</span>

              <strong>
                {curriculums.length}
                <small> / {limite}</small>
              </strong>

              <div className="curriculums-progreso">
                <div
                  style={{
                    width:
                      `${Math.min(
                        (curriculums.length /
                          limite) *
                          100,
                        100
                      )}%`
                  }}
                />
              </div>

              <p>
                {curriculums.length >= limite
                  ? "Alcanzaste el límite permitido."
                  : `Puedes crear ${
                      limite -
                      curriculums.length
                    } más.`}
              </p>
            </div>
          </section>

          {error && (
            <div className="curriculums-mensaje error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="curriculums-mensaje exito">
              {mensaje}
            </div>
          )}

          <section className="curriculums-formulario-card">
            <div className="curriculums-formulario-info">
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
                Define para qué tipo de postulación
                utilizarás este CV y selecciona su
                diseño.
              </p>

              {!idEdicion &&
                curriculums.length >= limite && (
                  <div className="curriculums-aviso-limite">
                    Para crear otro currículum
                    primero debes eliminar uno de
                    los existentes.
                  </div>
                )}
            </div>

            <form
              className="curriculums-formulario"
              onSubmit={guardarCurriculum}
            >
              <div className="curriculums-campos-grid">
                <div className="curriculums-campo">
                  <label htmlFor="nombre">
                    Nombre del currículum *
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={cambiarCampo}
                    disabled={limiteAlcanzado}
                    placeholder="Ejemplo: CV Desarrollo Software"
                    maxLength="100"
                  />
                </div>

                <div className="curriculums-campo">
                  <label htmlFor="titulo_profesional">
                    Título o puesto objetivo
                  </label>

                  <input
                    id="titulo_profesional"
                    name="titulo_profesional"
                    type="text"
                    value={
                      form.titulo_profesional
                    }
                    onChange={cambiarCampo}
                    disabled={limiteAlcanzado}
                    placeholder="Ejemplo: Desarrollador Frontend Junior"
                    maxLength="150"
                  />
                </div>

                <div className="curriculums-campo completo">
                  <label htmlFor="resumen_profesional">
                    Descripción breve del
                    currículum
                  </label>

                  <textarea
                    id="resumen_profesional"
                    name="resumen_profesional"
                    value={
                      form.resumen_profesional
                    }
                    onChange={cambiarCampo}
                    disabled={limiteAlcanzado}
                    rows="4"
                    maxLength="300"
                    placeholder="Ejemplo: Currículum orientado a vacantes de desarrollo web y frontend."
                  />

                  <small>
                    Esta descripción identifica el
                    objetivo de este CV. No es la
                    descripción personal o
                    profesional de tu contenido.
                  </small>
                </div>
              </div>

              <div className="curriculums-plantillas">
                <div className="curriculums-plantillas-titulo">
                  <div>
                    <span>
                      PLANTILLA DEL CURRÍCULUM
                    </span>

                    <h4>
                      Selecciona un diseño *
                    </h4>
                  </div>

                  <p>
                    Solo se muestran las plantillas
                    habilitadas por el administrador.
                  </p>
                </div>

                {plantillas.length === 0 ? (
                  <div className="curriculums-sin-plantillas">
                    No existen plantillas disponibles
                    en este momento.
                  </div>
                ) : (
                  <div className="curriculums-plantillas-grid">
                    {plantillas.map(
                      (plantilla) => {
                        const seleccionada =
                          String(
                            form.id_plantilla
                          ) ===
                          String(
                            plantilla.id_plantilla
                          );

                        const codigo =
                          obtenerCodigoPlantilla(
                            plantilla
                          );

                        return (
                          <button
                            key={
                              plantilla.id_plantilla
                            }
                            type="button"
                            disabled={
                              limiteAlcanzado
                            }
                            className={
                              seleccionada
                                ? "curriculums-plantilla seleccionada"
                                : "curriculums-plantilla"
                            }
                            onClick={() =>
                              seleccionarPlantilla(
                                plantilla.id_plantilla
                              )
                            }
                          >
                            <div
                              className={`curriculums-miniatura ${codigo}`}
                            >
                              <div className="miniatura-columna" />
                              <div className="miniatura-contenido">
                                <span />
                                <span />
                                <span />
                              </div>
                            </div>

                            <strong>
                              {plantilla.nombre}
                            </strong>

                            <span>
                              {plantilla.descripcion ||
                                "Diseño profesional de PoliCV"}
                            </span>

                            <small>
                              {seleccionada
                                ? "Seleccionada"
                                : "Seleccionar"}
                            </small>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              <div className="curriculums-formulario-acciones">
                <button
                  type="submit"
                  className="curriculums-boton-principal"
                  disabled={
                    guardando ||
                    limiteAlcanzado ||
                    plantillas.length === 0
                  }
                >
                  {guardando
                    ? "Guardando..."
                    : idEdicion
                    ? "Guardar cambios"
                    : "Crear currículum"}
                </button>

                {idEdicion && (
                  <button
                    type="button"
                    className="curriculums-boton-secundario"
                    onClick={limpiarFormulario}
                    disabled={guardando}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="curriculums-listado">
            <div className="curriculums-listado-header">
              <div>
                <span>MIS DOCUMENTOS</span>
                <h3>Currículums creados</h3>
              </div>

              <p>
                Gestiona el contenido, personaliza
                la Landing Page o edita la
                información general de cada CV.
              </p>
            </div>

            {cargando ? (
              <div className="curriculums-vacio">
                Cargando currículums...
              </div>
            ) : curriculums.length === 0 ? (
              <div className="curriculums-vacio">
                <strong>
                  Todavía no tienes currículums
                </strong>

                <p>
                  Utiliza el formulario superior
                  para crear tu primer currículum.
                </p>
              </div>
            ) : (
              <div className="curriculums-grid">
                {curriculums.map(
                  (curriculum, indice) => (
                    <article
                      className="curriculum-card"
                      key={
                        curriculum.id_curriculum
                      }
                    >
                      <div className="curriculum-card-superior">
                        <div className="curriculum-card-icono">
                          CV
                        </div>

                        <div className="curriculum-card-numero">
                          0{indice + 1}
                        </div>
                      </div>

                      <span className="curriculum-card-plantilla">
                        {obtenerNombrePlantilla(
                          curriculum
                        )}
                      </span>

                      <h4>
                        {curriculum.nombre}
                      </h4>

                      <p className="curriculum-card-titulo">
                        {curriculum.titulo_profesional ||
                          "Sin puesto objetivo definido"}
                      </p>

                      <p className="curriculum-card-descripcion">
                        {curriculum.resumen_profesional ||
                          "Sin descripción breve registrada."}
                      </p>

                      <div className="curriculum-card-fecha">
                        <span>
                          Última actualización
                        </span>

                        <strong>
                          {formatearFecha(
                            curriculum.actualizado_en ||
                              curriculum.updated_at ||
                              curriculum.fecha_actualizacion
                          )}
                        </strong>
                      </div>

                      <div className="curriculum-card-acciones-principales">
                        <Link
                          to={`/estudiante/curriculums/${curriculum.id_curriculum}`}
                          className="curriculum-boton-gestionar"
                        >
                          Gestionar contenido
                        </Link>

                        <Link
                          to={`/estudiante/curriculums/${curriculum.id_curriculum}/landing`}
                          className="curriculum-boton-landing"
                        >
                          Mi Landing Page
                        </Link>
                      </div>

                      <div className="curriculum-card-acciones-secundarias">
                        <button
                          type="button"
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
                          className="eliminar"
                          onClick={() =>
                            eliminarCurriculum(
                              curriculum
                            )
                          }
                        >
                          Eliminar
                        </button>
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

export default PaginaCurriculumsEstudiante;
