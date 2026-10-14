import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminTemplatesPage() {
  const [plantillas, setPlantillas] = useState([]);

  const [form, setForm] = useState({
    id_plantilla: null,
    nombre: "",
    codigo: "",
    descripcion: "",
    imagen_url: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPlantillas = async () => {
    try {
      const response =
        await api.get("/admin/plantillas");

      setPlantillas(response.data.plantillas);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las plantillas"
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const obtenerPlantillas = async () => {
      try {
        const response =
          await api.get("/admin/plantillas");

        if (activo) {
          setPlantillas(response.data.plantillas);
        }

      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las plantillas"
          );
        }
      }
    };

    obtenerPlantillas();

    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const limpiarFormulario = () => {
    setForm({
      id_plantilla: null,
      nombre: "",
      codigo: "",
      descripcion: "",
      imagen_url: ""
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    try {
      let response;

      const datos = {
        nombre: form.nombre,
        codigo: form.codigo,
        descripcion: form.descripcion,
        imagen_url: form.imagen_url
      };

      if (form.id_plantilla) {
        response = await api.put(
          `/admin/plantillas/${form.id_plantilla}`,
          datos
        );
      } else {
        response = await api.post(
          "/admin/plantillas",
          datos
        );
      }

      setMensaje(response.data.mensaje);

      limpiarFormulario();
      await cargarPlantillas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar la plantilla"
      );
    }
  };

  const editar = (plantilla) => {
    setForm({
      id_plantilla: plantilla.id_plantilla,
      nombre: plantilla.nombre,
      codigo: plantilla.codigo,
      descripcion: plantilla.descripcion || "",
      imagen_url: plantilla.imagen_url || ""
    });

    setError("");
    setMensaje("");
  };

  const cambiarEstado = async (plantilla) => {
    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/plantillas/${plantilla.id_plantilla}/estado`,
        {
          estado: !plantilla.estado
        }
      );

      setMensaje(response.data.mensaje);

      await cargarPlantillas();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo cambiar el estado"
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/admin">
        ← Volver al dashboard
      </Link>

      <h1>Gestionar plantillas</h1>

      <form
        onSubmit={guardar}
        style={{ marginBottom: "30px" }}
      >
        <p>
          <label>Nombre</label>
          <br />

          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </p>

        <p>
          <label>Código</label>
          <br />

          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Ejemplo: moderna"
            required
          />
        </p>

        <p>
          <label>Descripción</label>
          <br />

          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </p>

        <p>
          <label>URL de imagen</label>
          <br />

          <input
            name="imagen_url"
            value={form.imagen_url}
            onChange={handleChange}
          />
        </p>

        <button type="submit">
          {form.id_plantilla
            ? "Guardar cambios"
            : "Crear plantilla"}
        </button>

        {form.id_plantilla && (
          <button
            type="button"
            onClick={limpiarFormulario}
          >
            Cancelar
          </button>
        )}
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
            <th>ID</th>
            <th>Plantilla</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {plantillas.map((plantilla) => (
            <tr key={plantilla.id_plantilla}>

              <td>{plantilla.id_plantilla}</td>

              <td>{plantilla.nombre}</td>

              <td>{plantilla.codigo}</td>

              <td>{plantilla.descripcion}</td>

              <td>
                {plantilla.estado
                  ? "Activa"
                  : "Inactiva"}
              </td>

              <td>
                <button
                  type="button"
                  onClick={() => editar(plantilla)}
                >
                  Editar
                </button>

                {" "}

                <button
                  type="button"
                  onClick={() =>
                    cambiarEstado(plantilla)
                  }
                >
                  {plantilla.estado
                    ? "Desactivar"
                    : "Activar"}
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </main>
  );
}

export default AdminTemplatesPage;