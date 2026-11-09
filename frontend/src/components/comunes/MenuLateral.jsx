import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const obtenerUsuario = () => {
  try {
    const guardado =
      localStorage.getItem("usuario") ||
      sessionStorage.getItem("usuario");

    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
};

function MenuLateral() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const usuario = obtenerUsuario();

  const [usuariosAbierto,setUsuariosAbierto] = useState(
    ubicacion.pathname.startsWith("/admin/usuarios")
  );

  const [propuestasAbierto,setPropuestasAbierto] = useState(
    ubicacion.pathname.startsWith("/admin/propuestas")
  );

  const activa = (ruta) =>
    ubicacion.pathname === ruta ||
    (ruta !== "/admin" &&
      ubicacion.pathname.startsWith(ruta));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navegar("/iniciar-sesion");
  };

  const inicial =
    usuario?.nombres?.charAt(0)?.toUpperCase() ||
    usuario?.email?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-logo">TE</div>

        <div>
          <strong>TalentoESFOT</strong>
          <span>Administración</span>
        </div>
      </div>

      <Link
        to="/admin/perfil"
        className={`admin-profile-card ${
          activa("/admin/perfil") ? "active" : ""
        }`}
      >
        <div className="admin-profile-avatar">
          {usuario?.fotografia_url ? (
            <img
              src={usuario.fotografia_url}
              alt="Perfil"
            />
          ) : (
            inicial
          )}
        </div>

        <div className="admin-profile-info">
          <strong>
            {usuario?.nombres
              ? `${usuario.nombres} ${usuario.apellidos || ""}`
              : "Administrador"}
          </strong>

          <span>{usuario?.email}</span>
          <small>Ver mi perfil</small>
        </div>
      </Link>

      <nav className="admin-menu">
        <Link
          to="/admin"
          className={`admin-menu-link ${
            ubicacion.pathname === "/admin" ||
            ubicacion.pathname === "/admin/estadisticas"
              ? "active"
              : ""
          }`}
        >
          <span className="admin-menu-number">01</span>
          <span>Estadísticas</span>
        </Link>

        <div
          className={`admin-menu-group ${
            activa("/admin/usuarios") ? "active" : ""
          }`}
        >
          <button
            type="button"
            className="admin-menu-link admin-menu-button"
            onClick={() =>
              setUsuariosAbierto(!usuariosAbierto)
            }
          >
            <span className="admin-menu-number">02</span>
            <span>Usuarios</span>
            <span className="admin-menu-arrow">
              {usuariosAbierto ? "−" : "+"}
            </span>
          </button>

          {usuariosAbierto && (
            <div className="admin-submenu">
              <Link to="/admin/usuarios?estado=activo">Activos</Link>
              <Link to="/admin/usuarios?estado=inactivo">Inactivos</Link>
              <Link to="/admin/usuarios?rol=Estudiante">Estudiantes</Link>
              <Link to="/admin/usuarios?rol=Administrador">Administradores</Link>
              <Link to="/admin/usuarios?verificacion=verificado">Verificados</Link>
              <Link to="/admin/usuarios?verificacion=pendiente">Por verificar</Link>
            </div>
          )}
        </div>

        <Link
          to="/admin/secciones"
          className={`admin-menu-link ${
            activa("/admin/secciones") ? "active" : ""
          }`}
        >
          <span className="admin-menu-number">03</span>
          <span>Secciones del CV</span>
        </Link>

        <Link
          to="/admin/plantillas"
          className={`admin-menu-link ${
            activa("/admin/plantillas") ? "active" : ""
          }`}
        >
          <span className="admin-menu-number">04</span>
          <span>Plantillas</span>
        </Link>

        <div
          className={`admin-menu-group ${
            activa("/admin/propuestas") ? "active" : ""
          }`}
        >
          <button
            type="button"
            className="admin-menu-link admin-menu-button"
            onClick={() =>
              setPropuestasAbierto(!propuestasAbierto)
            }
          >
            <span className="admin-menu-number">05</span>
            <span>Propuestas</span>
            <span className="admin-menu-arrow">
              {propuestasAbierto ? "−" : "+"}
            </span>
          </button>

          {propuestasAbierto && (
            <div className="admin-submenu">
              <Link to="/admin/propuestas?estado=pendiente">Pendientes</Link>
              <Link to="/admin/propuestas?estado=en_revision">En revisión</Link>
              <Link to="/admin/propuestas?estado=aceptada">Aceptadas</Link>
              <Link to="/admin/propuestas?estado=rechazada">Rechazadas</Link>
            </div>
          )}
        </div>
      </nav>

      <button
        type="button"
        className="admin-logout"
        onClick={cerrarSesion}
      >
        Cerrar sesión
      </button>
    </aside>
  );
}

export default MenuLateral;