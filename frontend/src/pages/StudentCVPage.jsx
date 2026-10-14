import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function StudentCVPage() {
  const [curriculums, setCurriculums] = useState([]);

  const [form, setForm] = useState({
    id_curriculum: null,
    nombre: "",
    titulo_profesional: "",
    resumen_profesional: "",
    id_plantilla: ""
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarCurriculums = async () => {
    try {
      const response =
        await api.get("/curriculums");

      setCurriculums(response.data.curriculums);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudieron cargar los currículums"
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const obtener = async () => {
      try {
        const response =
          await api.get("/curriculums");

        if (activo) {
          setCurriculums(response.data.curriculums);
        }

      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar los currículums"
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
      id_curriculum: null,
      nombre: "",
      titulo_profesional: "",
      resumen_profesional: "",
      id_plantilla: ""
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    try {
      const datos = {
        nombre: form.nombre,
        titulo_profesional:
          form.titulo_profesional,
        resumen_profesional:
          form.resumen_profesional,
        id_plantilla:
          form.id_plantilla
            ? Number(form.id_plantilla)
            : null
      };

      let response;

      if (form.id_curriculum) {
        response = await api.put(
          `/curriculums/${form.id_curriculum}`,
          datos
        );
      } else {
        response = await api.post(
          "/curriculums",
          datos
        );
      }

      setMensaje(response.data.mensaje);

      limpiarFormulario();

      await cargarCurriculums();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar el currículum"
      );
    }
  };

  const editar = (curriculum) => {
    setForm({
      id_curriculum: curriculum.id_curriculum,
      nombre: curriculum.nombre || "",
      titulo_profesional:
        curriculum.titulo_profesional || "",
      resumen_profesional:
        curriculum.resumen_profesional || "",
      id_plantilla:
        curriculum.id_plantilla || ""
    });

    setError("");
    setMensaje("");
  };

  const eliminar = async (curriculum) => {
    const confirmar =
      window.confirm(
        `¿Deseas eliminar el currículum "${curriculum.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      const response = await api.delete(
        `/curriculums/${curriculum.id_curriculum}`
      );

      setMensaje(response.data.mensaje);

      await cargarCurriculums();

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo eliminar el currículum"
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/estudiante">
        ← Volver al dashboard
      </Link>

      <h1>Mis currículums</h1>

      <form
        onSubmit={guardar}
        style={{ marginBottom: "30px" }}
      >

        <p>
          <label>
            Nombre del currículum
          </label>

          <br />

          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ejemplo: CV Desarrollo Software"
            required
          />
        </p>

        <p>
          <label>
            Título profesional
          </label>

          <br />

          <input
            name="titulo_profesional"
            value={form.titulo_profesional}
            onChange={handleChange}
            placeholder="Ejemplo: Desarrollador de Software"
          />
        </p>

        <p>
          <label>
            Resumen profesional
          </label>

          <br />

          <textarea
            name="resumen_profesional"
            value={form.resumen_profesional}
            onChange={handleChange}
            rows="5"
          />
        </p>

        <p>
          <label>
            ID de plantilla
          </label>

          <br />

          <input
            type="number"
            name="id_plantilla"
            value={form.id_plantilla}
            onChange={handleChange}
            placeholder="Ejemplo: 1"
          />
        </p>

        <button type="submit">
          {form.id_curriculum
            ? "Guardar cambios"
            : "Crear currículum"}
        </button>

        {form.id_curriculum && (
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

      <h2>Currículums creados</h2>

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
            <th>Nombre</th>
            <th>Título profesional</th>
            <th>Plantilla</th>
            <th>Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {curriculums.length === 0 ? (
            <tr>
              <td colSpan="5">
                No tienes currículums creados.
              </td>
            </tr>
          ) : (
            curriculums.map((curriculum) => (
              <tr key={curriculum.id_curriculum}>

                <td>
                  {curriculum.nombre}
                </td>

                <td>
                  {curriculum.titulo_profesional || "-"}
                </td>

                <td>
                  {curriculum.plantilla || "Sin plantilla"}
                </td>

                <td>
                  {new Date(
                    curriculum.fecha_actualizacion
                  ).toLocaleDateString()}
                </td>

                <td>

                  <button
                    type="button"
                    onClick={() => editar(curriculum)}
                  >
                    Editar
                  </button>

                  {" "}

                  <button
                    type="button"
                    onClick={() =>
                      eliminar(curriculum)
                    }
                  >
                    Eliminar
                  </button>

                </td>

              </tr>
            ))
          )}

        </tbody>
      </table>

    </main>
  );
}

export default StudentCVPage;