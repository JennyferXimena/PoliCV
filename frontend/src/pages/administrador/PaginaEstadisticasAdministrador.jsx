import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/estadisticas.css";

function PaginaEstadisticasAdministrador() {
  const [datos,setDatos] = useState(null);
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    api.get("/admin/estadisticas")
      .then((respuesta) => {
        if (!cancelado) {
          setDatos(respuesta.data.estadisticas || {});
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

  const usuarios = datos?.usuarios || {};
  const curriculums = datos?.curriculums || {};
  const secciones = datos?.secciones || {};
  const plantillas = datos?.plantillas || {};
  const propuestas = datos?.propuestas || {};

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              INFORMACIÓN DEL SISTEMA
            </span>

            <h1>Estadísticas</h1>

            <p>
              Resumen general del estado actual de TalentoESFOT.
            </p>
          </div>

          <div className="admin-header-badge">
            Resumen general
          </div>
        </header>

        <div className="admin-content">
          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {cargando ? (
            <div className="admin-state-card">
              Cargando estadísticas...
            </div>
          ) : (
            <>
              <section className="estadisticas-intro">
                <span>RESUMEN GENERAL</span>

                <h2>Estado actual de TalentoESFOT</h2>

                <p>
                  Selecciona una tarjeta para consultar información detallada de cada módulo.
                </p>
              </section>

              <section className="estadisticas-modulos">
                <Link
                  to="/admin/usuarios"
                  className="estadistica-modulo usuarios"
                >
                  <span>USUARIOS</span>
                  <strong>{usuarios.total || 0}</strong>
                  <h3>Gestión de usuarios</h3>

                  <p>
                    {usuarios.activos || 0} activos ·{" "}
                    {usuarios.verificados || 0} verificados
                  </p>

                  <small>Ver detalles →</small>
                </Link>

                <Link
                  to="/admin/curriculums-estadisticas"
                  className="estadistica-modulo curriculums"
                >
                  <span>CURRÍCULUMS</span>
                  <strong>{curriculums.total || 0}</strong>
                  <h3>Currículums creados</h3>

                  <p>
                    {curriculums.estudiantes || 0} estudiantes tienen al menos un CV.
                  </p>

                  <small>Ver estadísticas →</small>
                </Link>

                <Link
                  to="/admin/secciones"
                  className="estadistica-modulo secciones"
                >
                  <span>SECCIONES DEL CV</span>
                  <strong>{secciones.total || 0}</strong>
                  <h3>Estructura del currículum</h3>

                  <p>
                    {secciones.activas || 0} secciones activas.
                  </p>

                  <small>Ver estructura y uso →</small>
                </Link>

                <Link
                  to="/admin/plantillas"
                  className="estadistica-modulo plantillas"
                >
                  <span>PLANTILLAS</span>
                  <strong>{plantillas.total || 0}</strong>
                  <h3>Diseños disponibles</h3>

                  <p>
                    {plantillas.activas || 0} plantillas activas.
                  </p>

                  <small>Ver uso de plantillas →</small>
                </Link>

                <Link
                  to="/admin/propuestas"
                  className="estadistica-modulo propuestas"
                >
                  <span>PROPUESTAS</span>
                  <strong>{propuestas.total || 0}</strong>
                  <h3>Propuestas de mejora</h3>

                  <p>
                    {propuestas.pendientes || 0} pendientes ·{" "}
                    {propuestas.revision || 0} en revisión
                  </p>

                  <small>Revisar propuestas →</small>
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaginaEstadisticasAdministrador;