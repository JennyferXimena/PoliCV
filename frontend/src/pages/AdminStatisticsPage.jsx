import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminStatisticsPage() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const response =
          await api.get("/admin/estadisticas");

        if (activo) {
          setEstadisticas(
            response.data.estadisticas
          );
        }

      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las estadísticas"
          );
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  if (error) {
    return (
      <main style={{ padding: "40px" }}>
        <p style={{ color: "red" }}>
          {error}
        </p>
      </main>
    );
  }

  if (!estadisticas) {
    return (
      <main style={{ padding: "40px" }}>
        <p>Cargando estadísticas...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/admin">
        ← Volver al dashboard
      </Link>

      <h1>Estadísticas de uso</h1>

      <h2>Usuarios</h2>

      <p>
        Total de usuarios:
        {" "}
        <strong>
          {estadisticas.usuarios_total}
        </strong>
      </p>

      <p>
        Usuarios activos:
        {" "}
        <strong>
          {estadisticas.usuarios_activos}
        </strong>
      </p>

      <p>
        Usuarios inactivos:
        {" "}
        <strong>
          {estadisticas.usuarios_inactivos}
        </strong>
      </p>

      <p>
        Estudiantes:
        {" "}
        <strong>
          {estadisticas.estudiantes}
        </strong>
      </p>

      <p>
        Administradores:
        {" "}
        <strong>
          {estadisticas.administradores}
        </strong>
      </p>

      <hr />

      <h2>Configuración del sistema</h2>

      <p>
        Secciones:
        {" "}
        {estadisticas.secciones_activas}
        {" / "}
        {estadisticas.secciones_total}
        {" activas"}
      </p>

      <p>
        Plantillas:
        {" "}
        {estadisticas.plantillas_activas}
        {" / "}
        {estadisticas.plantillas_total}
        {" activas"}
      </p>

      <hr />

      <h2>Propuestas de mejora</h2>

      <p>
        Total:
        {" "}
        {estadisticas.propuestas_total}
      </p>

      <p>
        Pendientes:
        {" "}
        {estadisticas.propuestas_pendientes}
      </p>

      <p>
        Aceptadas:
        {" "}
        {estadisticas.propuestas_aceptadas}
      </p>

      <p>
        Rechazadas:
        {" "}
        {estadisticas.propuestas_rechazadas}
      </p>

    </main>
  );
}

export default AdminStatisticsPage;