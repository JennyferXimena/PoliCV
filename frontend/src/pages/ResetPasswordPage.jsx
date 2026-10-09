import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../services/api";
import "../styles/auth.css";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!token) {
      setError("El enlace de recuperación no es válido");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await api.post(
        "/auth/restablecer-password",
        {
          token,
          nuevaPassword: password,
        }
      );

      setMensaje(response.data.mensaje);

      setTimeout(() => {
        navigate("/iniciar-sesion");
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo restablecer la contraseña"
      );
    }
  };

  return (
    <main className="auth-page">

      <section className="auth-left">
        <div>
          <h1>PoliCV</h1>

          <h2>Nueva contraseña</h2>

          <p>
            Crea una nueva contraseña para recuperar
            el acceso a tu cuenta.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-box">

          <h1>Restablecer contraseña</h1>

          <p className="subtitle">
            Ingresa y confirma tu nueva contraseña.
          </p>

          <form onSubmit={handleSubmit}>

            <label>Nueva contraseña</label>

            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirmar contraseña</label>

            <input
              type="password"
              placeholder="Confirma tu contraseña"
              value={confirmarPassword}
              onChange={(e) =>
                setConfirmarPassword(e.target.value)
              }
              required
            />

            {error && (
              <p className="message error">
                {error}
              </p>
            )}

            {mensaje && (
              <p className="message success">
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
            >
              Cambiar contraseña
            </button>

          </form>

          <p className="bottom-text">
            <Link to="/iniciar-sesion">
              ← Volver al inicio de sesión
            </Link>
          </p>

        </div>
      </section>

    </main>
  );
}

export default ResetPasswordPage;