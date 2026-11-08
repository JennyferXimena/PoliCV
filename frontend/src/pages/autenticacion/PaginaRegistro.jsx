import { useState } from "react";
import { Link } from "react-router-dom";
import { EncabezadoAcceso, ImagenAcceso, PieAcceso } from "./PaginaInicioSesion";
import "../../styles/autenticacion/registro.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaRegistro() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [sacudir, setSacudir] = useState(false);

  const evaluarContrasena = () => {
    if (!contrasena) return { texto: "", clase: "" };

    const requisitos = [
      /[a-z]/.test(contrasena),
      /[A-Z]/.test(contrasena),
      /\d/.test(contrasena),
      /[^A-Za-z0-9]/.test(contrasena)
    ].filter(Boolean).length;

    if (contrasena.length < 8 || requisitos <= 2) return { texto: "Débil", clase: "debil" };
    if (requisitos === 3) return { texto: "Media", clase: "media" };
    return { texto: "Fuerte", clase: "fuerte" };
  };

  const nivel = evaluarContrasena();

  const activarSacudida = () => {
    setSacudir(false);

    requestAnimationFrame(() => {
      setSacudir(true);
      setTimeout(() => setSacudir(false), 450);
    });
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    const correoLimpio = correo.trim().toLowerCase();
    const contrasenaFuerte =
      contrasena.length >= 8 &&
      contrasena.length <= 12 &&
      /[a-z]/.test(contrasena) &&
      /[A-Z]/.test(contrasena) &&
      /\d/.test(contrasena) &&
      /[^A-Za-z0-9]/.test(contrasena);

    if (!nombres.trim() || !apellidos.trim()) {
      setMensaje("Completa tus nombres y apellidos.");
      activarSacudida();
      return;
    }

    if (!correoLimpio.endsWith("@epn.edu.ec")) {
      setMensaje("Debes utilizar tu correo institucional terminado en @epn.edu.ec.");
      activarSacudida();
      return;
    }

    if (!contrasenaFuerte) {
      setMensaje("La contraseña debe tener entre 8 y 12 caracteres, mayúscula, minúscula, número y carácter especial.");
      activarSacudida();
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setConfirmarContrasena("");
      setMensaje("Las contraseñas no coinciden.");
      activarSacudida();
      return;
    }

    if (!aceptaTerminos) {
      setMensaje("Debes aceptar los Términos y condiciones y la Política de privacidad.");
      activarSacudida();
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: correoLimpio,
          password: contrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo crear la cuenta.");
        activarSacudida();
        return;
      }

      setRegistroExitoso(true);
      setMensaje(datos.mensaje || "Cuenta creada. Revisa tu correo institucional para verificarla.");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      activarSacudida();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-acceso">
      <EncabezadoAcceso pagina="registro" />

      <main className="contenido-acceso contenido-registro">
        <ImagenAcceso />

        <section className="zona-formulario-acceso">
          <form className={`formulario-acceso formulario-registro ${sacudir ? "sacudir" : ""}`} onSubmit={registrar} noValidate>
            <span className="etiqueta-acceso">ÚNETE A TALENTOESFOT</span>
            <h1>Crear cuenta</h1>
            <p className="descripcion-acceso">Registra tu cuenta institucional para comenzar a construir tu perfil profesional.</p>

            {mensaje && (
              <div className={registroExitoso ? "mensaje-exito-acceso" : "mensaje-error-acceso"}>
                {mensaje}
              </div>
            )}

            {!registroExitoso ? (
              <>
                <div className="fila-registro">
                  <div className="grupo-acceso">
                    <label>Nombres</label>
                    <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Tus nombres" />
                  </div>

                  <div className="grupo-acceso">
                    <label>Apellidos</label>
                    <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Tus apellidos" />
                  </div>
                </div>

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

                <div className="grupo-acceso">
                  <label>Contraseña</label>

                  <div className="campo-contrasena">
                    <input
                      type={mostrarContrasena ? "text" : "password"}
                      value={contrasena}
                      maxLength={12}
                      onChange={(e) => setContrasena(e.target.value)}
                      placeholder="8 a 12 caracteres"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="boton-ojo"
                      onClick={() => setMostrarContrasena((actual) => !actual)}
                    >
                      {mostrarContrasena ? "◉" : "◎"}
                    </button>
                  </div>

                  {nivel.texto && (
                    <div className={`nivel-contrasena ${nivel.clase}`}>
                      Seguridad: <strong>{nivel.texto}</strong>
                    </div>
                  )}

                  <small className="requisitos-contrasena">
                    8–12 caracteres · mayúscula · minúscula · número · carácter especial
                  </small>
                </div>

                <div className="grupo-acceso">
                  <label>Confirmar contraseña</label>

                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    value={confirmarContrasena}
                    maxLength={12}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                  />
                </div>

                <label className="aceptar-terminos">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                  />

                  <span>
                    He leído y acepto los{" "}
                    <Link to="/terminos-y-privacidad#terminos">Términos y condiciones</Link>
                    {" "}y la{" "}
                    <Link to="/terminos-y-privacidad#privacidad">Política de privacidad</Link>.
                  </span>
                </label>

                <button type="submit" className="boton-principal-acceso" disabled={cargando}>
                  {cargando ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </>
            ) : (
              <div className="verificacion-registro">
                <h3>Revisa tu correo</h3>
                <p>Debes verificar tu cuenta antes de poder ingresar a TalentoESFOT.</p>
                <Link to="/iniciar-sesion" className="boton-enlace-acceso">Ir a iniciar sesión</Link>
              </div>
            )}

            <div className="cambio-acceso">
              <span>¿Ya tienes una cuenta?</span>
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </div>
          </form>
        </section>
      </main>

      <PieAcceso />
    </div>
  );
}

export default PaginaRegistro;