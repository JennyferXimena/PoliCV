import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  if (!token || !usuarioGuardado) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  const usuario = JSON.parse(usuarioGuardado);

  if (
    allowedRoles &&
    !allowedRoles.includes(usuario.rol)
  ) {
    if (usuario.rol === "Administrador") {
      return <Navigate to="/admin" replace />;
    }

    if (usuario.rol === "Estudiante") {
      return <Navigate to="/estudiante" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;