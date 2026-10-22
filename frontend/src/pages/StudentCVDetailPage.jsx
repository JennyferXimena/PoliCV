import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const CONFIGURACION = {
  formacion: {
    titulo: "Formación académica",
    id: "id_formacion",
    campos: [
      { nombre: "institucion", etiqueta: "Institución", tipo: "text" },
      { nombre: "titulo", etiqueta: "Título obtenido", tipo: "text" },
      { nombre: "fecha_inicio", etiqueta: "Fecha de inicio", tipo: "date" },
      { nombre: "fecha_fin", etiqueta: "Fecha de fin", tipo: "date" },
      { nombre: "en_curso", etiqueta: "Actualmente cursando", tipo: "checkbox" },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea" }
    ]
  },

  experiencias: {
    titulo: "Experiencia laboral",
    id: "id_experiencia",
    campos: [
      { nombre: "empresa", etiqueta: "Empresa", tipo: "text" },
      { nombre: "cargo", etiqueta: "Cargo", tipo: "text" },
      { nombre: "fecha_inicio", etiqueta: "Fecha de inicio", tipo: "date" },
      { nombre: "fecha_fin", etiqueta: "Fecha de fin", tipo: "date" },
      { nombre: "actualmente", etiqueta: "Trabajo actualmente aquí", tipo: "checkbox" },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea" }
    ]
  },

  proyectos: {
    titulo: "Proyectos",
    id: "id_proyecto",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", tipo: "text" },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "textarea" },
      { nombre: "tecnologias", etiqueta: "Tecnologías", tipo: "text" },
      { nombre: "enlace", etiqueta: "Enlace", tipo: "url" }
    ]
  },

  habilidades: {
    titulo: "Habilidades",
    id: "id_habilidad",
    campos: [
      { nombre: "nombre", etiqueta: "Habilidad", tipo: "text" },
      { nombre: "nivel", etiqueta: "Nivel", tipo: "text" }
    ]
  },

  idiomas: {
    titulo: "Idiomas",
    id: "id_idioma",
    campos: [
      { nombre: "idioma", etiqueta: "Idioma", tipo: "text" },
      { nombre: "nivel", etiqueta: "Nivel", tipo: "text" }
    ]
  },

  cursos: {
    titulo: "Cursos y certificaciones",
    id: "id_curso",
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", tipo: "text" },
      { nombre: "institucion", etiqueta: "Institución", tipo: "text" },
      { nombre: "fecha_obtencion", etiqueta: "Fecha de obtención", tipo: "date" },
      { nombre: "enlace", etiqueta: "Enlace", tipo: "url" }
    ]
  }
};

