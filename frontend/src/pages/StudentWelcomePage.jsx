import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import api from "../services/api";


function StudentWelcomePage() {
  const navigate =
    useNavigate();


  /* =========================================================
     ESTADOS
  ========================================================= */

  const [
    paso,
    setPaso
  ] = useState(1);


  const [
    carreras,
    setCarreras
  ] = useState([]);


  const [
    form,
    setForm
  ] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    ciudad_pais: "",

    id_carrera: "",
    estado_academico: "",

    titulo_profesional: "",
    fotografia_url: "",
    linkedin_url: "",
    github_url: ""
  });


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    guardando,
    setGuardando
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  /* =========================================================
     CARGA INICIAL
  ========================================================= */

  useEffect(() => {
    let activo = true;


    const cargarDatos =
      async () => {
        try {
          const [
            responsePerfil,
            responseCarreras
          ] =
            await Promise.all([
              api.get(
                "/configuracion-inicial"
              ),

              api.get(
                "/configuracion-inicial/carreras"
              )
            ]);


          if (!activo) {
            return;
          }


          const perfil =
            responsePerfil.data
              ?.perfil;


          if (
            perfil?.perfil_completado
          ) {
            navigate(
              "/estudiante",
              {
                replace: true
              }
            );

            return;
          }


          setCarreras(
            responseCarreras.data
              ?.carreras ||
            []
          );


          setForm({
            nombres:
              perfil?.nombres || "",

            apellidos:
              perfil?.apellidos || "",

            email:
              perfil?.email || "",

            telefono:
              perfil?.telefono || "",

            ciudad_pais:
              perfil?.ciudad_pais || "",

            id_carrera:
              perfil?.id_carrera || "",

            estado_academico:
              perfil?.estado_academico || "",

            titulo_profesional:
              perfil?.titulo_profesional || "",

            fotografia_url:
              perfil?.fotografia_url || "",

            linkedin_url:
              perfil?.linkedin_url || "",

            github_url:
              perfil?.github_url || ""
          });


        } catch (error) {
          if (!activo) {
            return;
          }


          setError(
            error.response?.data
              ?.mensaje ||

            "No se pudo cargar la configuración inicial"
          );


        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      };


    cargarDatos();


    return () => {
      activo = false;
    };

  }, [navigate]);


  /* =========================================================
     CAMBIO DE CAMPOS
  ========================================================= */

  const handleChange =
    (e) => {
      const {
        name,
        value
      } = e.target;


      setForm(
        (anterior) => ({
          ...anterior,

          [name]:
            value
        })
      );


      setError("");
    };


  /* =========================================================
     CARRERA SELECCIONADA
  ========================================================= */

  const carreraSeleccionada =
    useMemo(
      () =>
        carreras.find(
          (carrera) =>
            String(
              carrera.id_carrera
            ) ===
            String(
              form.id_carrera
            )
        ) || null,

      [
        carreras,
        form.id_carrera
      ]
    );


  /* =========================================================
     SUGERIR TÍTULO
  ========================================================= */

  const sugerirTitulo =
    () => {
      if (
        !carreraSeleccionada
      ) {
        return;
      }


      let nombreCarrera =
        carreraSeleccionada.nombre;


      nombreCarrera =
        nombreCarrera.replace(
          "Tecnología Superior en ",
          ""
        );


      const sugerencia =
        form.estado_academico ===
        "graduado"
          ? `Tecnólogo/a Superior en ${nombreCarrera}`
          : `Estudiante de Tecnología Superior en ${nombreCarrera}`;


      setForm(
        (anterior) => ({
          ...anterior,

          titulo_profesional:
            sugerencia
        })
      );
    };


  /* =========================================================
     VALIDAR PASO 1
  ========================================================= */

  const validarPaso1 =
    () => {
      if (
        !form.nombres.trim() ||
        !form.apellidos.trim() ||
        !form.telefono.trim() ||
        !form.ciudad_pais.trim()
      ) {
        setError(
          "Completa todos los datos obligatorios de identidad"
        );

        return false;
      }


      if (
        form.telefono.trim()
          .length < 7
      ) {
        setError(
          "Ingresa un número de teléfono válido"
        );

        return false;
      }


      return true;
    };


  /* =========================================================
     VALIDAR PASO 2
  ========================================================= */

  const validarPaso2 =
    () => {
      if (
        !form.id_carrera ||
        !form.estado_academico
      ) {
        setError(
          "Selecciona tu carrera y estado académico"
        );

        return false;
      }


      return true;
    };


  /* =========================================================
     VALIDAR PASO 3
  ========================================================= */

  const validarPaso3 =
    () => {
      if (
        !form.titulo_profesional
          .trim()
      ) {
        setError(
          "Ingresa tu título o perfil profesional"
        );

        return false;
      }


      return true;
    };


  /* =========================================================
     SIGUIENTE
  ========================================================= */

  const siguiente =
    () => {
      setError("");


      if (
        paso === 1 &&
        !validarPaso1()
      ) {
        return;
      }


      if (
        paso === 2 &&
        !validarPaso2()
      ) {
        return;
      }


      setPaso(
        (actual) =>
          Math.min(
            actual + 1,
            3
          )
      );
    };


  /* =========================================================
     ANTERIOR
  ========================================================= */

  const anterior =
    () => {
      setError("");


      setPaso(
        (actual) =>
          Math.max(
            actual - 1,
            1
          )
      );
    };


  /* =========================================================
     FINALIZAR
  ========================================================= */

  const finalizar =
    async (
      e
    ) => {
      e.preventDefault();


      if (
        !validarPaso3()
      ) {
        return;
      }


      setGuardando(true);

      setError("");


      try {
        const response =
          await api.put(
            "/configuracion-inicial",
            {
              nombres:
                form.nombres,

              apellidos:
                form.apellidos,

              telefono:
                form.telefono,

              ciudad_pais:
                form.ciudad_pais,

              id_carrera:
                Number(
                  form.id_carrera
                ),

              estado_academico:
                form.estado_academico,

              titulo_profesional:
                form.titulo_profesional,

              fotografia_url:
                form.fotografia_url,

              linkedin_url:
                form.linkedin_url,

              github_url:
                form.github_url
            }
          );


        /* ===================================================
           ACTUALIZAR USUARIO EN STORAGE
        =================================================== */

        const usuarioGuardado =
          localStorage.getItem(
            "usuario"
          ) ||
          sessionStorage.getItem(
            "usuario"
          );


        if (
          usuarioGuardado
        ) {
          const usuario =
            JSON.parse(
              usuarioGuardado
            );


          const usuarioActualizado = {
            ...usuario,

            perfil_completado:
              true,

            id_carrera:
              Number(
                form.id_carrera
              ),

            carrera:
              response.data
                ?.perfil
                ?.carrera,

            estado_academico:
              form.estado_academico
          };


          if (
            localStorage.getItem(
              "usuario"
            )
          ) {
            localStorage.setItem(
              "usuario",
              JSON.stringify(
                usuarioActualizado
              )
            );

          } else {
            sessionStorage.setItem(
              "usuario",
              JSON.stringify(
                usuarioActualizado
              )
            );
          }
        }


        navigate(
          "/estudiante",
          {
            replace: true
          }
        );


      } catch (error) {
        setError(
          error.response?.data
            ?.mensaje ||

          "No se pudo completar la configuración"
        );


      } finally {
        setGuardando(false);
      }
    };


  /* =========================================================
     CARGANDO
  ========================================================= */

  if (cargando) {
    return (
      <main
        style={{
          padding:
            "40px"
        }}
      >
        Cargando...
      </main>
    );
  }


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <main
      style={{
        maxWidth:
          "760px",

        minHeight:
          "100vh",

        margin:
          "0 auto",

        padding:
          "40px 30px"
      }}
    >

      {/* =====================================================
          PROGRESO
      ===================================================== */}

      <div
        style={{
          textAlign:
            "center",

          marginBottom:
            "40px"
        }}
      >

        <small>
          Paso {paso} de 3
        </small>


        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            gap:
              "15px",

            marginTop:
              "20px"
          }}
        >

          {[1, 2, 3].map(
            (numero) => (
              <div
                key={
                  numero
                }
                style={{
                  width:
                    "38px",

                  height:
                    "38px",

                  borderRadius:
                    "50%",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  background:
                    paso >= numero
                      ? "#67ad96"
                      : "#e9efed",

                  color:
                    paso >= numero
                      ? "#ffffff"
                      : "#8b9995",

                  fontWeight:
                    "bold"
                }}
              >
                {paso > numero
                  ? "✓"
                  : numero}
              </div>
            )
          )}

        </div>


        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            gap:
              "35px",

            marginTop:
              "8px",

            fontSize:
              "12px"
          }}
        >
          <span>
            Identidad
          </span>

          <span>
            Formación
          </span>

          <span>
            Perfil
          </span>
        </div>

      </div>


      {/* =====================================================
          PASO 1
      ===================================================== */}

      {paso === 1 && (

        <section>

          <div
            style={{
              textAlign:
                "center",

              marginBottom:
                "35px"
            }}
          >

            <h1>
              Cuéntanos sobre ti
            </h1>

            <p>
              Completa tus datos principales para
              configurar tu perfil profesional.
            </p>

          </div>


          <div>

            <label>
              Nombres *
            </label>

            <input
              type="text"
              name="nombres"
              value={
                form.nombres
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          <br />


          <div>

            <label>
              Apellidos *
            </label>

            <input
              type="text"
              name="apellidos"
              value={
                form.apellidos
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          <br />


          <div>

            <label>
              Correo institucional
            </label>

            <input
              type="email"
              value={
                form.email
              }
              disabled
            />

          </div>


          <br />


          <div>

            <label>
              Teléfono *
            </label>

            <input
              type="text"
              name="telefono"
              value={
                form.telefono
              }
              onChange={
                handleChange
              }
              placeholder="Ejemplo: 0991234567"
              required
            />

          </div>


          <br />


          <div>

            <label>
              Ciudad y país *
            </label>

            <input
              type="text"
              name="ciudad_pais"
              value={
                form.ciudad_pais
              }
              onChange={
                handleChange
              }
              placeholder="Quito, Ecuador"
              required
            />

          </div>


          <br />


          <div>

            <label>
              Fotografía
            </label>

            <input
              type="url"
              name="fotografia_url"
              value={
                form.fotografia_url
              }
              onChange={
                handleChange
              }
              placeholder="Opcional"
            />

            <small>
              La fotografía es opcional.
            </small>

          </div>

        </section>

      )}


      {/* =====================================================
          PASO 2
      ===================================================== */}

      {paso === 2 && (

        <section>

          <div
            style={{
              textAlign:
                "center",

              marginBottom:
                "35px"
            }}
          >

            <h1>
              Tu formación en la ESFOT
            </h1>

            <p>
              Tu carrera determinará las
              habilidades técnicas y opciones
              disponibles dentro de PoliCV.
            </p>

          </div>


          <div>

            <label>
              Institución
            </label>

            <input
              type="text"
              value="Escuela Politécnica Nacional - ESFOT"
              disabled
            />

          </div>


          <br />


          <div>

            <label>
              Carrera *
            </label>

            <select
              name="id_carrera"
              value={
                form.id_carrera
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Selecciona tu carrera
              </option>


              {carreras.map(
                (carrera) => (

                  <option
                    key={
                      carrera.id_carrera
                    }
                    value={
                      carrera.id_carrera
                    }
                  >
                    {carrera.nombre}
                  </option>

                )
              )}

            </select>

          </div>


          <br />


          <div>

            <label>
              Estado académico *
            </label>

            <select
              name="estado_academico"
              value={
                form.estado_academico
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Selecciona una opción
              </option>

              <option value="cursando">
                Actualmente cursando
              </option>

              <option value="graduado">
                Graduado
              </option>

            </select>

          </div>


          {carreraSeleccionada && (

            <div
              style={{
                marginTop:
                  "25px",

                padding:
                  "15px",

                background:
                  "#f3f8f6"
              }}
            >

              <strong>
                Carrera seleccionada
              </strong>

              <p>
                {
                  carreraSeleccionada
                    .nombre
                }
              </p>

              <small>
                PoliCV utilizará esta carrera
                para mostrarte las habilidades
                técnicas correspondientes.
              </small>

            </div>

          )}

        </section>

      )}


      {/* =====================================================
          PASO 3
      ===================================================== */}

      {paso === 3 && (

        <section>

          <div
            style={{
              textAlign:
                "center",

              marginBottom:
                "35px"
            }}
          >

            <h1>
              Tu perfil profesional
            </h1>

            <p>
              Define cómo quieres presentarte
              profesionalmente en tu currículum.
            </p>

          </div>


          <div>

            <label>
              Título o perfil profesional *
            </label>

            <input
              type="text"
              name="titulo_profesional"
              value={
                form.titulo_profesional
              }
              onChange={
                handleChange
              }
              placeholder="Ejemplo: Estudiante de Desarrollo de Software"
              required
            />


            {carreraSeleccionada && (

              <button
                type="button"
                onClick={
                  sugerirTitulo
                }
                style={{
                  marginTop:
                    "8px"
                }}
              >
                Usar título sugerido
              </button>

            )}

          </div>


          <br />


          <div>

            <label>
              LinkedIn
            </label>

            <input
              type="url"
              name="linkedin_url"
              value={
                form.linkedin_url
              }
              onChange={
                handleChange
              }
              placeholder="https://linkedin.com/in/..."
            />

            <small>
              Opcional
            </small>

          </div>


          <br />


          <div>

            <label>
              GitHub
            </label>

            <input
              type="url"
              name="github_url"
              value={
                form.github_url
              }
              onChange={
                handleChange
              }
              placeholder="https://github.com/..."
            />

            <small>
              Opcional
            </small>

          </div>


          <div
            style={{
              marginTop:
                "30px",

              padding:
                "18px",

              background:
                "#f5f9f7"
            }}
          >

            <strong>
              Tu configuración
            </strong>


            <p>
              {
                form.nombres
              }
              {" "}
              {
                form.apellidos
              }
            </p>


            <p>
              {
                carreraSeleccionada
                  ?.nombre
              }
            </p>


            <p>
              {form.estado_academico ===
              "graduado"
                ? "Graduado"
                : "Actualmente cursando"}
            </p>


            <p>
              {
                form.titulo_profesional ||
                "Título profesional pendiente"
              }
            </p>

          </div>

        </section>

      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <p
          style={{
            marginTop:
              "25px",

            color:
              "#a64242"
          }}
        >
          {error}
        </p>

      )}


      {/* =====================================================
          NAVEGACIÓN
      ===================================================== */}

      <div
        style={{
          marginTop:
            "40px",

          paddingTop:
            "20px",

          display:
            "flex",

          justifyContent:
            paso === 1
              ? "flex-end"
              : "space-between",

          borderTop:
            "1px solid #eeeeee"
        }}
      >

        {paso > 1 && (

          <button
            type="button"
            onClick={
              anterior
            }
          >
            Anterior
          </button>

        )}


        {paso < 3 && (

          <button
            type="button"
            onClick={
              siguiente
            }
          >
            Siguiente
          </button>

        )}


        {paso === 3 && (

          <button
            type="button"
            onClick={
              finalizar
            }
            disabled={
              guardando
            }
          >

            {guardando
              ? "Guardando..."
              : "Finalizar configuración"}

          </button>

        )}

      </div>

    </main>
  );
}


export default StudentWelcomePage;