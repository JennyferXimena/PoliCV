import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MenuLateral from "../../components/comunes/MenuLateral";
import api from "../../services/api";
import "../../styles/administrador/administradorBase.css";
import "../../styles/administrador/usuarios.css";

const obtenerUsuarioActual = () => {
  try {
    const guardado =
      localStorage.getItem("usuario") ||
      sessionStorage.getItem("usuario");

    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
};

function PaginaUsuariosAdministrador() {
  const [parametros, setParametros] = useSearchParams();
  const [usuarios, setUsuarios] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [resumen, setResumen] = useState({});
  const [buscar, setBuscar] = useState(
    parametros.get("buscar") || ""
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const usuarioActual = obtenerUsuarioActual();
  const filtrosActuales = parametros.toString();

  useEffect(() => {
    let cancelado = false;

    const params = Object.fromEntries(
      new URLSearchParams(filtrosActuales)
    );

    api.get("/admin/usuarios", { params })
      .then((respuesta) => {
        if (!cancelado) {
          setUsuarios(respuesta.data.usuarios || []);
          setCarreras(respuesta.data.carreras || []);
          setResumen(respuesta.data.resumen || {});
        }
      })
      .catch((error) => {
        if (!cancelado) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudieron cargar los usuarios"
          );
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [filtrosActuales]);

  const actualizarParametros = (cambios) => {
    const nuevos = new URLSearchParams(parametros);

    Object.entries(cambios).forEach(([clave, valor]) => {
      if (
        valor === "" ||
        valor === null ||
        valor === undefined
      ) {
        nuevos.delete(clave);
      } else {
        nuevos.set(clave, valor);
      }
    });

    setParametros(nuevos);
  };

  const buscarUsuarios = (e) => {
    e.preventDefault();

    actualizarParametros({
      buscar:buscar.trim()
    });
  };

  const limpiarFiltros = () => {
    setBuscar("");
    setParametros({});
  };

  const recargarUsuarios = async () => {
    const params = Object.fromEntries(
      new URLSearchParams(filtrosActuales)
    );

    const respuesta = await api.get(
      "/admin/usuarios",
      { params }
    );

    setUsuarios(respuesta.data.usuarios || []);
    setCarreras(respuesta.data.carreras || []);
    setResumen(respuesta.data.resumen || {});
  };

  const cambiarEstado = async (usuario) => {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado
      ? "activar"
      : "desactivar";

    if (
      !window.confirm(
        `¿Deseas ${accion} la cuenta ${usuario.email}?`
      )
    ) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      const respuesta = await api.patch(
        `/admin/usuarios/${usuario.id_usuario}/estado`,
        {
          estado:nuevoEstado
        }
      );

      setMensaje(respuesta.data.mensaje);
      await recargarUsuarios();
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo actualizar el usuario"
      );
    }
  };

  const total = Number(resumen.total || 0);
  const estudiantes = Number(resumen.estudiantes || 0);
  const administradores = Number(resumen.administradores || 0);
  const activos = Number(resumen.activos || 0);
  const inactivos = Number(resumen.inactivos || 0);
  const verificados = Number(resumen.verificados || 0);
  const pendientes = Number(
    resumen.pendientes_verificacion || 0
  );

  return (
    <div className="admin-layout">
      <MenuLateral />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              GESTIÓN DE USUARIOS
            </span>
            <h1>Usuarios</h1>
            <p>
              Consulta, filtra y administra el acceso de las
              cuentas de TalentoESFOT.
            </p>
          </div>

          <div className="admin-header-badge">
            {usuarios.length} mostrados
          </div>
        </header>

        <div className="admin-content">
          <section className="usuarios-resumen">
            <button
              type="button"
              onClick={limpiarFiltros}
            >
              <span>TOTAL</span>
              <strong>{total}</strong>
              <small>Usuarios registrados</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  rol:"Estudiante"
                })
              }
            >
              <span>ESTUDIANTES</span>
              <strong>{estudiantes}</strong>
              <small>Cuentas de estudiantes</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  rol:"Administrador"
                })
              }
            >
              <span>ADMINISTRADORES</span>
              <strong>{administradores}</strong>
              <small>Cuentas administrativas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  estado:"activo"
                })
              }
            >
              <span>ACTIVOS</span>
              <strong>{activos}</strong>
              <small>Cuentas habilitadas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  estado:"inactivo"
                })
              }
            >
              <span>INACTIVOS</span>
              <strong>{inactivos}</strong>
              <small>Cuentas deshabilitadas</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  verificacion:"verificado"
                })
              }
            >
              <span>VERIFICADOS</span>
              <strong>{verificados}</strong>
              <small>Correos confirmados</small>
            </button>

            <button
              type="button"
              onClick={() =>
                actualizarParametros({
                  verificacion:"pendiente"
                })
              }
            >
              <span>POR VERIFICAR</span>
              <strong>{pendientes}</strong>
              <small>Correos pendientes</small>
            </button>
          </section>

          <section className="usuarios-filtros">
            <div className="usuarios-filtros-titulo">
              <span>FILTROS</span>
              <h2>Buscar y filtrar cuentas</h2>
            </div>

            <form
              onSubmit={buscarUsuarios}
              className="usuarios-filtros-grid"
            >
              <input
                type="text"
                maxLength={100}
                value={buscar}
                onChange={(e) =>
                  setBuscar(e.target.value)
                }
                placeholder="Nombre, apellido o correo..."
              />

              <select
                value={parametros.get("rol") || ""}
                onChange={(e) =>
                  actualizarParametros({
                    rol:e.target.value
                  })
                }
              >
                <option value="">
                  Todos los roles
                </option>
                <option value="Estudiante">
                  Estudiantes
                </option>
                <option value="Administrador">
                  Administradores
                </option>
              </select>

              <select
                value={parametros.get("estado") || ""}
                onChange={(e) =>
                  actualizarParametros({
                    estado:e.target.value
                  })
                }
              >
                <option value="">
                  Todos los estados
                </option>
                <option value="activo">
                  Activos
                </option>
                <option value="inactivo">
                  Inactivos
                </option>
              </select>

              <select
                value={
                  parametros.get("verificacion") || ""
                }
                onChange={(e) =>
                  actualizarParametros({
                    verificacion:e.target.value
                  })
                }
              >
                <option value="">
                  Toda verificación
                </option>
                <option value="verificado">
                  Verificados
                </option>
                <option value="pendiente">
                  Por verificar
                </option>
              </select>

              <select
                value={parametros.get("carrera") || ""}
                onChange={(e) =>
                  actualizarParametros({
                    carrera:e.target.value
                  })
                }
              >
                <option value="">
                  Todas las carreras
                </option>

                {carreras.map((carrera) => (
                  <option
                    key={carrera.id_carrera}
                    value={carrera.id_carrera}
                  >
                    {carrera.nombre}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="usuarios-btn-buscar"
              >
                Buscar
              </button>

              <button
                type="button"
                className="usuarios-btn-limpiar"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            </form>
          </section>

          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="usuarios-mensaje-exito">
              {mensaje}
            </div>
          )}

          <section className="usuarios-tabla-card">
            <div className="usuarios-tabla-titulo">
              <div>
                <span>CUENTAS REGISTRADAS</span>
                <h2>Listado de usuarios</h2>
              </div>

              <strong>{usuarios.length}</strong>
            </div>

            {cargando ? (
              <div className="usuarios-estado">
                Cargando usuarios...
              </div>
            ) : usuarios.length === 0 ? (
              <div className="usuarios-estado">
                No existen usuarios que coincidan
                con los filtros.
              </div>
            ) : (
              <div className="usuarios-tabla-scroll">
                <table className="usuarios-tabla">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Carrera</th>
                      <th>Verificación</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuarios.map((usuario) => {
                      const nombre =
                        `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim();

                      const esPropio =
                        Number(usuarioActual?.id_usuario) ===
                        Number(usuario.id_usuario);

                      return (
                        <tr key={usuario.id_usuario}>
                          <td>
                            <div className="usuario-identidad">
                              <div>
                                {(nombre || usuario.email)
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                <strong>
                                  {nombre || "Sin nombre"}
                                </strong>
                                <small>
                                  #{usuario.id_usuario}
                                </small>
                              </span>
                            </div>
                          </td>

                          <td>{usuario.email}</td>

                          <td>
                            <span
                              className={`usuario-rol ${
                                usuario.rol === "Administrador"
                                  ? "admin"
                                  : "estudiante"
                              }`}
                            >
                              {usuario.rol}
                            </span>
                          </td>

                          <td>
                            {usuario.carrera ||
                              "Sin definir"}
                          </td>

                          <td>
                            <span
                              className={`usuario-verificacion ${
                                usuario.correo_verificado
                                  ? "si"
                                  : "no"
                              }`}
                            >
                              {usuario.correo_verificado
                                ? "Verificado"
                                : "Pendiente"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`usuario-estado ${
                                usuario.estado
                                  ? "activo"
                                  : "inactivo"
                              }`}
                            >
                              {usuario.estado
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              disabled={esPropio}
                              className={`usuario-accion ${
                                usuario.estado
                                  ? "desactivar"
                                  : "activar"
                              }`}
                              onClick={() =>
                                cambiarEstado(usuario)
                              }
                            >
                              {esPropio
                                ? "Cuenta actual"
                                : usuario.estado
                                  ? "Desactivar"
                                  : "Activar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

export default PaginaUsuariosAdministrador;