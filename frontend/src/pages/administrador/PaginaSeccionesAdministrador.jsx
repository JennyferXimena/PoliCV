import { useEffect, useState } from "react";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/secciones.css";

const REGLAS = {
  1:{
    tipo:"Obligatoria",
    limite:"Datos principales requeridos"
  },
  12:{
    tipo:"Obligatoria",
    limite:"Descripción de 30 a 120 palabras"
  },
  3:{
    tipo:"Obligatoria",
    limite:"Máximo 3 estudios adicionales"
  },
  9:{
    tipo:"Obligatoria",
    limite:"Inglés + máximo 2 idiomas adicionales"
  },
  8:{
    tipo:"Obligatoria",
    limite:"5 técnicas + 5 blandas"
  },
  7:{
    tipo:"Opcional",
    limite:"Máximo 5 cursos o certificaciones"
  },
  6:{
    tipo:"Obligatoria",
    limite:"Mínimo 1 y máximo 3 proyectos"
  },
  5:{
    tipo:"Opcional",
    limite:"Máximo 4 prácticas"
  },
  4:{
    tipo:"Opcional",
    limite:"Máximo 3 experiencias"
  },
  10:{
    tipo:"Opcional",
    limite:"Máximo 5 referencias"
  }
};

function descripcionRegla(campo) {
  if (
    campo.tipo_campo === "texto_largo" &&
    campo.minimo !== null &&
    campo.maximo !== null
  ) {
    return `${campo.minimo} a ${campo.maximo} palabras`;
  }

  if (
    campo.nombre === "Horas" &&
    campo.minimo !== null &&
    campo.maximo !== null
  ) {
    return `${campo.minimo} a ${campo.maximo} horas`;
  }

  if (
    campo.maximo !== null &&
    campo.minimo === null
  ) {
    return `Máximo ${campo.maximo}`;
  }

  return null;
}

