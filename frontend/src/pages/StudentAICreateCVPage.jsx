import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../services/api";

import "../styles/student.css";


const PASOS = [
  {
    clave: "datos_personales",
    titulo: "Datos personales"
  },
  {
    clave: "descripcion",
    titulo: "Descripción profesional"
  },
  {
    clave: "formacion",
    titulo: "Formación académica"
  },
  {
    clave: "idiomas",
    titulo: "Idiomas"
  },
  {
    clave: "habilidades",
    titulo: "Habilidades y debilidades"
  },
  {
    clave: "cursos",
    titulo: "Cursos y certificaciones"
  },
  {
    clave: "proyectos",
    titulo: "Proyectos"
  },
  {
    clave: "practicas",
    titulo: "Prácticas"
  },
  {
    clave: "experiencia",
    titulo: "Experiencia laboral"
  },
  {
    clave: "referencias",
    titulo: "Referencias"
  }
];


function contarPalabras(texto) {
  return texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}


function StudentAICreateCVPage() {

  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS GENERALES
  ========================================================= */

  const [
    nombreCV,
    setNombreCV
  ] = useState("");


  const [
    idCurriculum,
    setIdCurriculum
  ] = useState(null);


  const [
    perfilInicial,
    setPerfilInicial
  ] = useState(null);


  const [
    datosServidor,
    setDatosServidor
  ] = useState(null);


  const [
    paso,
    setPaso
  ] = useState(0);


  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    mensajeExito,
    setMensajeExito
  ] = useState("");


  const [
    sugerenciaIA,
    setSugerenciaIA
  ] = useState(null);


  const [
    mejorandoIA,
    setMejorandoIA
  ] = useState(false);


  /* =========================================================
     CONTENIDO DEL CV
  ========================================================= */

  const [
    contenido,
    setContenido
  ] = useState({
    descripcion: "",

    formacion: {
      institucion:
        "Escuela Politécnica Nacional - ESFOT",

      titulo: "",

      fecha_inicio: "",

      fecha_fin: "",

      en_curso: true,

      descripcion: "",

      ciudad_pais: ""
    },

    idiomas: [],

    habilidades: [],

    cursos: [],

    proyectos: [],

    practicas: [],

    experiencia: [],

    referencias: []
  });


  /* =========================================================
     CARGAR PERFIL INICIAL
  ========================================================= */

  useEffect(() => {

    let activo = true;


    const cargarPerfil = async () => {

      try {

        const response =
          await api.get(
            "/configuracion-inicial"
          );


        if (!activo) {
          return;
        }


        const datos =
          response.data.datos ||
          response.data.perfil ||
          response.data;


        setPerfilInicial(
          datos
        );


      } catch (error) {

        console.error(
          "No se pudo cargar el perfil:",
          error
        );

      }
    };


    cargarPerfil();


    return () => {
      activo = false;
    };

  }, []);


  /* =========================================================
     CREAR CV BASE
  ========================================================= */

  const iniciarCurriculum =
    async (e) => {

      e.preventDefault();


      if (!nombreCV.trim()) {

        setError(
          "Escribe un nombre para tu currículum."
        );

        return;
      }


      setError("");
      setCargando(true);


      try {

        const response =
          await api.post(
            "/ia/curriculums/crear-desde-ia",
            {
              nombre:
                nombreCV.trim(),

              titulo_profesional:
                perfilInicial
                  ?.titulo_profesional ||
                "",

              resumen_profesional:
                ""
            }
          );


        const id =
          response.data.id_curriculum;


        setIdCurriculum(
          id
        );


        await cargarContenido(
          id
        );


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo iniciar el currículum."
        );


      } finally {

        setCargando(false);

      }
    };


  /* =========================================================
     CARGAR ESTRUCTURA + PERFIL + CATÁLOGOS
  ========================================================= */

  const cargarContenido =
    async (id) => {

      const response =
        await api.get(
          `/curriculums/${id}/contenido-fijo`
        );


      const datos =
        response.data.datos ||
        response.data;


      setDatosServidor(
        datos
      );


      const perfil =
        datos.perfil || {};


      const contenidoBD =
        datos.contenido || {};


      setContenido({
        descripcion:
          contenidoBD.descripcion ||
          "",

        formacion:
          contenidoBD.formacion ||
          {
            institucion:
              "Escuela Politécnica Nacional - ESFOT",

            titulo:
              perfil.carrera ||
              perfil.titulo_profesional ||
              "",

            fecha_inicio: "",

            fecha_fin: "",

            en_curso:
              perfil.estado_academico ===
              "cursando",

            descripcion: "",

            ciudad_pais:
              perfil.ciudad_pais ||
              ""
          },

        idiomas:
          contenidoBD.idiomas ||
          [],

        habilidades:
          contenidoBD.habilidades ||
          [],

        cursos:
          contenidoBD.cursos ||
          [],

        proyectos:
          contenidoBD.proyectos ||
          [],

        practicas:
          contenidoBD.practicas ||
          [],

        experiencia:
          contenidoBD.experiencia ||
          [],

        referencias:
          contenidoBD.referencias ||
          []
      });
    };


  /* =========================================================
     GUARDAR SECCIÓN
  ========================================================= */

  const guardarSeccion =
    async (
      clave,
      datos
    ) => {

      await api.put(
        `/curriculums/${idCurriculum}/contenido-fijo/${clave}`,
        {
          datos
        }
      );
    };


  /* =========================================================
     VALIDAR Y CONTINUAR
  ========================================================= */

  const continuar =
    async () => {

      setError("");
      setMensajeExito("");


      const clave =
        PASOS[paso].clave;


      /* DATOS PERSONALES */

      if (
        clave ===
        "datos_personales"
      ) {

        setPaso(
          paso + 1
        );

        return;
      }


      /* DESCRIPCIÓN */

      if (
        clave ===
        "descripcion"
      ) {

        const palabras =
          contarPalabras(
            contenido.descripcion
          );


        if (
          palabras < 40 ||
          palabras > 120
        ) {

          setError(
            "La descripción profesional debe tener entre 40 y 120 palabras."
          );

          return;
        }

      }


      /* FORMACIÓN */

      if (
        clave ===
        "formacion"
      ) {

        if (
          !contenido.formacion
            .fecha_inicio
        ) {

          setError(
            "Indica la fecha de inicio de tus estudios."
          );

          return;
        }


        if (
          !contenido.formacion
            .en_curso &&
          !contenido.formacion
            .fecha_fin
        ) {

          setError(
            "Indica la fecha de finalización."
          );

          return;
        }

      }


      /* IDIOMAS */

      if (
        clave ===
        "idiomas"
      ) {

        const nativos =
          contenido.idiomas
            .filter(
              (item) =>
                Boolean(
                  item.es_nativo
                )
            );


        if (
          nativos.length !== 1
        ) {

          setError(
            "Debes seleccionar exactamente un idioma nativo."
          );

          return;
        }


        if (
          contenido.idiomas.length >
          3
        ) {

          setError(
            "Puedes registrar máximo 3 idiomas incluido el nativo."
          );

          return;
        }

      }


      /* HABILIDADES */

      if (
        clave ===
        "habilidades"
      ) {

        const blandas =
          contenido.habilidades.filter(
            (item) =>
              item.tipo ===
              "blanda"
          );


        const tecnicas =
          contenido.habilidades.filter(
            (item) =>
              item.tipo ===
              "tecnica"
          );


        const metodologicas =
          contenido.habilidades.filter(
            (item) =>
              item.tipo ===
              "metodologica"
          );


        if (
          blandas.length < 1 ||
          blandas.length > 5
        ) {

          setError(
            "Selecciona entre 1 y 5 habilidades blandas."
          );

          return;
        }


        if (
          tecnicas.length < 1 ||
          tecnicas.length > 5
        ) {

          setError(
            "Selecciona entre 1 y 5 habilidades técnicas."
          );

          return;
        }


        if (
          metodologicas.length < 1 ||
          metodologicas.length > 3
        ) {

          setError(
            "Selecciona entre 1 y 3 habilidades metodológicas."
          );

          return;
        }

      }


      setGuardando(true);


      try {

        if (
          clave ===
          "descripcion"
        ) {

          await guardarSeccion(
            clave,
            {
              texto:
                contenido.descripcion
            }
          );

        } else {

          await guardarSeccion(
            clave,
            contenido[clave]
          );

        }


        setMensajeExito(
          "Sección guardada correctamente."
        );


        if (
          paso <
          PASOS.length - 1
        ) {

          setPaso(
            paso + 1
          );

        } else {

          navigate(
            `/estudiante/curriculums/${idCurriculum}`
          );

        }


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo guardar esta sección."
        );


      } finally {

        setGuardando(false);

      }
    };


  /* =========================================================
     RETROCEDER
  ========================================================= */

  const retroceder = () => {

    setError("");
    setMensajeExito("");


    if (paso > 0) {

      setPaso(
        paso - 1
      );

    }
  };


  /* =========================================================
     IA - SOLICITAR MEJORA
  ========================================================= */

  const mejorarTexto =
    async (
      tipo,
      texto,
      contexto
    ) => {

      if (
        !texto ||
        !texto.trim()
      ) {

        setError(
          "Primero escribe un texto para que la IA pueda mejorarlo."
        );

        return;
      }


      setError("");
      setMejorandoIA(true);


      try {

        const response =
          await api.post(
            "/ia/mejorar-texto",
            {
              tipo,
              texto
            }
          );


        setSugerenciaIA({
          original:
            response.data.original ||
            texto,

          sugerencia:
            response.data.sugerencia,

          contexto
        });


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo mejorar el texto con IA."
        );


      } finally {

        setMejorandoIA(false);

      }
    };


  /* =========================================================
     APLICAR SUGERENCIA IA
  ========================================================= */

  const aplicarSugerencia =
    () => {

      if (!sugerenciaIA) {
        return;
      }


      const {
        contexto,
        sugerencia
      } = sugerenciaIA;


      if (
        contexto.seccion ===
        "descripcion"
      ) {

        setContenido(
          (anterior) => ({
            ...anterior,

            descripcion:
              sugerencia
          })
        );

      }


      if (
        contexto.seccion ===
        "formacion"
      ) {

        setContenido(
          (anterior) => ({
            ...anterior,

            formacion: {
              ...anterior.formacion,

              descripcion:
                sugerencia
            }
          })
        );

      }


      if (
        contexto.seccion ===
        "proyectos"
      ) {

        setContenido(
          (anterior) => ({
            ...anterior,

            proyectos:
              anterior.proyectos.map(
                (item, index) =>
                  index ===
                  contexto.index
                    ? {
                        ...item,

                        descripcion:
                          sugerencia
                      }
                    : item
              )
          })
        );

      }


      if (
        contexto.seccion ===
        "practicas"
      ) {

        setContenido(
          (anterior) => ({
            ...anterior,

            practicas:
              anterior.practicas.map(
                (item, index) => {

                  if (
                    index !==
                    contexto.index
                  ) {
                    return item;
                  }


                  return {
                    ...item,

                    [contexto.campo]:
                      sugerencia
                  };
                }
              )
          })
        );

      }


      if (
        contexto.seccion ===
        "experiencia"
      ) {

        setContenido(
          (anterior) => ({
            ...anterior,

            experiencia:
              anterior.experiencia.map(
                (item, index) =>
                  index ===
                  contexto.index
                    ? {
                        ...item,

                        descripcion:
                          sugerencia
                      }
                    : item
              )
          })
        );

      }


      setSugerenciaIA(
        null
      );
    };


  /* =========================================================
     IDIOMAS
  ========================================================= */

  const agregarIdioma =
    () => {

      if (
        contenido.idiomas.length >=
        3
      ) {

        setError(
          "Puedes registrar máximo 3 idiomas."
        );

        return;
      }


      setContenido(
        (anterior) => ({
          ...anterior,

          idiomas: [
            ...anterior.idiomas,
            {
              id_idioma_catalogo:
                "",

              idioma:
                "",

              nivel:
                "Básico",

              es_nativo:
                anterior.idiomas.length ===
                0,

              tiene_certificado:
                false
            }
          ]
        })
      );
    };


  const actualizarIdioma =
    (
      index,
      campo,
      valor
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          idiomas:
            anterior.idiomas.map(
              (item, posicion) => {

                if (
                  posicion !== index
                ) {
                  return item;
                }


                if (
                  campo ===
                  "id_idioma_catalogo"
                ) {

                  const catalogo =
                    datosServidor
                      ?.catalogos
                      ?.idiomas
                      ?.find(
                        (idioma) =>
                          String(
                            idioma.id_idioma_catalogo
                          ) ===
                          String(valor)
                      );


                  return {
                    ...item,

                    id_idioma_catalogo:
                      Number(valor),

                    idioma:
                      catalogo?.nombre ||
                      ""
                  };
                }


                if (
                  campo ===
                  "es_nativo"
                ) {

                  return {
                    ...item,

                    es_nativo:
                      valor,

                    nivel:
                      valor
                        ? "Nativo"
                        : "Básico"
                  };
                }


                return {
                  ...item,

                  [campo]:
                    valor
                };
              }
            )
        })
      );
    };


  const marcarNativo =
    (index) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          idiomas:
            anterior.idiomas.map(
              (item, posicion) => ({
                ...item,

                es_nativo:
                  posicion === index,

                nivel:
                  posicion === index
                    ? "Nativo"
                    : item.nivel ===
                      "Nativo"
                      ? "Básico"
                      : item.nivel
              })
            )
        })
      );
    };


  /* =========================================================
     HABILIDADES
  ========================================================= */

  const seleccionarHabilidad =
    (habilidad) => {

      const existe =
        contenido.habilidades.some(
          (item) =>
            Number(
              item.id_habilidad_catalogo
            ) ===
            Number(
              habilidad.id_habilidad_catalogo
            )
        );


      if (existe) {

        setContenido(
          (anterior) => ({
            ...anterior,

            habilidades:
              anterior.habilidades.filter(
                (item) =>
                  Number(
                    item.id_habilidad_catalogo
                  ) !==
                  Number(
                    habilidad.id_habilidad_catalogo
                  )
              )
          })
        );

        return;
      }


      const seleccionadasTipo =
        contenido.habilidades.filter(
          (item) =>
            item.tipo ===
            habilidad.tipo
        ).length;


      const maximo =
        habilidad.tipo ===
        "metodologica"
          ? 3
          : 5;


      if (
        seleccionadasTipo >=
        maximo
      ) {

        setError(
          `Ya alcanzaste el máximo permitido para habilidades ${habilidad.tipo}.`
        );

        return;
      }


      setError("");


      setContenido(
        (anterior) => ({
          ...anterior,

          habilidades: [
            ...anterior.habilidades,
            {
              id_habilidad_catalogo:
                habilidad.id_habilidad_catalogo,

              nombre:
                habilidad.nombre,

              tipo:
                habilidad.tipo,

              porcentaje:
                50,

              nivel:
                "habilidad"
            }
          ]
        })
      );
    };


  const cambiarPorcentaje =
    (
      idCatalogo,
      porcentaje
    ) => {

      const valor =
        Number(
          porcentaje
        );


      setContenido(
        (anterior) => ({
          ...anterior,

          habilidades:
            anterior.habilidades.map(
              (item) =>
                Number(
                  item.id_habilidad_catalogo
                ) ===
                Number(
                  idCatalogo
                )
                  ? {
                      ...item,

                      porcentaje:
                        valor,

                      nivel:
                        valor < 50
                          ? "debilidad"
                          : "habilidad"
                    }
                  : item
            )
        })
      );
    };


  /* =========================================================
     AGREGAR ELEMENTOS
  ========================================================= */

  const agregarCurso = () => {

    if (
      contenido.cursos.length >=
      5
    ) {
      return;
    }


    setContenido(
      (anterior) => ({
        ...anterior,

        cursos: [
          ...anterior.cursos,
          {
            nombre: "",
            institucion: "",
            fecha_obtencion: "",
            enlace: "",
            tiene_evidencia: false,
            horas_duracion: ""
          }
        ]
      })
    );
  };


  const agregarProyecto = () => {

    if (
      contenido.proyectos.length >=
      3
    ) {
      return;
    }


    setContenido(
      (anterior) => ({
        ...anterior,

        proyectos: [
          ...anterior.proyectos,
          {
            nombre: "",
            descripcion: "",
            tecnologias: "",
            enlace: ""
          }
        ]
      })
    );
  };


  const agregarPractica =
    (tipo) => {

      const cantidad =
        contenido.practicas.filter(
          (item) =>
            item.tipo === tipo
        ).length;


      if (
        tipo ===
          "comunitaria" &&
        cantidad >= 1
      ) {
        return;
      }


      if (
        tipo ===
          "laboral" &&
        cantidad >= 3
      ) {
        return;
      }


      setContenido(
        (anterior) => ({
          ...anterior,

          practicas: [
            ...anterior.practicas,
            {
              tipo,
              institucion: "",
              cargo_area: "",
              fecha_inicio: "",
              fecha_fin: "",
              descripcion: "",
              herramientas: "",
              logro_aprendizaje: ""
            }
          ]
        })
      );
    };


  const agregarExperiencia = () => {

    if (
      contenido.experiencia.length >=
      3
    ) {
      return;
    }


    setContenido(
      (anterior) => ({
        ...anterior,

        experiencia: [
          ...anterior.experiencia,
          {
            empresa: "",
            cargo: "",
            ciudad_pais: "",
            fecha_inicio: "",
            fecha_fin: "",
            actualmente: false,
            descripcion: ""
          }
        ]
      })
    );
  };


  const agregarReferencia = () => {

    if (
      contenido.referencias.length >=
      5
    ) {
      return;
    }


    setContenido(
      (anterior) => ({
        ...anterior,

        referencias: [
          ...anterior.referencias,
          {
            nombre_completo: "",
            cargo: "",
            empresa_institucion: "",
            telefono: "",
            email: ""
          }
        ]
      })
    );
  };


  /* =========================================================
     ACTUALIZAR ARRAY GENÉRICO
  ========================================================= */

  const actualizarItem =
    (
      seccion,
      index,
      campo,
      valor
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          [seccion]:
            anterior[seccion].map(
              (item, posicion) =>
                posicion === index
                  ? {
                      ...item,

                      [campo]:
                        valor
                    }
                  : item
            )
        })
      );
    };


  const eliminarItem =
    (
      seccion,
      index
    ) => {

      setContenido(
        (anterior) => ({
          ...anterior,

          [seccion]:
            anterior[seccion].filter(
              (
                _item,
                posicion
              ) =>
                posicion !== index
            )
        })
      );
    };


  /* =========================================================
     PANTALLA INICIAL
  ========================================================= */

  if (!idCurriculum) {

    return (

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px"
        }}
      >

        <Link
          to="/estudiante/asistente-ia"
        >
          Volver al asistente
        </Link>


        <h1>
          Crear CV desde cero con IA
        </h1>


        <p>
          PoliCV te guiará por las secciones
          de tu currículum. La IA podrá
          corregir ortografía, gramática y
          redacción, pero no inventará
          información.
        </p>


        <form
          onSubmit={
            iniciarCurriculum
          }
        >

          <label>
            Nombre del currículum
          </label>

          <input
            type="text"
            value={
              nombreCV
            }
            onChange={
              (e) =>
                setNombreCV(
                  e.target.value
                )
            }
            placeholder="Ejemplo: CV Desarrollo de Software"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "15px"
            }}
          />


          {error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={
              cargando
            }
          >
            {cargando
              ? "Iniciando..."
              : "Comenzar"}
          </button>

        </form>

      </main>

    );
  }


  const claveActual =
    PASOS[paso].clave;


  const habilidadesCatalogo =
    datosServidor
      ?.catalogos
      ?.habilidades ||
    [];


  /* =========================================================
     INTERFAZ DEL ASISTENTE
  ========================================================= */

  return (

    <main
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "35px"
      }}
    >

      <Link
        to="/estudiante/asistente-ia"
      >
        Volver al asistente
      </Link>


      <div
        style={{
          marginTop: "20px",
          marginBottom: "25px"
        }}
      >

        <span>
          PASO {paso + 1} DE {PASOS.length}
        </span>

        <h1>
          {PASOS[paso].titulo}
        </h1>

        <p>
          Currículum: {nombreCV}
        </p>

      </div>


      {/* =====================================================
          DATOS PERSONALES
      ===================================================== */}

      {claveActual ===
        "datos_personales" && (

        <section>

          <p>
            Estos datos se obtienen de tu
            perfil y no necesitas volver a
            escribirlos.
          </p>


          <p>
            <strong>
              Nombre:
            </strong>{" "}
            {datosServidor?.perfil?.nombres}{" "}
            {datosServidor?.perfil?.apellidos}
          </p>


          <p>
            <strong>
              Correo:
            </strong>{" "}
            {datosServidor?.perfil?.email}
          </p>


          <p>
            <strong>
              Teléfono:
            </strong>{" "}
            {datosServidor?.perfil?.telefono ||
              "No registrado"}
          </p>


          <p>
            <strong>
              Ciudad y país:
            </strong>{" "}
            {datosServidor?.perfil?.ciudad_pais ||
              "No registrado"}
          </p>


          <p>
            <strong>
              Carrera:
            </strong>{" "}
            {datosServidor?.perfil?.carrera}
          </p>

        </section>

      )}


      {/* =====================================================
          DESCRIPCIÓN
      ===================================================== */}

      {claveActual ===
        "descripcion" && (

        <section>

          <p>
            Cuéntame con tus propias palabras
            quién eres profesionalmente, qué
            estudias, qué conocimientos tienes
            y qué buscas destacar.
          </p>


          <textarea
            rows="8"
            value={
              contenido.descripcion
            }
            onChange={
              (e) =>
                setContenido(
                  (anterior) => ({
                    ...anterior,

                    descripcion:
                      e.target.value
                  })
                )
            }
            style={{
              width: "100%"
            }}
          />


          <p>
            {
              contarPalabras(
                contenido.descripcion
              )
            } / 120 palabras
          </p>


          <button
            type="button"
            disabled={
              mejorandoIA
            }
            onClick={
              () =>
                mejorarTexto(
                  "perfil_profesional",
                  contenido.descripcion,
                  {
                    seccion:
                      "descripcion"
                  }
                )
            }
          >
            Mejorar redacción con IA
          </button>

        </section>

      )}


      {/* =====================================================
          FORMACIÓN
      ===================================================== */}

      {claveActual ===
        "formacion" && (

        <section>

          <p>
            La institución y carrera se toman
            de tu perfil. Completa las fechas.
          </p>


          <label>
            Institución
          </label>

          <input
            type="text"
            value={
              contenido.formacion.institucion
            }
            readOnly
          />


          <label>
            Carrera o título
          </label>

          <input
            type="text"
            value={
              contenido.formacion.titulo
            }
            readOnly
          />


          <label>
            Fecha de inicio
          </label>

          <input
            type="date"
            value={
              contenido.formacion.fecha_inicio ||
              ""
            }
            onChange={
              (e) =>
                setContenido(
                  (anterior) => ({
                    ...anterior,

                    formacion: {
                      ...anterior.formacion,

                      fecha_inicio:
                        e.target.value
                    }
                  })
                )
            }
          />


          <label>
            <input
              type="checkbox"
              checked={
                Boolean(
                  contenido.formacion.en_curso
                )
              }
              onChange={
                (e) =>
                  setContenido(
                    (anterior) => ({
                      ...anterior,

                      formacion: {
                        ...anterior.formacion,

                        en_curso:
                          e.target.checked,

                        fecha_fin:
                          e.target.checked
                            ? ""
                            : anterior
                                .formacion
                                .fecha_fin
                      }
                    })
                  )
              }
            />

            Actualmente estoy cursando
          </label>


          {!contenido.formacion
            .en_curso && (

            <>
              <label>
                Fecha de finalización
              </label>

              <input
                type="date"
                value={
                  contenido.formacion
                    .fecha_fin ||
                  ""
                }
                onChange={
                  (e) =>
                    setContenido(
                      (anterior) => ({
                        ...anterior,

                        formacion: {
                          ...anterior
                            .formacion,

                          fecha_fin:
                            e.target.value
                        }
                      })
                    )
                }
              />
            </>

          )}


          <label>
            Ciudad y país
          </label>

          <input
            type="text"
            value={
              contenido.formacion
                .ciudad_pais ||
              ""
            }
            onChange={
              (e) =>
                setContenido(
                  (anterior) => ({
                    ...anterior,

                    formacion: {
                      ...anterior.formacion,

                      ciudad_pais:
                        e.target.value
                    }
                  })
                )
            }
          />


          <label>
            Logros o actividades académicas
          </label>

          <textarea
            rows="5"
            value={
              contenido.formacion
                .descripcion ||
              ""
            }
            onChange={
              (e) =>
                setContenido(
                  (anterior) => ({
                    ...anterior,

                    formacion: {
                      ...anterior.formacion,

                      descripcion:
                        e.target.value
                    }
                  })
                )
            }
          />


          <button
            type="button"
            onClick={
              () =>
                mejorarTexto(
                  "formacion",
                  contenido.formacion
                    .descripcion,
                  {
                    seccion:
                      "formacion"
                  }
                )
            }
          >
            Mejorar redacción con IA
          </button>

        </section>

      )}


      {/* =====================================================
          IDIOMAS
      ===================================================== */}

      {claveActual ===
        "idiomas" && (

        <section>

          <p>
            Selecciona un idioma nativo y,
            opcionalmente, hasta dos idiomas
            adicionales.
          </p>


          {contenido.idiomas.map(
            (
              idioma,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <select
                  value={
                    idioma
                      .id_idioma_catalogo ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarIdioma(
                        index,
                        "id_idioma_catalogo",
                        e.target.value
                      )
                  }
                >

                  <option value="">
                    Selecciona idioma
                  </option>

                  {datosServidor
                    ?.catalogos
                    ?.idiomas
                    ?.map(
                      (item) => (

                        <option
                          key={
                            item.id_idioma_catalogo
                          }
                          value={
                            item.id_idioma_catalogo
                          }
                        >
                          {item.nombre}
                        </option>

                      )
                    )}

                </select>


                <label>

                  <input
                    type="radio"
                    name="idioma_nativo"
                    checked={
                      Boolean(
                        idioma.es_nativo
                      )
                    }
                    onChange={
                      () =>
                        marcarNativo(
                          index
                        )
                    }
                  />

                  Idioma nativo

                </label>


                {!idioma.es_nativo && (

                  <select
                    value={
                      idioma.nivel
                    }
                    onChange={
                      (e) =>
                        actualizarIdioma(
                          index,
                          "nivel",
                          e.target.value
                        )
                    }
                  >

                    <option value="Básico">
                      Básico
                    </option>

                    <option value="Intermedio">
                      Intermedio
                    </option>

                    <option value="Avanzado">
                      Avanzado
                    </option>

                  </select>

                )}


                <label>

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        idioma
                          .tiene_certificado
                      )
                    }
                    onChange={
                      (e) =>
                        actualizarIdioma(
                          index,
                          "tiene_certificado",
                          e.target.checked
                        )
                    }
                  />

                  Tengo certificado o evidencia

                </label>


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "idiomas",
                        index
                      )
                  }
                >
                  Eliminar idioma
                </button>

              </div>

            )
          )}


          {contenido.idiomas.length <
            3 && (

            <button
              type="button"
              onClick={
                agregarIdioma
              }
            >
              Agregar idioma
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          HABILIDADES
      ===================================================== */}

      {claveActual ===
        "habilidades" && (

        <section>

          <p>
            Selecciona las habilidades que
            realmente posees. Las técnicas
            corresponden a tu carrera.
          </p>


          {[
            "blanda",
            "tecnica",
            "metodologica"
          ].map(
            (tipo) => (

              <div key={tipo}>

                <h3>
                  {tipo === "blanda"
                    ? "Habilidades blandas"
                    : tipo === "tecnica"
                      ? "Habilidades técnicas"
                      : "Habilidades metodológicas"}
                </h3>


                {habilidadesCatalogo
                  .filter(
                    (item) =>
                      item.tipo ===
                      tipo
                  )
                  .map(
                    (habilidad) => {

                      const seleccionada =
                        contenido
                          .habilidades
                          .find(
                            (item) =>
                              Number(
                                item
                                  .id_habilidad_catalogo
                              ) ===
                              Number(
                                habilidad
                                  .id_habilidad_catalogo
                              )
                          );


                      return (

                        <div
                          key={
                            habilidad
                              .id_habilidad_catalogo
                          }
                          style={{
                            marginBottom:
                              "12px"
                          }}
                        >

                          <label>

                            <input
                              type="checkbox"
                              checked={
                                Boolean(
                                  seleccionada
                                )
                              }
                              onChange={
                                () =>
                                  seleccionarHabilidad(
                                    habilidad
                                  )
                              }
                            />

                            {habilidad.nombre}

                          </label>


                          {seleccionada && (

                            <div>

                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={
                                  seleccionada
                                    .porcentaje
                                }
                                onChange={
                                  (e) =>
                                    cambiarPorcentaje(
                                      habilidad
                                        .id_habilidad_catalogo,

                                      e.target
                                        .value
                                    )
                                }
                              />


                              <span>
                                {
                                  seleccionada
                                    .porcentaje
                                }%
                                {" - "}
                                {
                                  seleccionada
                                    .porcentaje <
                                  50
                                    ? "Debilidad"
                                    : "Habilidad"
                                }
                              </span>

                            </div>

                          )}

                        </div>

                      );
                    }
                  )}

              </div>

            )
          )}

        </section>

      )}


      {/* =====================================================
          CURSOS
      ===================================================== */}

      {claveActual ===
        "cursos" && (

        <section>

          <p>
            Puedes registrar hasta cinco
            cursos o certificaciones.
          </p>


          {contenido.cursos.map(
            (
              curso,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <input
                  placeholder="Nombre del curso"
                  value={
                    curso.nombre
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "cursos",
                        index,
                        "nombre",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Institución"
                  value={
                    curso.institucion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "cursos",
                        index,
                        "institucion",
                        e.target.value
                      )
                  }
                />


                <input
                  type="date"
                  value={
                    curso.fecha_obtencion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "cursos",
                        index,
                        "fecha_obtencion",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Enlace de credencial"
                  value={
                    curso.enlace ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "cursos",
                        index,
                        "enlace",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Horas de duración"
                  value={
                    curso.horas_duracion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "cursos",
                        index,
                        "horas_duracion",
                        e.target.value
                      )
                  }
                />


                <label>

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        curso.tiene_evidencia
                      )
                    }
                    onChange={
                      (e) =>
                        actualizarItem(
                          "cursos",
                          index,
                          "tiene_evidencia",
                          e.target.checked
                        )
                    }
                  />

                  Tengo evidencia

                </label>


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "cursos",
                        index
                      )
                  }
                >
                  Eliminar
                </button>

              </div>

            )
          )}


          {contenido.cursos.length <
            5 && (

            <button
              type="button"
              onClick={
                agregarCurso
              }
            >
              Agregar curso o certificación
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          PROYECTOS
      ===================================================== */}

      {claveActual ===
        "proyectos" && (

        <section>

          <p>
            Puedes registrar hasta tres
            proyectos principales.
          </p>


          {contenido.proyectos.map(
            (
              proyecto,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <input
                  placeholder="Nombre del proyecto"
                  value={
                    proyecto.nombre
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "proyectos",
                        index,
                        "nombre",
                        e.target.value
                      )
                  }
                />


                <textarea
                  rows="5"
                  placeholder="Descripción e impacto"
                  value={
                    proyecto.descripcion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "proyectos",
                        index,
                        "descripcion",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      mejorarTexto(
                        "proyecto",
                        proyecto.descripcion,
                        {
                          seccion:
                            "proyectos",

                          index
                        }
                      )
                  }
                >
                  Mejorar descripción con IA
                </button>


                <input
                  placeholder="Tecnologías o herramientas"
                  value={
                    proyecto.tecnologias ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "proyectos",
                        index,
                        "tecnologias",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Enlace o evidencia"
                  value={
                    proyecto.enlace ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "proyectos",
                        index,
                        "enlace",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "proyectos",
                        index
                      )
                  }
                >
                  Eliminar proyecto
                </button>

              </div>

            )
          )}


          {contenido.proyectos.length <
            3 && (

            <button
              type="button"
              onClick={
                agregarProyecto
              }
            >
              Agregar proyecto
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          PRÁCTICAS
      ===================================================== */}

      {claveActual ===
        "practicas" && (

        <section>

          <p>
            Puedes registrar una práctica
            comunitaria y hasta tres prácticas
            laborales.
          </p>


          {contenido.practicas.map(
            (
              practica,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <h3>
                  {practica.tipo ===
                  "comunitaria"
                    ? "Práctica comunitaria"
                    : "Práctica laboral"}
                </h3>


                <input
                  placeholder="Institución"
                  value={
                    practica.institucion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "institucion",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Cargo o área"
                  value={
                    practica.cargo_area ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "cargo_area",
                        e.target.value
                      )
                  }
                />


                <input
                  type="date"
                  value={
                    practica.fecha_inicio ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "fecha_inicio",
                        e.target.value
                      )
                  }
                />


                <input
                  type="date"
                  value={
                    practica.fecha_fin ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "fecha_fin",
                        e.target.value
                      )
                  }
                />


                <textarea
                  rows="4"
                  placeholder="Descripción"
                  value={
                    practica.descripcion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "descripcion",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      mejorarTexto(
                        "practica",
                        practica.descripcion,
                        {
                          seccion:
                            "practicas",

                          index,

                          campo:
                            "descripcion"
                        }
                      )
                  }
                >
                  Mejorar descripción con IA
                </button>


                <input
                  placeholder="Herramientas utilizadas"
                  value={
                    practica.herramientas ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "herramientas",
                        e.target.value
                      )
                  }
                />


                <textarea
                  rows="4"
                  placeholder="Logros o aprendizajes"
                  value={
                    practica
                      .logro_aprendizaje ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "practicas",
                        index,
                        "logro_aprendizaje",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      mejorarTexto(
                        "logro_practica",
                        practica
                          .logro_aprendizaje,
                        {
                          seccion:
                            "practicas",

                          index,

                          campo:
                            "logro_aprendizaje"
                        }
                      )
                  }
                >
                  Mejorar logro con IA
                </button>


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "practicas",
                        index
                      )
                  }
                >
                  Eliminar práctica
                </button>

              </div>

            )
          )}


          {contenido.practicas.filter(
            (item) =>
              item.tipo ===
              "comunitaria"
          ).length < 1 && (

            <button
              type="button"
              onClick={
                () =>
                  agregarPractica(
                    "comunitaria"
                  )
              }
            >
              Agregar práctica comunitaria
            </button>

          )}


          {" "}


          {contenido.practicas.filter(
            (item) =>
              item.tipo ===
              "laboral"
          ).length < 3 && (

            <button
              type="button"
              onClick={
                () =>
                  agregarPractica(
                    "laboral"
                  )
              }
            >
              Agregar práctica laboral
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          EXPERIENCIA
      ===================================================== */}

      {claveActual ===
        "experiencia" && (

        <section>

          <p>
            Puedes registrar hasta tres
            experiencias laborales.
          </p>


          {contenido.experiencia.map(
            (
              experiencia,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <input
                  placeholder="Empresa o institución"
                  value={
                    experiencia.empresa ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "experiencia",
                        index,
                        "empresa",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Cargo"
                  value={
                    experiencia.cargo ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "experiencia",
                        index,
                        "cargo",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Ciudad y país"
                  value={
                    experiencia.ciudad_pais ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "experiencia",
                        index,
                        "ciudad_pais",
                        e.target.value
                      )
                  }
                />


                <input
                  type="date"
                  value={
                    experiencia.fecha_inicio ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "experiencia",
                        index,
                        "fecha_inicio",
                        e.target.value
                      )
                  }
                />


                <label>

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        experiencia.actualmente
                      )
                    }
                    onChange={
                      (e) =>
                        actualizarItem(
                          "experiencia",
                          index,
                          "actualmente",
                          e.target.checked
                        )
                    }
                  />

                  Actualmente trabajo aquí

                </label>


                {!experiencia.actualmente && (

                  <input
                    type="date"
                    value={
                      experiencia.fecha_fin ||
                      ""
                    }
                    onChange={
                      (e) =>
                        actualizarItem(
                          "experiencia",
                          index,
                          "fecha_fin",
                          e.target.value
                        )
                    }
                  />

                )}


                <textarea
                  rows="5"
                  placeholder="Funciones y logros"
                  value={
                    experiencia.descripcion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "experiencia",
                        index,
                        "descripcion",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      mejorarTexto(
                        "experiencia",
                        experiencia.descripcion,
                        {
                          seccion:
                            "experiencia",

                          index
                        }
                      )
                  }
                >
                  Mejorar redacción con IA
                </button>


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "experiencia",
                        index
                      )
                  }
                >
                  Eliminar experiencia
                </button>

              </div>

            )
          )}


          {contenido.experiencia.length <
            3 && (

            <button
              type="button"
              onClick={
                agregarExperiencia
              }
            >
              Agregar experiencia
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          REFERENCIAS
      ===================================================== */}

      {claveActual ===
        "referencias" && (

        <section>

          <p>
            Puedes registrar hasta cinco
            referencias profesionales.
          </p>


          {contenido.referencias.map(
            (
              referencia,
              index
            ) => (

              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px"
                }}
              >

                <input
                  placeholder="Nombre completo"
                  value={
                    referencia.nombre_completo ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "referencias",
                        index,
                        "nombre_completo",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Cargo"
                  value={
                    referencia.cargo ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "referencias",
                        index,
                        "cargo",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Empresa o institución"
                  value={
                    referencia.empresa_institucion ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "referencias",
                        index,
                        "empresa_institucion",
                        e.target.value
                      )
                  }
                />


                <input
                  placeholder="Teléfono"
                  value={
                    referencia.telefono ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "referencias",
                        index,
                        "telefono",
                        e.target.value
                      )
                  }
                />


                <input
                  type="email"
                  placeholder="Correo profesional"
                  value={
                    referencia.email ||
                    ""
                  }
                  onChange={
                    (e) =>
                      actualizarItem(
                        "referencias",
                        index,
                        "email",
                        e.target.value
                      )
                  }
                />


                <button
                  type="button"
                  onClick={
                    () =>
                      eliminarItem(
                        "referencias",
                        index
                      )
                  }
                >
                  Eliminar referencia
                </button>

              </div>

            )
          )}


          {contenido.referencias.length <
            5 && (

            <button
              type="button"
              onClick={
                agregarReferencia
              }
            >
              Agregar referencia
            </button>

          )}

        </section>

      )}


      {/* =====================================================
          SUGERENCIA IA
      ===================================================== */}

      {sugerenciaIA && (

        <section
          style={{
            border:
              "1px solid #b8d9cf",
            padding: "20px",
            marginTop: "25px"
          }}
        >

          <h3>
            Sugerencia de PoliCV
          </h3>


          <strong>
            Texto original
          </strong>

          <p>
            {sugerenciaIA.original}
          </p>


          <strong>
            Texto mejorado
          </strong>

          <p>
            {sugerenciaIA.sugerencia}
          </p>


          <button
            type="button"
            onClick={
              aplicarSugerencia
            }
          >
            Aplicar sugerencia
          </button>


          {" "}


          <button
            type="button"
            onClick={
              () =>
                setSugerenciaIA(
                  null
                )
            }
          >
            Conservar original
          </button>

        </section>

      )}


      {/* =====================================================
          MENSAJES
      ===================================================== */}

      {error && (

        <p
          style={{
            color: "red",
            marginTop: "20px"
          }}
        >
          {error}
        </p>

      )}


      {mensajeExito && (

        <p
          style={{
            marginTop: "20px"
          }}
        >
          {mensajeExito}
        </p>

      )}


      {/* =====================================================
          NAVEGACIÓN
      ===================================================== */}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "10px"
        }}
      >

        {paso > 0 && (

          <button
            type="button"
            onClick={
              retroceder
            }
            disabled={
              guardando
            }
          >
            Anterior
          </button>

        )}


        <button
          type="button"
          onClick={
            continuar
          }
          disabled={
            guardando
          }
        >

          {guardando
            ? "Guardando..."
            : paso ===
              PASOS.length - 1
              ? "Finalizar currículum"
              : "Guardar y continuar"}

        </button>

      </div>


    </main>

  );
}


export default StudentAICreateCVPage;