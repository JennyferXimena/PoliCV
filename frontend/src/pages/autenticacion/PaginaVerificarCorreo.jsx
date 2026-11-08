import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/autenticacion/inicioSesion.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PaginaVerificarCorreo() {
  const [parametros] = useSearchParams();
  const token = parametros.get("token");

  const [estado, setEstado] = useState(token ? "verificando" : "error");
  const [mensaje, setMensaje] = useState(
    token
      ? "Estamos verificando tu correo institucional."
      : "El enlace de verificación no es válido."
  );

  useEffect(() => {
    if (!token) return;

    const verificarCorreo = async () => {
      try {
        const respuesta = await fetch(`${URL_API}/api/auth/verificar-correo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          setEstado("error");
          setMensaje(datos.mensaje || "No se pudo verificar el correo.");
          return;
        }

        setEstado("exito");
        setMensaje("Tu correo fue verificado correctamente. Ya puedes iniciar sesión.");
      } catch {
        setEstado("error");
        setMensaje("No se pudo conectar con el servidor.");
      }
    };

    verificarCorreo();
  }, [token]);

  return (
    <div className="pagina-acceso">
      <header className="encabezado-acceso">
        <div className="contenedor-encabezado-acceso">
          <Link to="/" className="marca-acceso">
            <strong>TalentoESFOT</strong>
            <span>Escuela Politécnica Nacional</span>
          </Link>

          <nav className="menu-acceso">
            <Link to="/">INICIO</Link>
            <Link to="/iniciar-sesion">INICIAR SESIÓN</Link>
            <Link to="/registrarse" className="boton-registro-menu">CREAR CUENTA</Link>
          </nav>
        </div>
      </header>

      <main className="contenido-verificacion">
        <section className="tarjeta-verificacion">
          <span className="etiqueta-acceso">VERIFICACIÓN DE CUENTA</span>

          {estado === "verificando" && (
            <>
              <div className="icono-verificacion">⌛</div>
              <h1>Verificando correo</h1>
              <p>{mensaje}</p>
            </>
          )}

          {estado === "exito" && (
            <>
              <div className="icono-verificacion exito">✓</div>
              <h1>Cuenta verificada</h1>
              <p>{mensaje}</p>
              <Link to="/iniciar-sesion" className="boton-principal-acceso">Iniciar sesión</Link>
            </>
          )}

          {estado === "error" && (
            <>
              <div className="icono-verificacion error">!</div>
              <h1>No pudimos verificar tu cuenta</h1>
              <p>{mensaje}</p>
              <Link to="/iniciar-sesion" className="boton-principal-acceso">Volver a iniciar sesión</Link>
            </>
          )}
        </section>
      </main>

      <footer className="pie-acceso">
        <div className="enlaces-pie-acceso">
          <strong>TalentoESFOT</strong>
          <div>
            <Link to="/terminos-y-privacidad#terminos">Términos y condiciones</Link>
            <Link to="/terminos-y-privacidad#privacidad">Política de privacidad</Link>
          </div>
        </div>

        <div className="barra-inferior-acceso">
          <span>© 2026 TalentoESFOT</span>
          <span>Proyecto de integración curricular - ESFOT - EPN</span>
          <span>Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

export default PaginaVerificarCorreo;