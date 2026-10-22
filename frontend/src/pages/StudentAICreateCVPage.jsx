import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../services/api";


const PREGUNTAS = {
  0: "Primero, ¿cómo quieres llamar a este currículum? Ejemplo: CV Desarrollo de Software.",

  1: "¿Cuál es tu título o perfil profesional? Ejemplo: Estudiante de Desarrollo de Software.",

  2: "¿En qué institución estudias o estudiaste?",

  3: "¿Qué carrera o título estudias?",

  4: "¿Cuándo comenzaste tus estudios? Escribe la fecha así: 2023-10-01.",

  5: "¿Actualmente continúas estudiando? Responde sí o no.",

  6: "¿Cuándo terminaste tus estudios? Escribe la fecha así: 2025-08-01.",

  7: "¿Tienes experiencia laboral que quieras agregar? Responde sí o no.",

  8: "¿En qué empresa trabajaste?",

  9: "¿Cuál fue tu cargo?",

  10: "Describe brevemente tus principales actividades o responsabilidades.",

  11: "¿Quieres agregar un proyecto? Responde sí o no.",

  12: "¿Cómo se llama el proyecto?",

  13: "Describe brevemente el proyecto y qué realizaste.",

  14: "¿Qué tecnologías utilizaste? Ejemplo: React, Node.js, MySQL.",

  15: "Escribe tus principales habilidades separadas por comas. Ejemplo: React, JavaScript, MySQL, Git.",

  16: "Escribe tus idiomas y nivel usando este formato: Inglés:B2, Español:Nativo.",

  17: "¿Quieres agregar un curso o certificación? Responde sí o no.",

  18: "¿Cómo se llama el curso o certificación?",

  19: "¿Qué institución otorgó ese curso o certificación?"
};


