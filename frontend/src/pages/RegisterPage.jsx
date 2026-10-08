import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!form.email.toLowerCase().endsWith("@epn.edu.ec")) {
      setError("Debe utilizar un correo institucional @epn.edu.ec");
      return;
    }

    try {
      const response = await api.post("/auth/registro", {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        password: form.password,
      });

      setMensaje(response.data.mensaje);

      setTimeout(() => {
        navigate("/iniciar-sesion");
      }, 1000);

    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
        "No se pudo crear la cuenta"
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
            Crea un currículum profesional y descubre oportunidades
            relacionadas con tu perfil.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-box">
          <h1>Crear cuenta</h1>

          <p className="subtitle">
            Únete a PoliCV e impulsa tu perfil profesional.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="two-columns">
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Nombre"
                  required
                />
              </div>

              <div>
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Apellido"
                  required
                />
              </div>
            </div>

            <label>Correo institucional</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="usuario@epn.edu.ec"
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              minLength="8"
              required
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmarPassword"
              value={form.confirmarPassword}
              onChange={handleChange}
              placeholder="Repita su contraseña"
              required
            />

            {error && (
              <p className="message error">{error}</p>
            )}

            {mensaje && (
              <p className="message success">{mensaje}</p>
            )}

            <button className="primary-button" type="submit">
              Crear cuenta
            </button>
          </form>

          <p className="bottom-text">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/iniciar-sesion">
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;