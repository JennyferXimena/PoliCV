import { Link, useNavigate } from "react-router-dom";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };

  return (
    <main style={{ padding: "40px" }}>
      <h1>Dashboard del administrador</h1>

      <p>
        Sesión iniciada como:
        {" "}
        <strong>{usuario?.email}</strong>
      </p>

      <p>
        Rol:
        {" "}
        <strong>{usuario?.rol}</strong>
      </p>

      <hr />

      <h2>Administración</h2>

    <p>
    <Link to="/admin/usuarios">
        Gestionar usuarios
    </Link>
    </p>

    <p>
    <Link to="/admin/secciones">
        Gestionar secciones del currículum
    </Link>
    </p>

    <p>
    <Link to="/admin/plantillas">
        Gestionar plantillas
    </Link>
    </p>

    <p>
    <Link to="/admin/estadisticas">
        Consultar estadísticas
    </Link>
    </p>

    <p>
    <Link to="/admin/propuestas">
        Gestionar propuestas de mejora
    </Link>
    </p>

      <button onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default AdminDashboardPage;