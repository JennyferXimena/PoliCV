import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, usuario } = response.data;

      if (recordarme) {
        localStorage.setItem("token", token);
        localStorage.setItem(
          "usuario",
          JSON.stringify(usuario)
        );
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem(
          "usuario",
          JSON.stringify(usuario)
        );
      }

      navigate("/perfil");

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo iniciar sesión"
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-left">
        <div>
          <h1>PoliCV</h1>
          <h2>Construye tu futuro profesional</h2>
          <p>
            Accede a tu perfil, currículums y recomendaciones
            profesionales.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-box">
          <h1>Iniciar sesión</h1>

          <p className="subtitle">
            ¡Bienvenido de nuevo! Ingresa para continuar.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Correo institucional</label>

            <input
              type="email"
              placeholder="usuario@epn.edu.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Contraseña</label>

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) =>
                    setRecordarme(e.target.checked)
                  }
                />

                Recordarme
              </label>

              <Link to="/recuperar-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <p className="message error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="bottom-text">
            ¿No tienes una cuenta?{" "}
            <Link to="/registrarse">
              Crear cuenta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;