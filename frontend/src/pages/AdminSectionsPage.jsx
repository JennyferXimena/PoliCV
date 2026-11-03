import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import api from "../services/api";
import "../styles/admin.css";


function AdminSectionsPage() {

  const [
    secciones,
    setSecciones
  ] = useState([]);


  const [
    carreras,
    setCarreras
  ] = useState([]);


  const [
    carreraSeleccionada,
    setCarreraSeleccionada
  ] = useState("");


  const [
    estadisticas,
    setEstadisticas
  ] = useState(null);


  const [
    seccionAbierta,
    setSeccionAbierta
  ] = useState(null);


  const [
    arrastrando,
    setArrastrando
  ] = useState(null);


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    guardandoOrden,
    setGuardandoOrden
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    mensaje,
    setMensaje
  ] = useState("");


  useEffect(() => {

    let activo = true;


    const cargarInicial =
      async () => {

        try {

          const [
            responseSecciones,
            responseCarreras
          ] =
            await Promise.all([
              api.get(
                "/admin/secciones"
              ),

              api.get(
                "/admin/secciones/carreras"
              )
            ]);


          if (!activo) {
            return;
          }


          setSecciones(
            responseSecciones
              .data
              ?.secciones ||
            []
          );


          setCarreras(
            responseCarreras
              .data
              ?.carreras ||
            []
          );


        } catch (error) {

          if (!activo) {
            return;
          }


          setError(
            error.response
              ?.data
              ?.mensaje ||

            "No se pudo cargar la configuración de las secciones"
          );


        } finally {

          if (activo) {
            setCargando(false);
          }

        }

      };


    cargarInicial();


    return () => {
      activo = false;
    };

  }, []);


  const abrirSeccion =
    (idSeccion) => {

      setSeccionAbierta(
        (actual) =>
          actual === idSeccion
            ? null
            : idSeccion
      );

    };


  /* ================================================
     ARRASTRAR
  ================================================ */

  const iniciarArrastre =
    (idSeccion) => {

      setArrastrando(
        idSeccion
      );

    };


  const permitirSoltar =
    (e) => {

      e.preventDefault();

    };


  const soltarSeccion =
    (
      idDestino
    ) => {

      if (
        arrastrando === null ||
        arrastrando === idDestino
      ) {
        return;
      }


      setSecciones(
        (actuales) => {

          const nuevaLista =
            [...actuales];


          const indiceOrigen =
            nuevaLista.findIndex(
              (item) =>
                item.id_seccion ===
                arrastrando
            );


          const indiceDestino =
            nuevaLista.findIndex(
              (item) =>
                item.id_seccion ===
                idDestino
            );


          if (
            indiceOrigen === -1 ||
            indiceDestino === -1
          ) {
            return actuales;
          }


          const [
            elemento
          ] =
            nuevaLista.splice(
              indiceOrigen,
              1
            );


          nuevaLista.splice(
            indiceDestino,
            0,
            elemento
          );


          return nuevaLista.map(
            (
              item,
              index
            ) => ({
              ...item,
              orden:
                index + 1
            })
          );

        }
      );


      setArrastrando(
        null
      );

    };


  const guardarOrden =
    async () => {

      setError("");

      setMensaje("");

      setGuardandoOrden(
        true
      );


      try {

        const orden =
          secciones.map(
            (item) =>
              item.id_seccion
          );


        const response =
          await api.put(
            "/admin/secciones/orden",
            {
              orden
            }
          );


        setSecciones(
          response.data
            ?.secciones ||
          secciones
        );


        setMensaje(
          "Orden guardado correctamente"
        );


      } catch (error) {

        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudo guardar el orden"
        );


      } finally {

        setGuardandoOrden(
          false
        );

      }

    };


  /* ================================================
     ESTADÍSTICAS
  ================================================ */

  const verEstadisticas =
    async () => {

      if (
        !carreraSeleccionada
      ) {

        setError(
          "Selecciona una carrera"
        );

        return;

      }


      setError("");

      setEstadisticas(
        null
      );


      try {

        const response =
          await api.get(
            `/admin/secciones/estadisticas?carrera=${carreraSeleccionada}`
          );


        setEstadisticas(
          response.data
        );


      } catch (error) {

        setError(
          error.response
            ?.data
            ?.mensaje ||

          "No se pudieron consultar las estadísticas"
        );

      }

    };


  const obtenerMayorUso =
    () => {

      if (
        !estadisticas
          ?.secciones
          ?.length
      ) {
        return null;
      }


      return [
        ...estadisticas.secciones
      ].sort(
        (a, b) =>
          b.porcentaje -
          a.porcentaje
      )[0];

    };


  const obtenerMenorUso =
    () => {

      if (
        !estadisticas
          ?.secciones
          ?.length
      ) {
        return null;
      }


      return [
        ...estadisticas.secciones
      ].sort(
        (a, b) =>
          a.porcentaje -
          b.porcentaje
      )[0];

    };


  const mayorUso =
    obtenerMayorUso();


  const menorUso =
    obtenerMenorUso();


  if (cargando) {

    return (
      <main className="admin-content">
        Cargando secciones...
      </main>
    );

  }


  return (

    <main className="admin-content">


      <section className="sections-heading">

        <div>

          <span className="sections-label">
            CONFIGURACIÓN DEL CURRÍCULUM
          </span>

          <h2>
            Secciones del currículum
          </h2>

          <p>
            Las secciones, subsecciones y
            campos son predeterminados y
            permanentes. Puedes consultar
            su estructura y modificar
            únicamente el orden.
          </p>

        </div>


        <div className="sections-counter">

          <span>
            Secciones
          </span>

          <strong>
            {secciones.length}
          </strong>

        </div>

      </section>


      {error && (
        <p className="users-message error">
          {error}
        </p>
      )}


      {mensaje && (
        <p className="users-message success">
          {mensaje}
        </p>
      )}


      <section className="sections-table-card">


        <div className="sections-table-header">

          <div>

            <span>
              ESTRUCTURA PREDETERMINADA
            </span>

            <h3>
              Secciones disponibles
            </h3>

          </div>


          <button
            type="button"
            className="sections-btn-primary"
            onClick={guardarOrden}
            disabled={guardandoOrden}
          >
            {guardandoOrden
              ? "Guardando..."
              : "Guardar orden"}
          </button>

        </div>


        <div>

          {secciones.map(
            (
              seccion,
              index
            ) => (

              <article
                key={
                  seccion.id_seccion
                }
                draggable
                onDragStart={() =>
                  iniciarArrastre(
                    seccion.id_seccion
                  )
                }
                onDragOver={
                  permitirSoltar
                }
                onDrop={() =>
                  soltarSeccion(
                    seccion.id_seccion
                  )
                }
                style={{
                  padding:
                    "18px 22px",

                  borderBottom:
                    "1px solid #e4eeee",

                  background:
                    arrastrando ===
                    seccion.id_seccion
                      ? "#eef9f8"
                      : "#ffffff",

                  cursor:
                    "grab"
                }}
              >


                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "16px"
                  }}
                >

                  <strong
                    style={{
                      minWidth:
                        "30px"
                    }}
                  >
                    {index + 1}
                  </strong>


                  <div
                    style={{
                      flex:
                        1
                    }}
                  >

                    <strong>
                      {seccion.nombre}
                    </strong>

                    <p>
                      {seccion.descripcion}
                    </p>

                  </div>


                  <button
                    type="button"
                    className="section-edit-btn"
                    onClick={() =>
                      abrirSeccion(
                        seccion.id_seccion
                      )
                    }
                  >
                    {seccionAbierta ===
                    seccion.id_seccion
                      ? "Ocultar"
                      : "Ver estructura"}
                  </button>

                </div>


                {seccionAbierta ===
                  seccion.id_seccion && (

                  <div
                    style={{
                      marginTop:
                        "18px",

                      paddingTop:
                        "18px",

                      borderTop:
                        "1px solid #edf3f3"
                    }}
                  >


                    {seccion.campos
                      ?.length > 0 && (

                      <div>

                        <strong>
                          Campos
                        </strong>

                        {seccion.campos.map(
                          (campo) => (

                            <p
                              key={
                                campo.id_campo
                              }
                            >
                              • {campo.nombre}

                              {campo.obligatorio
                                ? " — Obligatorio"
                                : " — Opcional"}

                              {campo.minimo !==
                                null &&
                                campo.maximo !==
                                null
                                ? ` — ${campo.minimo} a ${campo.maximo}`
                                : ""}
                            </p>

                          )
                        )}

                      </div>

                    )}


                    {seccion.subsecciones
                      ?.map(
                        (subseccion) => (

                          <div
                            key={
                              subseccion.id_subseccion
                            }
                            style={{
                              marginTop:
                                "15px"
                            }}
                          >

                            <strong>
                              {
                                subseccion.nombre
                              }
                            </strong>

                            <p>
                              {
                                subseccion.descripcion
                              }
                            </p>


                            {subseccion.campos
                              ?.map(
                                (campo) => (

                                  <p
                                    key={
                                      campo.id_campo
                                    }
                                  >
                                    • {
                                      campo.nombre
                                    }

                                    {campo.obligatorio
                                      ? " — Obligatorio"
                                      : " — Opcional"}

                                    {campo.minimo !==
                                      null &&
                                      campo.maximo !==
                                      null
                                      ? ` — ${campo.minimo} a ${campo.maximo}`
                                      : ""}
                                  </p>

                                )
                              )}

                          </div>

                        )
                      )}

                  </div>

                )}

              </article>

            )
          )}

        </div>

      </section>


      {/* ===============================================
          ESTADÍSTICAS POR CARRERA
      =============================================== */}

      <section
        style={{
          marginTop:
            "35px"
        }}
      >

        <div className="sections-heading">

          <div>

            <span className="sections-label">
              ESTADÍSTICAS
            </span>

            <h2>
              Uso de secciones por carrera
            </h2>

            <p>
              Selecciona una carrera para
              conocer qué secciones utilizan
              sus estudiantes.
            </p>

          </div>

        </div>


        <div className="sections-form-card">

          <div className="sections-form-info">

            <span>
              CARRERA
            </span>

            <h3>
              Consultar estadísticas
            </h3>

            <p>
              Los porcentajes se calculan
              según los estudiantes que
              utilizan cada sección.
            </p>

          </div>


          <div>

            <select
              value={
                carreraSeleccionada
              }
              onChange={(e) =>
                setCarreraSeleccionada(
                  e.target.value
                )
              }
              style={{
                width:
                  "100%",

                minHeight:
                  "43px",

                marginBottom:
                  "12px"
              }}
            >

              <option value="">
                Selecciona una carrera
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


            <button
              type="button"
              className="sections-btn-primary"
              onClick={
                verEstadisticas
              }
            >
              Ver estadísticas
            </button>

          </div>

        </div>


        {estadisticas && (

          <div className="statistics-card">

            <div className="statistics-card-heading">

              <div>

                <span>
                  {
                    estadisticas
                      .carrera
                      .nombre
                  }
                </span>

                <h3>
                  Uso de las secciones
                </h3>

              </div>


              <p>
                {
                  estadisticas
                    .total_estudiantes
                }
                {" "}
                estudiantes
              </p>

            </div>


            <div className="statistics-bars">

              {estadisticas
                .secciones
                .map(
                  (seccion) => (

                    <div
                      key={
                        seccion.id_seccion
                      }
                    >

                      <div className="statistics-bar-info">

                        <span>
                          {seccion.nombre}
                        </span>

                        <strong>
                          {
                            seccion.porcentaje
                          }
                          %
                        </strong>

                      </div>


                      <div className="statistics-bar-track">

                        <div
                          className="statistics-bar-fill teal"
                          style={{
                            width:
                              `${seccion.porcentaje}%`
                          }}
                        />

                      </div>


                      <small>
                        {
                          seccion.estudiantes
                        }
                        {" de "}
                        {
                          seccion.total_estudiantes
                        }
                        {" estudiantes"}
                      </small>

                    </div>

                  )
                )}

            </div>


            {mayorUso && menorUso && (

              <div
                style={{
                  marginTop:
                    "25px",

                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap:
                    "15px"
                }}
              >

                <div>

                  <strong>
                    Sección más utilizada
                  </strong>

                  <p>
                    {mayorUso.nombre}
                    {" — "}
                    {mayorUso.porcentaje}%
                  </p>

                </div>


                <div>

                  <strong>
                    Sección menos utilizada
                  </strong>

                  <p>
                    {menorUso.nombre}
                    {" — "}
                    {menorUso.porcentaje}%
                  </p>

                </div>

              </div>

            )}

          </div>

        )}

      </section>


      <div
        style={{
          marginTop:
            "30px"
        }}
      >

        <Link
          to="/admin"
          className="users-back-link"
        >
          Volver al panel principal
        </Link>

      </div>


    </main>

  );
}


export default AdminSectionsPage;