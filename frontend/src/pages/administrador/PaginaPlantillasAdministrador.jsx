import { useEffect,useState } from "react";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/plantillas.css";

const URL_BACKEND = "http://localhost:3000";

const normalizar = (texto = "") =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase();

function obtenerUrlImagen(ruta) {
  if (!ruta) return "";
  return ruta.startsWith("/") ? `${URL_BACKEND}${ruta}` : ruta;
}

function VistaPlantilla({ plantilla,grande = false }) {
  const imagen = obtenerUrlImagen(plantilla.imagen_url);

  if (imagen) {
    return (
      <img
        src={imagen}
        alt={`Vista previa de ${plantilla.nombre}`}
        className={grande ? "plantilla-imagen-grande" : ""}
      />
    );
  }

  return (
    <div className={`plantilla-hoja ${grande ? "grande" : ""}`}>
      <div />
      <span />
      <span />
      <span />
      <small />
      <small />
    </div>
  );
}

function PaginaPlantillasAdministrador() {
  const [plantillas,setPlantillas] = useState([]);
  const [totalCurriculums,setTotalCurriculums] = useState(0);
  const [seleccionada,setSeleccionada] = useState(null);
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");
  const [mensaje,setMensaje] = useState("");

  const cargarPlantillas = async () => {
    const respuesta = await api.get("/admin/plantillas");

    setPlantillas(
      respuesta.data.plantillas || []
    );

    setTotalCurriculums(
      Number(respuesta.data.total_curriculums || 0)
    );

    return respuesta.data.plantillas || [];
  };

  useEffect(() => {
    let cancelado = false;

    api.get("/admin/plantillas")
      .then((respuesta) => {
        if (cancelado) return;

        setPlantillas(
          respuesta.data.plantillas || []
        );

        setTotalCurriculums(
          Number(respuesta.data.total_curriculums || 0)
        );
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las plantillas"
          );
        }
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

  const esClasica = (plantilla) =>
    normalizar(plantilla.nombre) === "clasica" ||
    normalizar(plantilla.codigo) === "clasica";

  const cambiarEstado = async (e,plantilla) => {
    e.stopPropagation();

    const nuevoEstado = !plantilla.estado;

    if (
      !window.confirm(
        `¿Deseas ${nuevoEstado ? "activar" : "desactivar"} la plantilla "${plantilla.nombre}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await api.patch(
        `/admin/plantillas/${plantilla.id_plantilla}/estado`,
        {
          estado:nuevoEstado
        }
      );

      setMensaje(respuesta.data.mensaje);

      const actualizadas = await cargarPlantillas();

      if (
        seleccionada?.id_plantilla ===
        plantilla.id_plantilla
      ) {
        const actualizada = actualizadas.find(
          (item) =>
            item.id_plantilla ===
            plantilla.id_plantilla
        );

        setSeleccionada(actualizada || null);
      }
    } catch(error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar la plantilla"
      );
    }
  };

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              DISEÑO DEL CURRÍCULUM
            </span>

            <h1>Plantillas</h1>

            <p>
              Consulta los diseños disponibles y analiza cuáles son utilizados por los estudiantes.
            </p>
          </div>

          <div className="admin-header-badge">
            {plantillas.length}/3 plantillas
          </div>
        </header>

        <div className="admin-content">
          <section className="plantillas-intro">
            <div>
              <span>DISEÑOS PREDETERMINADOS</span>

              <h2>Plantillas de TalentoESFOT</h2>

              <p>
                Selecciona una tarjeta para ampliar su vista previa y consultar información detallada.
              </p>
            </div>

            <strong>
              {totalCurriculums} CV
            </strong>
          </section>

          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="plantillas-mensaje">
              {mensaje}
            </div>
          )}

          {cargando ? (
            <div className="admin-state-card">
              Cargando plantillas...
            </div>
          ) : (
            <>
              <section className="plantillas-grid">
                {plantillas.map((plantilla,indice) => {
                  const base = esClasica(plantilla);
                  const estadisticas =
                    plantilla.estadisticas || {};

                  return (
                    <article
                      key={plantilla.id_plantilla}
                      className={`plantilla-card plantilla-${indice + 1}`}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setSeleccionada(plantilla)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
                          e.preventDefault();
                          setSeleccionada(plantilla);
                        }
                      }}
                    >
                      <div className="plantilla-preview">
                        <VistaPlantilla
                          plantilla={plantilla}
                        />

                        {base && (
                          <div className="plantilla-base">
                            BASE
                          </div>
                        )}
                      </div>

                      <div className="plantilla-contenido">
                        <span>
                          {plantilla.codigo ||
                            `PLANTILLA ${indice + 1}`}
                        </span>

                        <h2>
                          {plantilla.nombre}
                        </h2>

                        <p>
                          {plantilla.descripcion ||
                            "Diseño disponible para la presentación profesional del currículum."}
                        </p>

                        <div className="plantilla-estadisticas">
                          <div>
                            <span>CV</span>

                            <strong>
                              {estadisticas.curriculums || 0}
                            </strong>
                          </div>

                          <div>
                            <span>Estudiantes</span>

                            <strong>
                              {estadisticas.estudiantes || 0}
                            </strong>
                          </div>

                          <div>
                            <span>Uso</span>

                            <strong>
                              {estadisticas.porcentaje || 0}%
                            </strong>
                          </div>
                        </div>

                        <div className="plantilla-pie">
                          <span
                            className={`plantilla-estado ${
                              plantilla.estado
                                ? "activa"
                                : "inactiva"
                            }`}
                          >
                            {plantilla.estado
                              ? "Activa"
                              : "Inactiva"}
                          </span>

                          <button
                            type="button"
                            disabled={
                              base &&
                              Boolean(plantilla.estado)
                            }
                            onClick={(e) =>
                              cambiarEstado(
                                e,
                                plantilla
                              )
                            }
                          >
                            {base && plantilla.estado
                              ? "Plantilla base"
                              : plantilla.estado
                                ? "Desactivar"
                                : "Activar"}
                          </button>
                        </div>

                        <small className="plantilla-ver">
                          Presiona la tarjeta para ver detalles
                        </small>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="plantillas-uso-carreras">
                <div className="plantillas-uso-titulo">
                  <span>USO POR CARRERA</span>

                  <h2>
                    Preferencia de plantillas por carrera
                  </h2>

                  <p>
                    Muestra cuántos currículums de cada carrera utilizan cada diseño.
                  </p>
                </div>

                <div className="plantillas-uso-grid">
                  {plantillas.map((plantilla) => {
                    const estadisticas =
                      plantilla.estadisticas || {};

                    const totalPlantilla =
                      Number(
                        estadisticas.curriculums || 0
                      );

                    return (
                      <article
                        key={plantilla.id_plantilla}
                      >
                        <h3>
                          {plantilla.nombre}
                        </h3>

                        {estadisticas.por_carrera?.length ? (
                          estadisticas.por_carrera.map(
                            (item) => {
                              const cantidad =
                                Number(
                                  item.curriculums || 0
                                );

                              const porcentaje =
                                totalPlantilla
                                  ? Math.round(
                                      (cantidad /
                                        totalPlantilla) *
                                        100
                                    )
                                  : 0;

                              return (
                                <div
                                  className="plantilla-carrera-barra"
                                  key={item.id_carrera}
                                >
                                  <div>
                                    <span>
                                      {item.carrera}
                                    </span>

                                    <strong>
                                      {cantidad} CV ·{" "}
                                      {porcentaje}%
                                    </strong>
                                  </div>

                                  <div className="plantilla-carrera-fondo">
                                    <div
                                      style={{
                                        width:`${porcentaje}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )
                        ) : (
                          <p className="plantilla-sin-uso">
                            Esta plantilla todavía no registra currículums.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {seleccionada && (
        <div
          className="plantilla-modal-fondo"
          onClick={() =>
            setSeleccionada(null)
          }
        >
          <section
            className="plantilla-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="plantilla-modal-cerrar"
              onClick={() =>
                setSeleccionada(null)
              }
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="plantilla-modal-preview">
              <VistaPlantilla
                plantilla={seleccionada}
                grande
              />
            </div>

            <div className="plantilla-modal-info">
              <span>PLANTILLA</span>

              <h2>
                {seleccionada.nombre}
              </h2>

              <p>
                {seleccionada.descripcion ||
                  "Diseño disponible para los currículums de TalentoESFOT."}
              </p>

              <div className="plantilla-modal-resumen">
                <div>
                  <span>
                    CV que la utilizan
                  </span>

                  <strong>
                    {seleccionada.estadisticas
                      ?.curriculums || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Estudiantes distintos
                  </span>

                  <strong>
                    {seleccionada.estadisticas
                      ?.estudiantes || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Uso total
                  </span>

                  <strong>
                    {seleccionada.estadisticas
                      ?.porcentaje || 0}%
                  </strong>
                </div>
              </div>

              <h3>
                Uso por carrera
              </h3>

              {seleccionada.estadisticas
                ?.por_carrera?.length ? (
                <div className="plantilla-carreras">
                  {seleccionada.estadisticas
                    .por_carrera.map((item) => (
                      <div
                        key={item.id_carrera}
                      >
                        <span>
                          {item.carrera}
                        </span>

                        <strong>
                          {item.curriculums} CV ·{" "}
                          {item.estudiantes} estudiantes
                        </strong>
                      </div>
                    ))}
                </div>
              ) : (
                <p>
                  Esta plantilla todavía no registra uso por carrera.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PaginaPlantillasAdministrador;