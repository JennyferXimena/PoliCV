import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminProposalsPage() {
  const [propuestas, setPropuestas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPropuestas = async () => {
    try {
      const response =
        await api.get("/admin/propuestas");

      setPropuestas(response.data.propuestas);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las propuestas"
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const obtener = async () => {
      try {
        const response =
          await api.get("/admin/propuestas");

        if (activo) {
          setPropuestas(response.data.propuestas);
        }

      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las propuestas"
          );
        }
      }
    };

    obtener();

    return () => {
      activo = false;
    };
  }, []);

  const actualizar = async (
    propuesta,
    nuevoEstado
  ) => {
    const respuesta =
      window.prompt(
        "Respuesta para el estudiante:",
        propuesta.respuesta_admin || ""
      );

    if (respuesta === null) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/propuestas/${propuesta.id_propuesta}`,
        {
          estado: nuevoEstado,
          respuesta_admin: respuesta
        }
      );

      setMensaje(response.data.mensaje);

      await cargarPropuestas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar la propuesta"
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/admin">
        ← Volver al dashboard
      </Link>

      <h1>Gestionar propuestas de mejora</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {mensaje && (
        <p style={{ color: "green" }}>
          {mensaje}
        </p>
      )}

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%"
        }}
      >
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Respuesta</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {propuestas.map((propuesta) => (
            <tr key={propuesta.id_propuesta}>

              <td>
                {propuesta.nombres || ""}
                {" "}
                {propuesta.apellidos || ""}
                <br />
                {propuesta.email}
              </td>

              <td>{propuesta.titulo}</td>

              <td>
                {propuesta.descripcion}
              </td>

              <td>
                {propuesta.estado}
              </td>

              <td>
                {propuesta.respuesta_admin || "-"}
              </td>

              <td>
                <button
                  onClick={() =>
                    actualizar(
                      propuesta,
                      "en_revision"
                    )
                  }
                >
                  Revisar
                </button>

                {" "}

                <button
                  onClick={() =>
                    actualizar(
                      propuesta,
                      "aceptada"
                    )
                  }
                >
                  Aceptar
                </button>

                {" "}

                <button
                  onClick={() =>
                    actualizar(
                      propuesta,
                      "rechazada"
                    )
                  }
                >
                  Rechazar
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </main>
  );
}

export default AdminProposalsPage;