import { useState } from "react";
import { Link } from "react-router-dom";
import { EncabezadoAcceso, ImagenAcceso, PieAcceso } from "./PaginaInicioSesion";
import "../../styles/autenticacion/restablecerContrasena.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaRestablecerContrasena() {
  const correo = sessionStorage.getItem("correo_recuperacion") || "";

  const [codigo, setCodigo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const validarContrasena = (valor) =>
    valor.length >= 8 &&
    valor.length <= 12 &&
    /[a-z]/.test(valor) &&
    /[A-Z]/.test(valor) &&
    /\d/.test(valor) &&
    /[^A-Za-z0-9]/.test(valor);

  const restablecer = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    if (!correo) {
      setMensaje("Primero debes solicitar un código de recuperación.");
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setMensaje("Ingresa el código de 6 dígitos.");
      return;
    }

    if (!validarContrasena(contrasena)) {
      setMensaje("La contraseña debe tener entre 8 y 12 caracteres, mayúscula, minúscula, número y carácter especial.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setConfirmarContrasena("");
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/restablecer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo,
          codigo,
          password: contrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo cambiar la contraseña.");
        return;
      }

      sessionStorage.removeItem("correo_recuperacion");
      setExito(true);
      setMensaje(datos.mensaje);
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    if (!correo) return;

    setReenviando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo })
      });

      const datos = await respuesta.json();
      setMensaje(datos.mensaje || "Se envió un nuevo código.");
    } catch {
      setMensaje("No se pudo reenviar el código.");
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="pagina-acceso">
      <EncabezadoAcceso />

      <main className="contenido-acceso">
        <ImagenAcceso />

        <section className="zona-formulario-acceso">
          <form className="formulario-acceso" onSubmit={restablecer}>
            <span className="etiqueta-acceso">RECUPERACIÓN DE CUENTA</span>
            <h1>Nueva contraseña</h1>

            {!exito ? (
              <>
                <p className="descripcion-acceso">
                  Ingresa el código enviado a <strong>{correo}</strong> y crea una nueva contraseña.
                </p>

                {mensaje && <div className="mensaje-error-acceso">{mensaje}</div>}

                <div className="grupo-acceso">
                  <label>Código de recuperación</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    placeholder="000000"
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="grupo-acceso">
                  <label>Nueva contraseña</label>

                  <div className="campo-contrasena">
                    <input
                      type={mostrarContrasena ? "text" : "password"}
                      value={contrasena}
                      maxLength={12}
                      placeholder="8 a 12 caracteres"
                      onChange={(e) => setContrasena(e.target.value)}
                    />

                    <button
                      type="button"
                      className="boton-ojo"
                      onClick={() => setMostrarContrasena((actual) => !actual)}
                    >
                      {mostrarContrasena ? "◉" : "◎"}
                    </button>
                  </div>
                </div>

                <div className="grupo-acceso">
                  <label>Confirmar contraseña</label>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    value={confirmarContrasena}
                    maxLength={12}
                    placeholder="Repite tu contraseña"
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                  />
                </div>

                <button type="submit" className="boton-principal-acceso" disabled={cargando}>
                  {cargando ? "Actualizando..." : "Cambiar contraseña"}
                </button>

                <div className="cambio-acceso">
                  <span>¿No recibiste el código?</span>
                  <button type="button" className="boton-texto-acceso" onClick={reenviarCodigo} disabled={reenviando}>
                    {reenviando ? "Enviando..." : "Reenviar código"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mensaje-exito-acceso">{mensaje}</div>

                <Link to="/iniciar-sesion" className="boton-principal-acceso">
                  Iniciar sesión
                </Link>
              </>
            )}
          </form>
        </section>
      </main>

      <PieAcceso />
    </div>
  );
}

export default PaginaRestablecerContrasena;