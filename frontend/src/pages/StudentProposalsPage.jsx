import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function StudentProposalsPage() {
  const [propuestas, setPropuestas] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPropuestas = async () => {
    try {
      const response = await api.get("/propuestas");

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
        const response = await api.get("/propuestas");

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

  const enviar = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    try {
      const response = await api.post(
        "/propuestas",
        {
          titulo,
          descripcion
        }
      );

      setMensaje(response.data.mensaje);

      setTitulo("");
      setDescripcion("");

      await cargarPropuestas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo enviar la propuesta"
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/estudiante">
        ← Volver al dashboard
      </Link>

      <h1>Propuestas de mejora</h1>

      <form onSubmit={enviar}>
        <p>
          <label>Título</label>
          <br />

          <input
            value={titulo}
            onChange={(e) =>
              setTitulo(e.target.value)
            }
            required
          />
        </p>

        <p>
          <label>Descripción</label>
          <br />

          <textarea
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
            }
            rows="5"
            required
          />
        </p>

        <button type="submit">
          Enviar propuesta
        </button>
      </form>

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

      <h2>Mis propuestas</h2>

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
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Respuesta</th>
          </tr>
        </thead>

        <tbody>
          {propuestas.map((propuesta) => (
            <tr key={propuesta.id_propuesta}>
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
            </tr>
          ))}
        </tbody>
      </table>

    </main>
  );
}

export default StudentProposalsPage;