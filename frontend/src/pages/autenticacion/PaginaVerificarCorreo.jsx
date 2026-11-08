import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/autenticacion/inicioSesion.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaVerificarCorreo() {
  const [parametros] = useSearchParams();
  const correo = parametros.get("email") || sessionStorage.getItem("correo_verificacion") || "";

  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const verificar = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    if (!correo) {
      setMensaje("No se encontró el correo que deseas verificar.");
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setMensaje("Ingresa el código de 6 dígitos.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/verificar-correo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, codigo })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo verificar la cuenta.");
        return;
      }

      sessionStorage.removeItem("correo_verificacion");
      setExito(true);
      setMensaje(datos.mensaje);
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const reenviar = async () => {
    if (!correo) return;

    setReenviando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/reenviar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo })
      });

      const datos = await respuesta.json();
      setMensaje(datos.mensaje || "Código reenviado.");
    } catch {
      setMensaje("No se pudo reenviar el código.");
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="pagina-acceso">
      <main className="contenido-verificacion">
        <form className="tarjeta-verificacion" onSubmit={verificar}>
          <span className="etiqueta-acceso">VERIFICACIÓN DE CUENTA</span>
          <h1>{exito ? "Cuenta verificada" : "Verifica tu correo"}</h1>

          {!exito ? (
            <>
              <p>
                Enviamos un código de 6 dígitos a<br />
                <strong>{correo}</strong>
              </p>

              {mensaje && <div className="mensaje-error-acceso">{mensaje}</div>}

              <div className="grupo-acceso">
                <label>Código de verificación</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  placeholder="000000"
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <button type="submit" className="boton-principal-acceso" disabled={cargando}>
                {cargando ? "Verificando..." : "Verificar cuenta"}
              </button>

              <div className="cambio-acceso">
                <span>¿No recibiste el código?</span>
                <button type="button" className="boton-texto-acceso" onClick={reenviar} disabled={reenviando}>
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
      </main>
    </div>
  );
}

export default PaginaVerificarCorreo;