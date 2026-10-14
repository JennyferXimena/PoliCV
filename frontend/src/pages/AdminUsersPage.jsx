import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Carga inicial de usuarios
  useEffect(() => {
    let activo = true;

    const obtenerUsuarios = async () => {
      try {
        const response = await api.get("/admin/usuarios");

        if (activo) {
          setUsuarios(response.data.usuarios);
        }
      } catch (error) {
        if (activo) {
          setError(
            error.response?.data?.mensaje ||
              "No se pudieron cargar los usuarios"
          );
        }
      }
    };

    obtenerUsuarios();

    return () => {
      activo = false;
    };
  }, []);

  // Buscar o volver a cargar usuarios
  const cargarUsuarios = async (termino = "") => {
    try {
      setError("");

      const response = await api.get(
        "/admin/usuarios",
        {
          params: {
            buscar: termino,
          },
        }
      );

      setUsuarios(response.data.usuarios);
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudieron cargar los usuarios"
      );
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();

    await cargarUsuarios(buscar);
  };

  const mostrarTodos = async () => {
    setBuscar("");
    await cargarUsuarios("");
  };

  const cambiarEstado = async (usuario) => {
    try {
      setMensaje("");
      setError("");

      const nuevoEstado = !usuario.estado;

      const response = await api.patch(
        `/admin/usuarios/${usuario.id_usuario}/estado`,
        {
          estado: nuevoEstado,
        }
      );

      setMensaje(response.data.mensaje);

      await cargarUsuarios(buscar);
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudo cambiar el estado del usuario"
      );
    }
  };

  return (
    <main style={{ padding: "40px" }}>
      <Link to="/admin">
        ← Volver al dashboard
      </Link>

      <h1>Gestionar usuarios</h1>

      <form
        onSubmit={handleBuscar}
        style={{ marginBottom: "25px" }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />

        <button type="submit">
          Buscar
        </button>

        <button
          type="button"
          onClick={mostrarTodos}
        >
          Mostrar todos
        </button>
      </form>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {mensaje && (
        <p style={{ color: "green" }}>
          {mensaje}
        </p>
      )}

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="6">
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>
                  {usuario.id_usuario}
                </td>

                <td>
                  {usuario.nombres || ""}
                  {" "}
                  {usuario.apellidos || ""}
                </td>

                <td>
                  {usuario.email}
                </td>

                <td>
                  {usuario.rol}
                </td>

                <td>
                  {usuario.estado
                    ? "Activo"
                    : "Inactivo"}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstado(usuario)
                    }
                  >
                    {usuario.estado
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

export default AdminUsersPage;