function StudentAICreateCVPage() {
  const navigate = useNavigate();

  const [paso, setPaso] =
    useState(0);

  const [respuesta, setRespuesta] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    capturaCompleta,
    setCapturaCompleta
  ] = useState(false);

  const [
    generandoResumen,
    setGenerandoResumen
  ] = useState(false);

  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [datos, setDatos] =
    useState({
      nombre: "",

      titulo_profesional: "",

      resumen_profesional: "",

      formacion: [
        {
          institucion: "",
          titulo: "",
          fecha_inicio: null,
          fecha_fin: null,
          en_curso: true,
          descripcion: null
        }
      ],

      experiencias: [],

      proyectos: [],

      habilidades: [],

      idiomas: [],

      cursos: []
    });


  const [mensajes, setMensajes] =
    useState([
      {
        role: "assistant",
        content:
          "Hola. Vamos a crear tu currículum paso a paso. No voy a inventar información y podrás revisar todo antes de guardarlo."
      },

      {
        role: "assistant",
        content:
          PREGUNTAS[0]
      }
    ]);


  const esSi = (texto) => {
    const valor =
      texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    return [
      "si",
      "s",
      "yes"
    ].includes(valor);
  };


  const esNo = (texto) => {
    const valor =
      texto
        .trim()
        .toLowerCase();

    return [
      "no",
      "n"
    ].includes(valor);
  };


  const fechaValida = (texto) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    );
  };


  const agregarMensajeIA =
    (texto) => {
      setMensajes(
        (anteriores) => [
          ...anteriores,
          {
            role: "assistant",
            content: texto
          }
        ]
      );
    };


  const avanzar =
    (nuevoPaso) => {
      setPaso(nuevoPaso);

      agregarMensajeIA(
        PREGUNTAS[nuevoPaso]
      );
    };


  const finalizarCaptura = () => {
    setCapturaCompleta(true);

    agregarMensajeIA(
      "Perfecto. Ya tengo la información básica necesaria. Ahora puedo generar un resumen profesional con IA. Revisa los datos antes de crear el currículum."
    );
  };


  const procesarRespuesta =
    async (e) => {
      e.preventDefault();

      const texto =
        respuesta.trim();

      if (!texto) {
        return;
      }

      setError("");

      setMensajes(
        (anteriores) => [
          ...anteriores,
          {
            role: "user",
            content: texto
          }
        ]
      );

      setRespuesta("");


      if (paso === 0) {
        setDatos(
          (anterior) => ({
            ...anterior,
            nombre: texto
          })
        );

        avanzar(1);
        return;
      }


      if (paso === 1) {
        setDatos(
          (anterior) => ({
            ...anterior,
            titulo_profesional:
              texto
          })
        );

        avanzar(2);
        return;
      }


      if (paso === 2) {
        setDatos(
          (anterior) => ({
            ...anterior,

            formacion: [
              {
                ...anterior.formacion[0],
                institucion:
                  texto
              }
            ]
          })
        );

        avanzar(3);
        return;
      }


      if (paso === 3) {
        setDatos(
          (anterior) => ({
            ...anterior,

            formacion: [
              {
                ...anterior.formacion[0],
                titulo:
                  texto
              }
            ]
          })
        );

        avanzar(4);
        return;
      }


      if (paso === 4) {
        if (!fechaValida(texto)) {
          setError(
            "La fecha debe tener el formato AAAA-MM-DD. Ejemplo: 2023-10-01."
          );

          return;
        }

        setDatos(
          (anterior) => ({
            ...anterior,

            formacion: [
              {
                ...anterior.formacion[0],
                fecha_inicio:
                  texto
              }
            ]
          })
        );

        avanzar(5);
        return;
      }


      if (paso === 5) {
        if (
          !esSi(texto) &&
          !esNo(texto)
        ) {
          setError(
            "Responde únicamente sí o no."
          );

          return;
        }

        if (esSi(texto)) {
          setDatos(
            (anterior) => ({
              ...anterior,

              formacion: [
                {
                  ...anterior.formacion[0],
                  en_curso: true,
                  fecha_fin: null
                }
              ]
            })
          );

          avanzar(7);

        } else {
          setDatos(
            (anterior) => ({
              ...anterior,

              formacion: [
                {
                  ...anterior.formacion[0],
                  en_curso: false
                }
              ]
            })
          );

          avanzar(6);
        }

        return;
      }


      if (paso === 6) {
        if (!fechaValida(texto)) {
          setError(
            "La fecha debe tener el formato AAAA-MM-DD."
          );

          return;
        }

        setDatos(
          (anterior) => ({
            ...anterior,

            formacion: [
              {
                ...anterior.formacion[0],
                fecha_fin:
                  texto
              }
            ]
          })
        );

        avanzar(7);
        return;
      }


      if (paso === 7) {
        if (
          !esSi(texto) &&
          !esNo(texto)
        ) {
          setError(
            "Responde únicamente sí o no."
          );

          return;
        }

        if (esSi(texto)) {
          setDatos(
            (anterior) => ({
              ...anterior,

              experiencias: [
                {
                  empresa: "",
                  cargo: "",
                  fecha_inicio: null,
                  fecha_fin: null,
                  actualmente: false,
                  descripcion: ""
                }
              ]
            })
          );

          avanzar(8);

        } else {
          avanzar(11);
        }

        return;
      }


      if (paso === 8) {
        setDatos(
          (anterior) => ({
            ...anterior,

            experiencias:
              anterior.experiencias.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        empresa:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(9);
        return;
      }


      if (paso === 9) {
        setDatos(
          (anterior) => ({
            ...anterior,

            experiencias:
              anterior.experiencias.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        cargo:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(10);
        return;
      }


      if (paso === 10) {
        setDatos(
          (anterior) => ({
            ...anterior,

            experiencias:
              anterior.experiencias.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        descripcion:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(11);
        return;
      }


      if (paso === 11) {
        if (
          !esSi(texto) &&
          !esNo(texto)
        ) {
          setError(
            "Responde únicamente sí o no."
          );

          return;
        }

        if (esSi(texto)) {
          setDatos(
            (anterior) => ({
              ...anterior,

              proyectos: [
                {
                  nombre: "",
                  descripcion: "",
                  tecnologias: "",
                  enlace: null
                }
              ]
            })
          );

          avanzar(12);

        } else {
          avanzar(15);
        }

        return;
      }


      if (paso === 12) {
        setDatos(
          (anterior) => ({
            ...anterior,

            proyectos:
              anterior.proyectos.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        nombre:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(13);
        return;
      }


      if (paso === 13) {
        setDatos(
          (anterior) => ({
            ...anterior,

            proyectos:
              anterior.proyectos.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        descripcion:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(14);
        return;
      }


      if (paso === 14) {
        setDatos(
          (anterior) => ({
            ...anterior,

            proyectos:
              anterior.proyectos.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        tecnologias:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(15);
        return;
      }


      if (paso === 15) {
        const habilidades =
          texto
            .split(",")
            .map(
              (nombre) =>
                nombre.trim()
            )
            .filter(Boolean)
            .map(
              (nombre) => ({
                nombre,
                nivel: null
              })
            );

        setDatos(
          (anterior) => ({
            ...anterior,
            habilidades
          })
        );

        avanzar(16);
        return;
      }


      if (paso === 16) {
        const partes =
          texto
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean);

        const idiomas = [];

        for (const item of partes) {
          const [
            idioma,
            nivel
          ] = item
            .split(":")
            .map(
              (valor) =>
                valor?.trim()
            );

          if (
            idioma &&
            nivel
          ) {
            idiomas.push({
              idioma,
              nivel
            });
          }
        }

        if (
          idiomas.length === 0
        ) {
          setError(
            "Usa el formato Idioma:Nivel. Ejemplo: Inglés:B2, Español:Nativo."
          );

          return;
        }

        setDatos(
          (anterior) => ({
            ...anterior,
            idiomas
          })
        );

        avanzar(17);
        return;
      }


      if (paso === 17) {
        if (
          !esSi(texto) &&
          !esNo(texto)
        ) {
          setError(
            "Responde únicamente sí o no."
          );

          return;
        }

        if (esSi(texto)) {
          setDatos(
            (anterior) => ({
              ...anterior,

              cursos: [
                {
                  nombre: "",
                  institucion: "",
                  fecha_obtencion: null,
                  enlace: null
                }
              ]
            })
          );

          avanzar(18);

        } else {
          finalizarCaptura();
        }

        return;
      }


      if (paso === 18) {
        setDatos(
          (anterior) => ({
            ...anterior,

            cursos:
              anterior.cursos.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        nombre:
                          texto
                      }
                    : item
              )
          })
        );

        avanzar(19);
        return;
      }


      if (paso === 19) {
        setDatos(
          (anterior) => ({
            ...anterior,

            cursos:
              anterior.cursos.map(
                (item, index) =>
                  index === 0
                    ? {
                        ...item,
                        institucion:
                          texto
                      }
                    : item
              )
          })
        );

        finalizarCaptura();
      }
    };


  const generarResumen =
    async () => {
      setError("");
      setGenerandoResumen(true);

      try {
        const response =
          await api.post(
            "/ia/curriculums/borrador/resumen",
            {
              titulo_profesional:
                datos.titulo_profesional,

              formacion:
                datos.formacion,

              experiencias:
                datos.experiencias,

              proyectos:
                datos.proyectos,

              habilidades:
                datos.habilidades,

              idiomas:
                datos.idiomas,

              cursos:
                datos.cursos
            }
          );

        setDatos(
          (anterior) => ({
            ...anterior,

            resumen_profesional:
              response.data.resumen
          })
        );

      } catch (error) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo generar el resumen con IA"
        );

      } finally {
        setGenerandoResumen(false);
      }
    };


  const crearCurriculum =
    async () => {
      if (
        !datos.resumen_profesional
      ) {
        setError(
          "Primero genera o escribe el resumen profesional."
        );

        return;
      }

      setError("");
      setGuardando(true);

      try {
        const response =
          await api.post(
            "/ia/curriculums/crear-desde-ia",
            datos
          );

        const id =
          response.data.id_curriculum;

        navigate(
          `/estudiante/curriculums/${id}`
        );

      } catch (error) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo crear el currículum"
        );

      } finally {
        setGuardando(false);
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
      <Link
        to="/estudiante/asistente-ia"
      >
        ← Volver al asistente
      </Link>

      <h1>
        Crear currículum con IA
      </h1>

      <p>
        PoliCV te guiará paso a paso.
        Tú decides qué información guardar.
      </p>


      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          minHeight: "350px",
          maxHeight: "500px",
          overflowY: "auto",
          marginBottom: "20px"
        }}
      >
        {mensajes.map(
          (item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "18px",

                textAlign:
                  item.role === "user"
                    ? "right"
                    : "left"
              }}
            >
              <strong>
                {item.role === "user"
                  ? "Tú"
                  : "PoliCV IA"}
              </strong>

              <br />

              <div
                style={{
                  display: "inline-block",
                  maxWidth: "75%",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px",
                  marginTop: "5px",
                  textAlign: "left"
                }}
              >
                {item.content}
              </div>
            </div>
          )
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


      {!capturaCompleta && (
        <form
          onSubmit={
            procesarRespuesta
          }
        >
          <input
            type="text"
            value={respuesta}
            onChange={
              (e) =>
                setRespuesta(
                  e.target.value
                )
            }
            placeholder="Escribe tu respuesta..."
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px"
            }}
          />

          <button type="submit">
            Responder
          </button>
        </form>
      )}


      {capturaCompleta && (
        <section
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginTop: "25px"
          }}
        >
          <h2>
            Revisión del currículum
          </h2>

          <p>
            <strong>
              Nombre:
            </strong>{" "}
            {datos.nombre}
          </p>

          <p>
            <strong>
              Perfil:
            </strong>{" "}
            {datos.titulo_profesional}
          </p>

          <p>
            <strong>
              Formación:
            </strong>{" "}
            {datos.formacion[0]?.titulo}
            {" - "}
            {datos.formacion[0]?.institucion}
          </p>

          <p>
            <strong>
              Habilidades:
            </strong>{" "}
            {datos.habilidades
              .map(
                (item) =>
                  item.nombre
              )
              .join(", ")}
          </p>

          <p>
            <strong>
              Idiomas:
            </strong>{" "}
            {datos.idiomas
              .map(
                (item) =>
                  `${item.idioma} (${item.nivel})`
              )
              .join(", ")}
          </p>


          <hr />

          <h3>
            Resumen profesional
          </h3>

          {!datos.resumen_profesional && (
            <button
              type="button"
              onClick={
                generarResumen
              }
              disabled={
                generandoResumen
              }
            >
              {generandoResumen
                ? "Generando con IA..."
                : "Generar resumen con IA"}
            </button>
          )}


          {datos.resumen_profesional && (
            <>
              <textarea
                rows="7"
                value={
                  datos.resumen_profesional
                }
                onChange={
                  (e) =>
                    setDatos(
                      (anterior) => ({
                        ...anterior,

                        resumen_profesional:
                          e.target.value
                      })
                    )
                }
                style={{
                  width: "100%",
                  marginBottom: "15px"
                }}
              />

              <button
                type="button"
                onClick={
                  generarResumen
                }
                disabled={
                  generandoResumen
                }
              >
                Volver a generar
              </button>

              {" "}

              <button
                type="button"
                onClick={
                  crearCurriculum
                }
                disabled={
                  guardando
                }
              >
                {guardando
                  ? "Creando..."
                  : "Confirmar y crear CV"}
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export default StudentAICreateCVPage;