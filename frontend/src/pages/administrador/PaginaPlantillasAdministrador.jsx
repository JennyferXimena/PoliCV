import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../../services/api";
import "../../styles/administrador/administrador.css";


function AdminTemplatesPage() {

  const navigate =
    useNavigate();


  const [
    plantillas,
    setPlantillas
  ] = useState([]);


  const [
    error,
    setError
  ] = useState("");


  const [
    mensaje,
    setMensaje
  ] = useState("");


  const [
    cargando,
    setCargando
  ] = useState(true);


  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");


  const usuarioActual =
    usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;


  /* =========================================================
     CERRAR SESIÓN
  ========================================================= */

  const cerrarSesion = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "usuario"
    );

    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "usuario"
    );

    navigate(
      "/iniciar-sesion"
    );
  };


  /* =========================================================
     CARGAR PLANTILLAS
  ========================================================= */

  const cargarPlantillas =
    async () => {

      try {

        setCargando(true);
        setError("");


        const response =
          await api.get(
            "/admin/plantillas"
          );


        setPlantillas(
          response.data.plantillas ||
          []
        );


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudieron cargar las plantillas"
        );


      } finally {

        setCargando(false);

      }
    };


  useEffect(() => {

    let activo = true;


    const cargarInicial =
      async () => {

        try {

          const response =
            await api.get(
              "/admin/plantillas"
            );


          if (!activo) {
            return;
          }


          setPlantillas(
            response.data.plantillas ||
            []
          );


        } catch (error) {

          if (!activo) {
            return;
          }


          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar las plantillas"
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


  /* =========================================================
     ACTIVAR / DESACTIVAR
  ========================================================= */

  const cambiarEstado =
    async (plantilla) => {

      const nuevoEstado =
          !plantilla.estado

      const accion =
        nuevoEstado
          ? "activar"
          : "desactivar";


      const confirmar =
        window.confirm(
          `¿Deseas ${accion} la plantilla "${plantilla.nombre}"?`
        );


      if (!confirmar) {
        return;
      }


      try {

        setError("");
        setMensaje("");


        const response =
          await api.patch(
            `/admin/plantillas/${plantilla.id_plantilla}/estado`,
            {
              estado:
                nuevoEstado
            }
          );


        setMensaje(
          response.data.mensaje
        );


        await cargarPlantillas();


      } catch (error) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo actualizar el estado de la plantilla"
        );

      }
    };


  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (

    <div className="admin-page">


      {/* SIDEBAR */}

      <aside className="admin-sidebar">


        <div className="admin-brand">

          <div className="admin-brand-logo">
            P
          </div>


          <div>

            <h2>
              PoliCV
            </h2>

            <span>
              Administración
            </span>

          </div>

        </div>


        <div className="admin-profile">


          <div className="admin-avatar">

            {usuarioActual?.email
              ? usuarioActual.email
                  .charAt(0)
                  .toUpperCase()
              : "A"}

          </div>


          <div>

            <strong>
              Administrador
            </strong>

            <span>
              {usuarioActual?.email}
            </span>

          </div>

        </div>


        <nav className="admin-menu">


          <Link to="/admin">

            <span>
              01
            </span>

            Panel principal

          </Link>


          <Link to="/admin/usuarios">

            <span>
              02
            </span>

            Gestionar usuarios

          </Link>


          <Link to="/admin/secciones">

            <span>
              03
            </span>

            Secciones del CV

          </Link>


          <Link
            to="/admin/plantillas"
            className="active"
          >

            <span>
              04
            </span>

            Plantillas

          </Link>


          <Link to="/admin/estadisticas">

            <span>
              05
            </span>

            Estadísticas

          </Link>


          <Link to="/admin/propuestas">

            <span>
              06
            </span>

            Propuestas

          </Link>


        </nav>


        <button
          type="button"
          className="admin-logout"
          onClick={
            cerrarSesion
          }
        >
          Cerrar sesión
        </button>


      </aside>


      {/* CONTENIDO */}

      <main className="admin-main">


        <header className="admin-header">


          <div>

            <span className="admin-header-label">
              CONFIGURACIÓN VISUAL
            </span>


            <h1>
              Plantillas
            </h1>


            <p>
              Controla la disponibilidad de
              los diseños predeterminados de
              currículum de PoliCV.
            </p>

          </div>


          <div className="admin-header-account">


            <div>

              <span>
                Sesión iniciada como
              </span>

              <strong>
                {usuarioActual?.email}
              </strong>

            </div>


            <div className="admin-header-avatar">

              {usuarioActual?.email
                ? usuarioActual.email
                    .charAt(0)
                    .toUpperCase()
                : "A"}

            </div>

          </div>


        </header>


        <div className="admin-content">


          {/* ENCABEZADO */}

          <section className="templates-admin-heading">


            <div>

              <span className="templates-admin-label">
                DISEÑOS PREDETERMINADOS
              </span>


              <h2>
                Plantillas de PoliCV
              </h2>


              <p>
                PoliCV dispone de tres diseños
                predeterminados. El administrador
                puede controlar cuáles están
                disponibles para los estudiantes.
              </p>

            </div>


            <div className="templates-admin-counter">

              <span>
                Plantillas
              </span>

              <strong>
                {plantillas.length}
              </strong>

            </div>


          </section>


          {/* MENSAJES */}

          {error && (

            <div className="users-message error">
              {error}
            </div>

          )}


          {mensaje && (

            <div className="users-message success">
              {mensaje}
            </div>

          )}


          {/* PLANTILLAS */}

          <section className="templates-admin-table-card">


            <div className="templates-admin-table-header">


              <div>

                <span>
                  DISEÑOS DISPONIBLES
                </span>


                <h3>
                  Moderna, Clásica y Minimalista
                </h3>

              </div>


              <Link
                to="/admin"
                className="users-back-link"
              >
                Volver al panel
              </Link>


            </div>


            {cargando ? (

              <div className="users-loading">
                Cargando plantillas...
              </div>

            ) : plantillas.length === 0 ? (

              <div className="users-empty">

                <strong>
                  No se encontraron las plantillas predeterminadas
                </strong>

                <p>
                  Verifica los registros de la tabla plantillas.
                </p>

              </div>

            ) : (

              <div className="users-table-wrapper">


                <table className="templates-admin-table">


                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Plantilla
                      </th>

                      <th>
                        Código
                      </th>

                      <th>
                        Descripción
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Acción
                      </th>

                    </tr>

                  </thead>


                  <tbody>


                    {plantillas.map(
                      (plantilla) => {

                        const activa =
                          Boolean(
                            plantilla.estado
                          );


                        return (

                          <tr
                            key={
                              plantilla.id_plantilla
                            }
                          >


                            <td className="user-id">
                              #{plantilla.id_plantilla}
                            </td>


                            <td>

                              <div className="template-admin-name-cell">


                                <div className="template-admin-icon">
                                  CV
                                </div>


                                <div>

                                  <strong>
                                    {plantilla.nombre}
                                  </strong>

                                  <span>
                                    Diseño predeterminado PoliCV
                                  </span>

                                </div>


                              </div>

                            </td>


                            <td>

                              <span className="template-code">
                                {plantilla.codigo}
                              </span>

                            </td>


                            <td className="template-admin-description">

                              {plantilla.descripcion ||
                                "Diseño predeterminado de PoliCV"}

                            </td>


                            <td>

                              <span
                                className={
                                  activa
                                    ? "status-badge active"
                                    : "status-badge inactive"
                                }
                              >

                                {activa
                                  ? "Activa"
                                  : "Inactiva"}

                              </span>

                            </td>


                            <td>

                              <button
                                type="button"
                                className={
                                  activa
                                    ? "user-action deactivate"
                                    : "user-action activate"
                                }
                                onClick={
                                  () =>
                                    cambiarEstado(
                                      plantilla
                                    )
                                }
                              >

                                {activa
                                  ? "Desactivar"
                                  : "Activar"}

                              </button>

                            </td>


                          </tr>

                        );
                      }
                    )}


                  </tbody>


                </table>


              </div>

            )}


          </section>


        </div>


      </main>


    </div>

  );
}


export default AdminTemplatesPage;