function StudentCVDetailPage() {
  const { id } = useParams();

  const [curriculum, setCurriculum] = useState(null);
  const [seccionActual, setSeccionActual] = useState("formacion");
  const [registros, setRegistros] = useState([]);

  const [form, setForm] = useState({});
  const [idEdicion, setIdEdicion] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const config = useMemo(
    () => CONFIGURACION[seccionActual],
    [seccionActual]
  );

  const crearFormularioVacio = (seccion) => {
    const configuracion = CONFIGURACION[seccion];

    const nuevoForm = {};

    configuracion.campos.forEach((campo) => {
      nuevoForm[campo.nombre] =
        campo.tipo === "checkbox" ? false : "";
    });

    return nuevoForm;
  };

  const cargarRegistros = async (seccion) => {
    try {
      const response = await api.get(
        `/curriculums/${id}/secciones/${seccion}`
      );

      setRegistros(response.data.datos);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo cargar la información"
      );
    }
  };

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const response =
          await api.get(`/curriculums/${id}`);

        if (!activo) return;

        setCurriculum(response.data.curriculum);

        const detalles = await api.get(
          `/curriculums/${id}/secciones/formacion`
        );

        if (!activo) return;

        setRegistros(detalles.data.datos);
        setForm(crearFormularioVacio("formacion"));

      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudo cargar el currículum"
          );
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [id]);

  const cambiarSeccion = async (seccion) => {
    setSeccionActual(seccion);
    setIdEdicion(null);
    setForm(crearFormularioVacio(seccion));
    setMensaje("");
    setError("");

    await cargarRegistros(seccion);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const limpiar = () => {
    setIdEdicion(null);
    setForm(crearFormularioVacio(seccionActual));
  };

  const guardar = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    try {
      let response;

      if (idEdicion) {
        response = await api.put(
          `/curriculums/${id}/secciones/${seccionActual}/${idEdicion}`,
          form
        );
      } else {
        response = await api.post(
          `/curriculums/${id}/secciones/${seccionActual}`,
          form
        );
      }

      setMensaje(response.data.mensaje);

      limpiar();
      await cargarRegistros(seccionActual);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo guardar la información"
      );
    }
  };

  const editar = (registro) => {
    const datos = {};

    config.campos.forEach((campo) => {
      if (campo.tipo === "checkbox") {
        datos[campo.nombre] =
          Boolean(registro[campo.nombre]);
      } else if (
        campo.tipo === "date" &&
        registro[campo.nombre]
      ) {
        datos[campo.nombre] =
          String(registro[campo.nombre]).slice(0, 10);
      } else {
        datos[campo.nombre] =
          registro[campo.nombre] ?? "";
      }
    });

    setIdEdicion(registro[config.id]);
    setForm(datos);
    setMensaje("");
    setError("");
  };

  const eliminar = async (registro) => {
    const confirmar = window.confirm(
      "¿Deseas eliminar este registro?"
    );

    if (!confirmar) return;

    try {
      const response = await api.delete(
        `/curriculums/${id}/secciones/${seccionActual}/${registro[config.id]}`
      );

      setMensaje(response.data.mensaje);

      await cargarRegistros(seccionActual);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo eliminar la información"
      );
    }
  };

  if (!curriculum) {
    return (
      <main style={{ padding: "40px" }}>
        <p>{error || "Cargando currículum..."}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>

      <Link to="/estudiante/curriculums">
        ← Volver a mis currículums
      </Link>

      <h1>{curriculum.nombre}</h1>

      <p>
        {curriculum.titulo_profesional ||
          "Sin título profesional"}
      </p>

      <hr />

      <h2>Información del currículum</h2>

      <div style={{ marginBottom: "25px" }}>
        {Object.entries(CONFIGURACION).map(
          ([clave, seccion]) => (
            <button
              key={clave}
              type="button"
              onClick={() => cambiarSeccion(clave)}
              style={{
                marginRight: "8px",
                marginBottom: "8px"
              }}
            >
              {seccion.titulo}
            </button>
          )
        )}
      </div>

      <h2>{config.titulo}</h2>

      <form
        onSubmit={guardar}
        style={{ marginBottom: "30px" }}
      >

        {config.campos.map((campo) => (
          <div
            key={campo.nombre}
            style={{ marginBottom: "15px" }}
          >

            {campo.tipo === "checkbox" ? (
              <label>
                <input
                  type="checkbox"
                  name={campo.nombre}
                  checked={Boolean(
                    form[campo.nombre]
                  )}
                  onChange={handleChange}
                />

                {" "}
                {campo.etiqueta}
              </label>
            ) : (
              <>
                <label>
                  {campo.etiqueta}
                </label>

                <br />

                {campo.tipo === "textarea" ? (
                  <textarea
                    name={campo.nombre}
                    value={
                      form[campo.nombre] || ""
                    }
                    onChange={handleChange}
                    rows="4"
                  />
                ) : (
                  <input
                    type={campo.tipo}
                    name={campo.nombre}
                    value={
                      form[campo.nombre] || ""
                    }
                    onChange={handleChange}
                  />
                )}
              </>
            )}

          </div>
        ))}

        <button type="submit">
          {idEdicion
            ? "Guardar cambios"
            : "Agregar"}
        </button>

        {idEdicion && (
          <>
            {" "}

            <button
              type="button"
              onClick={limpiar}
            >
              Cancelar
            </button>
          </>
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

      <h3>Registros guardados</h3>

      {registros.length === 0 ? (
        <p>
          Todavía no existen registros en esta sección.
        </p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr>
              {config.campos.map((campo) => (
                <th key={campo.nombre}>
                  {campo.etiqueta}
                </th>
              ))}

              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {registros.map((registro) => (
              <tr key={registro[config.id]}>

                {config.campos.map((campo) => (
                  <td key={campo.nombre}>

                    {campo.tipo === "checkbox"
                      ? registro[campo.nombre]
                        ? "Sí"
                        : "No"

                      : campo.tipo === "date" &&
                        registro[campo.nombre]

                      ? new Date(
                          registro[campo.nombre]
                        ).toLocaleDateString()

                      : registro[campo.nombre] || "-"
                    }

                  </td>
                ))}

                <td>
                  <button
                    type="button"
                    onClick={() =>
                      editar(registro)
                    }
                  >
                    Editar
                  </button>

                  {" "}

                  <button
                    type="button"
                    onClick={() =>
                      eliminar(registro)
                    }
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

    </main>
  );
}

export default StudentCVDetailPage;