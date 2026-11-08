import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EncabezadoAcceso, ImagenAcceso, PieAcceso } from "./PaginaInicioSesion";
import "../../styles/autenticacion/recuperarContrasena.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaRecuperarContrasena() {
  const navegar = useNavigate();
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarCodigo = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    const correoLimpio = correo.trim().toLowerCase();

    if (!/^[A-Za-z0-9._%+-]+@epn\.edu\.ec$/i.test(correoLimpio)) {
      setMensaje("Ingresa un correo institucional @epn.edu.ec válido.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correoLimpio })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo solicitar la recuperación.");
        return;
      }

      sessionStorage.setItem("correo_recuperacion", correoLimpio);
      navegar("/restablecer-contrasena");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-acceso">
      <EncabezadoAcceso />
      <main className="contenido-acceso">
        <ImagenAcceso />

        <section className="zona-formulario-acceso">
          <form className="formulario-acceso" onSubmit={enviarCodigo}>
            <span className="etiqueta-acceso">RECUPERACIÓN DE ACCESO</span>
            <h1>Recuperar contraseña</h1>
            <p className="descripcion-acceso">
              Ingresa tu correo institucional y recibirás un código de recuperación válido durante 5 minutos.
            </p>

            {mensaje && <div className="mensaje-error-acceso">{mensaje}</div>}

            <div className="grupo-acceso">
              <label>Correo institucional</label>
              <input
                type="email"
                value={correo}
                placeholder="usuario@epn.edu.ec"
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <button type="submit" className="boton-principal-acceso" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar código"}
            </button>

            <div className="cambio-acceso">
              <Link to="/iniciar-sesion">← Volver a iniciar sesión</Link>
            </div>
          </form>
        </section>
      </main>

      <PieAcceso />
    </div>
  );
}

export default PaginaRecuperarContrasena;