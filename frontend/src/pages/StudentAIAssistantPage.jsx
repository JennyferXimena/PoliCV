import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import api from "../services/api";


function StudentAIAssistantPage() {
  const [
    curriculums,
    setCurriculums
  ] = useState([]);

  const [
    idCurriculum,
    setIdCurriculum
  ] = useState("");

  const [
    mensajes,
    setMensajes
  ] = useState([
    {
      role: "assistant",
      content:
        "Hola, soy el asistente de PoliCV. Selecciona uno de tus currículums para comenzar."
    }
  ]);

  const [
    mensaje,
    setMensaje
  ] = useState("");

  const [
    cargando,
    setCargando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    sugerenciaResumen,
    setSugerenciaResumen
  ] = useState("");

  const [
    generandoSugerencia,
    setGenerandoSugerencia
  ] = useState(false);

  const [
    mensajeSugerencia,
    setMensajeSugerencia
  ] = useState("");


  useEffect(() => {
    let activo = true;

    const cargarCurriculums =
      async () => {
        try {
          const response =
            await api.get(
              "/curriculums"
            );

          if (!activo) {
            return;
          }

          const lista =
            response.data.curriculums ||
            response.data.datos ||
            [];

          setCurriculums(lista);

        } catch {
          if (activo) {
            setError(
              "No se pudieron cargar tus currículums"
            );
          }
        }
      };

    cargarCurriculums();

    return () => {
      activo = false;
    };

  }, []);


  const cambiarCurriculum = (e) => {
    const nuevoId =
      e.target.value;

    setIdCurriculum(
      nuevoId
    );

    setSugerenciaResumen("");
    setMensajeSugerencia("");

    setMensajes([
      {
        role: "assistant",
        content:
          nuevoId
            ? "Currículum seleccionado. Ya puedo analizar la información que tienes registrada."
            : "Selecciona uno de tus currículums para comenzar."
      }
    ]);

    setMensaje("");
    setError("");
  };


  const enviarMensaje =
    async (e) => {
      e.preventDefault();

      const texto =
        mensaje.trim();

      if (!idCurriculum) {
        setError(
          "Primero debes seleccionar un currículum"
        );

        return;
      }

      if (
        !texto ||
        cargando
      ) {
        return;
      }

      setError("");

      const mensajeUsuario = {
        role: "user",
        content: texto
      };

      const historialAnterior =
        mensajes.map(
          (item) => ({
            role:
              item.role,

            content:
              item.content
          })
        );

      setMensajes(
        (anteriores) => [
          ...anteriores,
          mensajeUsuario
        ]
      );

      setMensaje("");
      setCargando(true);

      try {
        const response =
          await api.post(
            "/ia/chat",
            {
              mensaje:
                texto,

              historial:
                historialAnterior,

              id_curriculum:
                Number(
                  idCurriculum
                )
            }
          );

        setMensajes(
          (anteriores) => [
            ...anteriores,
            {
              role: "assistant",
              content:
                response.data.respuesta
            }
          ]
        );

      } catch (error) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo obtener una respuesta"
        );

      } finally {
        setCargando(false);
      }
    };


  const generarResumen =
    async () => {
      if (!idCurriculum) {
        setError(
          "Selecciona un currículum"
        );

        return;
      }

      setError("");
      setMensajeSugerencia("");
      setGenerandoSugerencia(true);

      try {
        const response =
          await api.post(
            `/ia/curriculums/${idCurriculum}/resumen/sugerir`
          );

        setSugerenciaResumen(
          response.data.sugerencia
        );

      } catch (error) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo generar la sugerencia"
        );

      } finally {
        setGenerandoSugerencia(false);
      }
    };


  const aplicarResumen =
    async () => {
      if (!sugerenciaResumen) {
        return;
      }

      try {
        const response =
          await api.put(
            `/ia/curriculums/${idCurriculum}/resumen/aplicar`,
            {
              resumen:
                sugerenciaResumen
            }
          );

        setMensajeSugerencia(
          response.data.mensaje
        );

        setMensajes(
          (anteriores) => [
            ...anteriores,
            {
              role: "assistant",
              content:
                "La sugerencia de resumen profesional fue aplicada a tu currículum."
            }
          ]
        );

      } catch (error) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo aplicar la sugerencia"
        );
      }
    };


  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px"
      }}
    >

      <Link to="/estudiante">
        ← Volver al dashboard
      </Link>

      <h1>
        Asistente IA de PoliCV
      </h1>
        <p>
        <Link to="/estudiante/crear-cv-ia">
            Crear un currículum desde cero con IA
        </Link>
        </p>
      <p>
        Selecciona un currículum para
        analizarlo y recibir sugerencias.
      </p>


      <div
        style={{
          marginBottom: "20px"
        }}
      >
        <label>
          <strong>
            Currículum:
          </strong>
        </label>

        <br />

        <select
          value={idCurriculum}
          onChange={cambiarCurriculum}
        >
          <option value="">
            Selecciona un currículum
          </option>

          {curriculums.map(
            (curriculum) => (
              <option
                key={
                  curriculum.id_curriculum
                }
                value={
                  curriculum.id_curriculum
                }
              >
                {curriculum.nombre}
              </option>
            )
          )}
        </select>
      </div>


      {idCurriculum && (
        <section
          style={{
            border:
              "1px solid #ccc",

            padding:
              "20px",

            marginBottom:
              "25px"
          }}
        >
          <h2>
            Sugerencia de resumen profesional
          </h2>

          <button
            type="button"
            onClick={generarResumen}
            disabled={
              generandoSugerencia
            }
          >
            {generandoSugerencia
              ? "Generando..."
              : "Generar sugerencia con IA"}
          </button>


          {sugerenciaResumen && (
            <div
              style={{
                marginTop:
                  "20px"
              }}
            >
              <textarea
                rows="6"
                value={
                  sugerenciaResumen
                }
                onChange={
                  (e) =>
                    setSugerenciaResumen(
                      e.target.value
                    )
                }
                style={{
                  width:
                    "100%"
                }}
              />

              <br />

              <button
                type="button"
                onClick={
                  aplicarResumen
                }
              >
                Aplicar al CV
              </button>
            </div>
          )}


          {mensajeSugerencia && (
            <p
              style={{
                color:
                  "green"
              }}
            >
              {mensajeSugerencia}
            </p>
          )}
        </section>
      )}


      <div
        style={{
          border:
            "1px solid #ccc",

          minHeight:
            "400px",

          maxHeight:
            "500px",

          overflowY:
            "auto",

          padding:
            "20px",

          marginBottom:
            "20px"
        }}
      >
        {mensajes.map(
          (item, index) => (
            <div
              key={index}
              style={{
                marginBottom:
                  "20px",

                textAlign:
                  item.role ===
                  "user"
                    ? "right"
                    : "left"
              }}
            >
              <strong>
                {item.role ===
                "user"
                  ? "Tú"
                  : "PoliCV IA"}
              </strong>

              <br />

              <div
                style={{
                  display:
                    "inline-block",

                  maxWidth:
                    "75%",

                  padding:
                    "10px",

                  marginTop:
                    "5px",

                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "8px",

                  textAlign:
                    "left",

                  whiteSpace:
                    "pre-wrap"
                }}
              >
                {item.content}
              </div>
            </div>
          )
        )}

        {cargando && (
          <p>
            <strong>
              PoliCV IA:
            </strong>
            {" "}
            Analizando...
          </p>
        )}
      </div>


      {error && (
        <p
          style={{
            color: "red"
          }}
        >
          {error}
        </p>
      )}


      <form onSubmit={enviarMensaje}>
        <textarea
          rows="4"

          value={mensaje}

          onChange={
            (e) =>
              setMensaje(
                e.target.value
              )
          }

          placeholder={
            idCurriculum
              ? "Pregunta algo sobre tu currículum..."
              : "Selecciona primero un currículum"
          }

          disabled={
            !idCurriculum ||
            cargando
          }

          style={{
            width: "100%",
            marginBottom: "10px"
          }}
        />

        <button
          type="submit"
          disabled={
            !idCurriculum ||
            cargando
          }
        >
          {cargando
            ? "Enviando..."
            : "Enviar"}
        </button>
      </form>

    </main>
  );
}

export default StudentAIAssistantPage;