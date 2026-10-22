import { Link, useNavigate } from "react-router-dom";

function StudentDashboardPage() {
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
      <h1>Dashboard del estudiante</h1>

      <p>
        Sesión iniciada como:{" "}
        <strong>{usuario?.email}</strong>
      </p>

      <p>
        Rol:{" "}
        <strong>{usuario?.rol}</strong>
      </p>

      <hr />

      <h2>Opciones</h2>

      <p>
        <Link to="/perfil">
          Mi perfil
        </Link>
      </p>

      <p>
        <Link to="/estudiante/curriculums">
          Mis currículums
        </Link>
      </p>

      <p>
        <Link to="/estudiante/asistente-ia">
          Asistente IA
        </Link>
      </p>

      <p>
        <Link to="/estudiante/propuestas">
          Propuestas de mejora
        </Link>
      </p>

      <br />

      <button onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default StudentDashboardPage;