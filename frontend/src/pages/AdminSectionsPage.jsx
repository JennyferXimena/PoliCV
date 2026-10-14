import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminSectionsPage() {
  const [secciones, setSecciones] = useState([]);

  const [form, setForm] = useState({
    id_seccion: null,
    nombre: "",
    descripcion: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarSecciones = async () => {
    try {
      const response =
        await api.get("/admin/secciones");

      setSecciones(response.data.secciones);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar las secciones"
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const obtener = async () => {
      try {
        const response =
          await api.get("/admin/secciones");

        if (activo) {
          setSecciones(response.data.secciones);
        }
      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las secciones"
          );
        }
      }
    };

    obtener();

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
      id_seccion: null,
      nombre: "",
      descripcion: ""
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    try {
      let response;

      if (form.id_seccion) {
        response = await api.put(
          `/admin/secciones/${form.id_seccion}`,
          {
            nombre: form.nombre,
            descripcion: form.descripcion
          }
        );
      } else {
        response = await api.post(
          "/admin/secciones",
          {
            nombre: form.nombre,
            descripcion: form.descripcion
          }
        );
      }

      setMensaje(response.data.mensaje);

      limpiarFormulario();

      await cargarSecciones();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar la sección"
      );
    }
  };

  const editar = (seccion) => {
    setForm({
      id_seccion: seccion.id_seccion,
      nombre: seccion.nombre,
      descripcion: seccion.descripcion || ""
    });

    setMensaje("");
    setError("");
  };

  const cambiarEstado = async (seccion) => {
    try {
      setError("");
      setMensaje("");

      const response = await api.patch(
        `/admin/secciones/${seccion.id_seccion}/estado`,
        {
          estado: !seccion.estado
        }
      );

      setMensaje(response.data.mensaje);

      await cargarSecciones();

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

      <h1>Gestionar secciones del currículum</h1>

      <form
        onSubmit={guardar}
        style={{ marginBottom: "30px" }}
      >
        <div>
          <label>
            Nombre
          </label>

          <br />

          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>
            Descripción
          </label>

          <br />

          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          {form.id_seccion
            ? "Guardar cambios"
            : "Crear sección"}
        </button>

        {form.id_seccion && (
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
            <th>Sección</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {secciones.map((seccion) => (
            <tr key={seccion.id_seccion}>

              <td>
                {seccion.id_seccion}
              </td>

              <td>
                {seccion.nombre}
              </td>

              <td>
                {seccion.descripcion}
              </td>

              <td>
                {seccion.estado
                  ? "Activa"
                  : "Inactiva"}
              </td>

              <td>

                <button
                  type="button"
                  onClick={() => editar(seccion)}
                >
                  Editar
                </button>

                {" "}

                <button
                  type="button"
                  onClick={() =>
                    cambiarEstado(seccion)
                  }
                >
                  {seccion.estado
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

export default AdminSectionsPage;