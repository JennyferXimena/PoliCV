import { useState } from "react";
import { Link } from "react-router-dom";
import { EncabezadoAcceso, ImagenAcceso, PieAcceso } from "./PaginaInicioSesion";
import "../../styles/autenticacion/recuperarContrasena.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaRecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const enviarRecuperacion = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio || !correoLimpio.endsWith("@epn.edu.ec")) {
      setMensaje("Ingresa un correo institucional válido.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correoLimpio })
      });

      await respuesta.json().catch(() => null);

      setEnviado(true);
      setMensaje("Si el correo pertenece a una cuenta registrada, recibirás las instrucciones para restablecer tu contraseña.");
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
          <form className="formulario-acceso formulario-recuperar" onSubmit={enviarRecuperacion}>
            <span className="etiqueta-acceso">RECUPERACIÓN DE ACCESO</span>
            <h1>Recuperar contraseña</h1>

            <p className="descripcion-acceso">
              Ingresa tu correo institucional y te enviaremos las instrucciones para recuperar tu cuenta.
            </p>

            {mensaje && (
              <div className={enviado ? "mensaje-exito-acceso" : "mensaje-error-acceso"}>
                {mensaje}
              </div>
            )}

            {!enviado && (
              <>
                <div className="grupo-acceso">
                  <label>Correo institucional</label>

                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@epn.edu.ec"
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="boton-principal-acceso" disabled={cargando}>
                  {cargando ? "Enviando..." : "Enviar enlace"}
                </button>
              </>
            )}

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