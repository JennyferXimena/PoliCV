import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/propuestas.css";

const NOMBRES_ESTADO = {
  pendiente:"Pendiente",
  en_revision:"En revisión",
  aceptada:"Aceptada",
  rechazada:"Rechazada"
};

function PaginaPropuestasAdministrador() {
  const [parametros, setParametros] = useSearchParams();
  const [propuestas, setPropuestas] = useState([]);
  const [resumen, setResumen] = useState({});
  const [buscar, setBuscar] = useState(
    parametros.get("buscar") || ""
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const filtrosActuales = parametros.toString();

  useEffect(() => {
    let cancelado = false;

    const params = Object.fromEntries(
      new URLSearchParams(filtrosActuales)
    );

    api.get("/admin/propuestas", { params })
      .then((respuesta) => {
        if (!cancelado) {
          setPropuestas(
            respuesta.data.propuestas || []
          );

          setResumen(
            respuesta.data.resumen || {}
          );
        }
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las propuestas"
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
  }, [filtrosActuales]);

  const recargarPropuestas = async () => {
    const params = Object.fromEntries(
      new URLSearchParams(filtrosActuales)
    );

    const respuesta = await api.get(
      "/admin/propuestas",
      { params }
    );

    setPropuestas(
      respuesta.data.propuestas || []
    );

    setResumen(
      respuesta.data.resumen || {}
    );
  };

  const cambiarFiltro = (estado = "") => {
    const nuevos = new URLSearchParams(parametros);

    if (estado) {
      nuevos.set("estado", estado);
    } else {
      nuevos.delete("estado");
    }

    setParametros(nuevos);
  };

  const buscarPropuestas = (e) => {
    e.preventDefault();

    const nuevos = new URLSearchParams(parametros);

    if (buscar.trim()) {
      nuevos.set(
        "buscar",
        buscar.trim()
      );
    } else {
      nuevos.delete("buscar");
    }

    setParametros(nuevos);
  };

  const limpiar = () => {
    setBuscar("");
    setParametros({});
  };

  const marcarRevision = async (propuesta) => {
    if (
      !window.confirm(
        `¿Deseas marcar "${propuesta.titulo}" como En revisión?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await api.patch(
        `/admin/propuestas/${propuesta.id_propuesta}`,
        {
          estado:"en_revision",
          respuesta_admin:null
        }
      );

      setMensaje(respuesta.data.mensaje);
      await recargarPropuestas();
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar la propuesta"
      );
    }
  };

  const finalizar = async (
    propuesta,
    estado
  ) => {
    const accion =
      estado === "aceptada"
        ? "aceptar"
        : "rechazar";

    const respuestaAdmin = window.prompt(
      `Escribe la respuesta administrativa para ${accion} la propuesta.\nEntre 10 y 500 caracteres:`
    );

    if (respuestaAdmin === null) {
      return;
    }

    const respuestaLimpia =
      respuestaAdmin.trim();

    if (
      respuestaLimpia.length < 10 ||
      respuestaLimpia.length > 500
    ) {
      setError(
        "La respuesta debe tener entre 10 y 500 caracteres"
      );
      return;
    }

    if (
      !window.confirm(
        `¿Confirmas que deseas ${accion} esta propuesta?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await api.patch(
        `/admin/propuestas/${propuesta.id_propuesta}`,
        {
          estado,
          respuesta_admin:respuestaLimpia
        }
      );

      setMensaje(
        respuesta.data.mensaje
      );

      await recargarPropuestas();
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar la propuesta"
      );
    }
  };

  const total = Number(resumen.total || 0);
  const pendientes = Number(
    resumen.pendientes || 0
  );
  const revision = Number(
    resumen.revision || 0
  );
  const aceptadas = Number(
    resumen.aceptadas || 0
  );
  const rechazadas = Number(
    resumen.rechazadas || 0
  );

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              MEJORA CONTINUA
            </span>
            <h1>Propuestas</h1>
            <p>
              Revisa y responde las sugerencias
              enviadas por los estudiantes.
            </p>
          </div>

          <div className="admin-header-badge">
            {propuestas.length} mostradas
          </div>
        </header>

        <div className="admin-content">
          <section className="propuestas-resumen">
            <button
              type="button"
              onClick={() => cambiarFiltro()}
            >
              <span>TOTAL</span>
              <strong>{total}</strong>
              <small>Propuestas recibidas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarFiltro("pendiente")
              }
            >
              <span>PENDIENTES</span>
              <strong>{pendientes}</strong>
              <small>Esperando revisión</small>
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarFiltro("en_revision")
              }
            >
              <span>EN REVISIÓN</span>
              <strong>{revision}</strong>
              <small>Actualmente revisadas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarFiltro("aceptada")
              }
            >
              <span>ACEPTADAS</span>
              <strong>{aceptadas}</strong>
              <small>Propuestas aprobadas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                cambiarFiltro("rechazada")
              }
            >
              <span>RECHAZADAS</span>
              <strong>{rechazadas}</strong>
              <small>Propuestas descartadas</small>
            </button>
          </section>

          <section className="propuestas-buscador">
            <form onSubmit={buscarPropuestas}>
              <input
                type="text"
                maxLength={100}
                value={buscar}
                onChange={(e) =>
                  setBuscar(e.target.value)
                }
                placeholder="Buscar por estudiante, correo, título o descripción..."
              />

              <button type="submit">
                Buscar
              </button>

              <button
                type="button"
                className="secundario"
                onClick={limpiar}
              >
                Limpiar
              </button>
            </form>
          </section>

          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="propuestas-mensaje">
              {mensaje}
            </div>
          )}

          <section className="propuestas-listado">
            {cargando ? (
              <div className="propuestas-vacio">
                Cargando propuestas...
              </div>
            ) : propuestas.length === 0 ? (
              <div className="propuestas-vacio">
                No existen propuestas con estos filtros.
              </div>
            ) : (
              propuestas.map((propuesta) => {
                const nombre =
                  `${propuesta.nombres || ""} ${propuesta.apellidos || ""}`.trim() ||
                  "Estudiante";

                return (
                  <article
                    className="propuesta-card"
                    key={propuesta.id_propuesta}
                  >
                    <div className="propuesta-superior">
                      <div className="propuesta-estudiante">
                        <div>
                          {nombre
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          <strong>
                            {nombre}
                          </strong>

                          <small>
                            {propuesta.email}
                          </small>
                        </span>
                      </div>

                      <span
                        className={`propuesta-estado ${propuesta.estado}`}
                      >
                        {NOMBRES_ESTADO[
                          propuesta.estado
                        ] || propuesta.estado}
                      </span>
                    </div>

                    <div className="propuesta-contenido">
                      <h2>
                        {propuesta.titulo}
                      </h2>

                      <p>
                        {propuesta.descripcion}
                      </p>
                    </div>

                    {propuesta.respuesta_admin && (
                      <div className="propuesta-respuesta">
                        <strong>
                          Respuesta administrativa
                        </strong>

                        <p>
                          {propuesta.respuesta_admin}
                        </p>
                      </div>
                    )}

                    <div className="propuesta-acciones">
                      {propuesta.estado ===
                        "pendiente" && (
                        <button
                          type="button"
                          className="revisar"
                          onClick={() =>
                            marcarRevision(
                              propuesta
                            )
                          }
                        >
                          Marcar en revisión
                        </button>
                      )}

                      {propuesta.estado ===
                        "en_revision" && (
                        <>
                          <button
                            type="button"
                            className="aceptar"
                            onClick={() =>
                              finalizar(
                                propuesta,
                                "aceptada"
                              )
                            }
                          >
                            Aceptar
                          </button>

                          <button
                            type="button"
                            className="rechazar"
                            onClick={() =>
                              finalizar(
                                propuesta,
                                "rechazada"
                              )
                            }
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {(propuesta.estado ===
                        "aceptada" ||
                        propuesta.estado ===
                          "rechazada") && (
                        <span className="propuesta-finalizada">
                          Propuesta finalizada
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PaginaPropuestasAdministrador;