function PaginaSeccionesAdministrador() {
  const [secciones,setSecciones] = useState([]);
  const [abiertas,setAbiertas] = useState([]);
  const [estadisticas,setEstadisticas] = useState(null);
  const [carrera,setCarrera] = useState("");
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");

  const cargarEstadisticas = async (idCarrera = "") => {
    try {
      const respuesta = await api.get(
        "/admin/secciones/estadisticas",
        {
          params:idCarrera
            ? { carrera:idCarrera }
            : {}
        }
      );

      setEstadisticas(respuesta.data);
    } catch(error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las estadísticas"
      );
    }
  };

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      api.get("/admin/secciones"),
      api.get("/admin/secciones/estadisticas")
    ])
      .then(([respuestaSecciones,respuestaEstadisticas]) => {
        if (cancelado) return;

        setSecciones(
          respuestaSecciones.data.secciones || []
        );

        setEstadisticas(
          respuestaEstadisticas.data || null
        );
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudo cargar la información de las secciones"
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

  const alternar = (id) => {
    setAbiertas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales,id]
    );
  };

  const contarCampos = (seccion) =>
    (seccion.campos?.length || 0) +
    (seccion.subsecciones || []).reduce(
      (total,item) =>
        total + (item.campos?.length || 0),
      0
    );

  const cambiarCarrera = async (e) => {
    const valor = e.target.value;

    setCarrera(valor);
    await cargarEstadisticas(valor);
  };

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              ESTRUCTURA DEL CURRÍCULUM
            </span>

            <h1>Secciones del CV</h1>

            <p>
              Consulta la estructura, reglas y uso real de cada sección.
            </p>
          </div>

          <div className="admin-header-badge">
            {secciones.length} secciones
          </div>
        </header>

        <div className="admin-content">
          <section className="secciones-intro">
            <div>
              <span>ESTRUCTURA PREDETERMINADA</span>

              <h2>Configuración del currículum</h2>

              <p>
                Las diez secciones mantienen un orden fijo. Las etiquetas indican si la sección completa es obligatoria u opcional y qué campos deben completarse cuando el estudiante agrega un registro.
              </p>
            </div>

            <strong>{secciones.length}</strong>
          </section>

          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {cargando ? (
            <div className="admin-state-card">
              Cargando secciones...
            </div>
          ) : (
            <section className="secciones-acordeon">
              {secciones.map((seccion,indice) => {
                const abierta =
                  abiertas.includes(seccion.id_seccion);

                const regla =
                  REGLAS[Number(seccion.id_seccion)] || {};

                return (
                  <article
                    className="seccion-item"
                    key={seccion.id_seccion}
                  >
                    <button
                      type="button"
                      className="seccion-item-cabecera"
                      onClick={() =>
                        alternar(seccion.id_seccion)
                      }
                    >
                      <div className="seccion-numero">
                        {String(indice + 1).padStart(2,"0")}
                      </div>

                      <div className="seccion-resumen">
                        <div>
                          <h2>{seccion.nombre}</h2>

                          <p>{seccion.descripcion}</p>
                        </div>

                        <div className="seccion-etiquetas">
                          <span
                            className={`seccion-tipo ${
                              regla.tipo === "Obligatoria"
                                ? "obligatoria"
                                : "opcional"
                            }`}
                          >
                            Sección {regla.tipo?.toLowerCase()}
                          </span>

                          <span>
                            {regla.limite}
                          </span>

                          <span>
                            {contarCampos(seccion)} campos
                          </span>
                        </div>
                      </div>

                      <div className="seccion-flecha">
                        {abierta ? "−" : "+"}
                      </div>
                    </button>

                    {abierta && (
                      <div className="seccion-item-contenido">
                        {seccion.campos?.length > 0 && (
                          <div className="seccion-grupo">
                            <h3>Campos principales</h3>

                            <div className="seccion-campos">
                              {seccion.campos.map((campo) => (
                                <div
                                  className="seccion-campo"
                                  key={campo.id_campo}
                                >
                                  <strong>{campo.nombre}</strong>

                                  <p>
                                    {campo.descripcion ||
                                      "Campo definido para esta sección."}
                                  </p>

                                  <div>
                                    <span>
                                      {campo.obligatorio
                                        ? regla.tipo === "Opcional"
                                          ? "Requerido al agregar"
                                          : "Obligatorio"
                                        : "Opcional"}
                                    </span>

                                    {descripcionRegla(campo) && (
                                      <span>
                                        {descripcionRegla(campo)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {seccion.subsecciones?.map(
                          (subseccion) => (
                            <div
                              className="seccion-grupo"
                              key={subseccion.id_subseccion}
                            >
                              <h3>{subseccion.nombre}</h3>

                              <p className="seccion-subdescripcion">
                                {subseccion.descripcion}
                              </p>

                              <div className="seccion-campos">
                                {subseccion.campos?.map(
                                  (campo) => (
                                    <div
                                      className="seccion-campo"
                                      key={campo.id_campo}
                                    >
                                      <strong>
                                        {campo.nombre}
                                      </strong>

                                      <p>
                                        {campo.descripcion ||
                                          "Campo definido para esta subsección."}
                                      </p>

                                      <div>
                                        <span>
                                          {campo.obligatorio
                                            ? regla.tipo === "Opcional"
                                              ? "Requerido al agregar"
                                              : "Obligatorio"
                                            : "Opcional"}
                                        </span>

                                        {descripcionRegla(campo) && (
                                          <span>
                                            {descripcionRegla(campo)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          {estadisticas && (
            <section className="secciones-estadisticas">
              <div className="secciones-estadisticas-titulo">
                <div>
                  <span>ESTADÍSTICAS DE USO</span>

                  <h2>
                    Uso de las secciones en los currículums
                  </h2>

                  <p>
                    Una sección se considera utilizada cuando el currículum contiene información registrada en ella.
                  </p>
                </div>

                <select
                  value={carrera}
                  onChange={cambiarCarrera}
                >
                  <option value="">
                    Todas las carreras
                  </option>

                  {estadisticas.carreras?.map(
                    (item) => (
                      <option
                        key={item.id_carrera}
                        value={item.id_carrera}
                      >
                        {item.nombre}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="secciones-estadisticas-resumen">
                <div>
                  <span>CV analizados</span>
                  <strong>
                    {estadisticas.total_curriculums || 0}
                  </strong>
                </div>

                <div>
                  <span>Sección más utilizada</span>
                  <strong>
                    {estadisticas.mayor_uso?.nombre || "Sin datos"}
                  </strong>
                </div>

                <div>
                  <span>Sección menos utilizada</span>
                  <strong>
                    {estadisticas.menor_uso?.nombre || "Sin datos"}
                  </strong>
                </div>
              </div>

              <div className="secciones-barras">
                {estadisticas.secciones?.map((item) => (
                  <div
                    className="seccion-barra"
                    key={item.id_seccion}
                  >
                    <div>
                      <span>{item.nombre}</span>

                      <strong>
                        {item.curriculums} de{" "}
                        {item.total_curriculums} CV ·{" "}
                        {item.porcentaje}%
                      </strong>
                    </div>

                    <div className="seccion-barra-fondo">
                      <div
                        style={{
                          width:`${item.porcentaje}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaginaSeccionesAdministrador;