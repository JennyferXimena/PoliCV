import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EncabezadoAcceso, ImagenAcceso, PieAcceso } from "./PaginaInicioSesion";
import "../../styles/autenticacion/restablecerContrasena.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaRestablecerContrasena() {
  const [parametros] = useSearchParams();
  const token = parametros.get("token");

  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const restablecerContrasena = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    const segura =
      contrasena.length >= 8 &&
      contrasena.length <= 12 &&
      /[a-z]/.test(contrasena) &&
      /[A-Z]/.test(contrasena) &&
      /\d/.test(contrasena) &&
      /[^A-Za-z0-9]/.test(contrasena);

    if (!token) {
      setMensaje("El enlace de recuperación no es válido.");
      return;
    }

    if (!segura) {
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
          token,
          password: contrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo cambiar la contraseña.");
        return;
      }

      setExito(true);
      setMensaje("Tu contraseña se actualizó correctamente.");
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
          <form className="formulario-acceso" onSubmit={restablecerContrasena}>
            <span className="etiqueta-acceso">NUEVA CONTRASEÑA</span>
            <h1>Restablecer contraseña</h1>

            <p className="descripcion-acceso">
              Crea una nueva contraseña segura para recuperar el acceso a TalentoESFOT.
            </p>

            {mensaje && (
              <div className={exito ? "mensaje-exito-acceso" : "mensaje-error-acceso"}>
                {mensaje}
              </div>
            )}

            {!exito && (
              <>
                <div className="grupo-acceso">
                  <label>Nueva contraseña</label>

                  <div className="campo-contrasena">
                    <input
                      type={mostrarContrasena ? "text" : "password"}
                      value={contrasena}
                      maxLength={12}
                      onChange={(e) => setContrasena(e.target.value)}
                      placeholder="8 a 12 caracteres"
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
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite tu contraseña"
                  />
                </div>

                <button type="submit" className="boton-principal-acceso" disabled={cargando}>
                  {cargando ? "Actualizando..." : "Cambiar contraseña"}
                </button>
              </>
            )}

            <div className="cambio-acceso">
              <Link to="/iniciar-sesion">Volver a iniciar sesión</Link>
            </div>
          </form>
        </section>
      </main>

      <PieAcceso />
    </div>
  );
}

export default PaginaRestablecerContrasena;