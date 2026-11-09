import { useEffect,useState } from "react";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/curriculumsEstadisticas.css";

function Barra({ nombre,valor,total }) {
  const porcentaje = total
    ? Math.round((valor / total) * 100)
    : 0;

  return (
    <div className="cv-estadistica-barra">
      <div>
        <span>{nombre}</span>
        <strong>{valor} CV · {porcentaje}%</strong>
      </div>

      <div className="cv-estadistica-fondo">
        <div style={{ width:`${porcentaje}%` }} />
      </div>
    </div>
  );
}

function PaginaEstadisticasCurriculumsAdministrador() {
  const [datos,setDatos] = useState(null);
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    api.get("/admin/estadisticas/curriculums")
      .then((respuesta) => {
        if (!cancelado) {
          setDatos(respuesta.data.estadisticas);
        }
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las estadísticas"
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

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ESTADÍSTICAS DE CURRÍCULUMS</span>
            <h1>Currículums</h1>
            <p>Consulta cómo se utilizan los currículums dentro de TalentoESFOT.</p>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="admin-message error">{error}</div>}

          {cargando ? (
            <div className="admin-state-card">Cargando estadísticas...</div>
          ) : datos && (
            <>
              <section className="cv-estadisticas-resumen">
                <div>
                  <span>CV CREADOS</span>
                  <strong>{datos.total}</strong>
                </div>

                <div>
                  <span>ESTUDIANTES CON CV</span>
                  <strong>{datos.estudiantes}</strong>
                </div>

                <div>
                  <span>PROMEDIO POR ESTUDIANTE</span>
                  <strong>{datos.promedio_por_estudiante}</strong>
                </div>
              </section>

              <section className="cv-estadisticas-grid">
                <article>
                  <h2>Currículums por carrera</h2>

                  {datos.por_carrera.map((item) => (
                    <Barra
                      key={item.id_carrera}
                      nombre={item.carrera}
                      valor={item.curriculums}
                      total={datos.total}
                    />
                  ))}
                </article>

                <article>
                  <h2>Currículums por plantilla</h2>

                  {datos.por_plantilla.map((item) => (
                    <Barra
                      key={item.id_plantilla}
                      nombre={item.plantilla}
                      valor={item.curriculums}
                      total={datos.total}
                    />
                  ))}
                </article>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaginaEstadisticasCurriculumsAdministrador;