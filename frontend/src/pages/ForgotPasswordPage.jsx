import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!email.toLowerCase().endsWith("@epn.edu.ec")) {
      setError("Debe utilizar un correo institucional @epn.edu.ec");
      return;
    }

    try {
      setCargando(true);

      const response = await api.post(
        "/auth/recuperar-password",
        { email }
      );

      setMensaje(response.data.mensaje);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo solicitar la recuperación"
      );

    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="auth-page">

      <section className="auth-left">
        <div>
          <h1>PoliCV</h1>

          <h2>Recupera el acceso a tu cuenta</h2>

          <p>
            Utiliza tu correo institucional para recuperar
            tu contraseña y continuar utilizando PoliCV.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-box">

          <h1>Recuperar contraseña</h1>

          <p className="subtitle">
            Ingresa tu correo institucional y te enviaremos
            un enlace para restablecer tu contraseña.
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
              disabled={cargando}
            >
              {cargando
                ? "Enviando..."
                : "Enviar enlace"}
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

export default ForgotPasswordPage;