import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/autenticacion/inicioSesion.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const IMAGEN_ACCESO = "/images/esfot.jpg";

function PaginaInicioSesion() {
  const navegar = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorCorreo, setErrorCorreo] = useState(false);
  const [errorContrasena, setErrorContrasena] = useState(false);
  const [sacudir, setSacudir] = useState(false);

  const activarSacudida = () => {
    setSacudir(false);
    requestAnimationFrame(() => {
      setSacudir(true);
      setTimeout(() => setSacudir(false), 450);
    });
  };

  const validarFormulario = () => {
    const correoLimpio = correo.trim().toLowerCase();
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valido = true;

    setErrorCorreo(false);
    setErrorContrasena(false);
    setMensaje("");

    if (!correoLimpio || !formatoCorreo.test(correoLimpio)) {
      setErrorCorreo(true);
      setCorreo("");
      setMensaje("Ingresa un correo electrónico válido.");
      valido = false;
    }

    if (!contrasena) {
      setErrorContrasena(true);
      setMensaje((actual) => actual || "Ingresa tu contraseña.");
      valido = false;
    }

    if (!valido) activarSacudida();
    return valido;
  };

  const iniciarSesion = async (evento) => {
    evento.preventDefault();
    if (!validarFormulario()) return;

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo.trim().toLowerCase(),
          password: contrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorCorreo(true);
        setErrorContrasena(true);
        setContrasena("");
        setMensaje(datos.mensaje || "Correo o contraseña incorrectos.");
        activarSacudida();
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");

      const almacenamiento = mantenerSesion ? localStorage : sessionStorage;
      almacenamiento.setItem("token", datos.token);
      almacenamiento.setItem("usuario", JSON.stringify(datos.usuario));

      const rol = String(datos.usuario?.rol || datos.usuario?.nombre_rol || "").toLowerCase();
      const idRol = Number(datos.usuario?.id_rol);
      const esAdministrador = idRol === 2 || rol === "administrador" || rol === "admin";

      navegar(esAdministrador ? "/admin" : "/estudiante");
    } catch {
      setMensaje("No se pudo conectar con el servidor. Inténtalo nuevamente.");
      activarSacudida();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-acceso">
      <EncabezadoAcceso pagina="iniciar" />

      <main className="contenido-acceso">
        <ImagenAcceso />

        <section className="zona-formulario-acceso">
          <form className={`formulario-acceso ${sacudir ? "sacudir" : ""}`} onSubmit={iniciarSesion} noValidate>
            <span className="etiqueta-acceso">BIENVENIDO DE NUEVO</span>
            <h1>Iniciar sesión</h1>
            <p className="descripcion-acceso">Ingresa a tu cuenta para continuar con tu perfil profesional.</p>

            {mensaje && <div className="mensaje-error-acceso">{mensaje}</div>}

            <div className={`grupo-acceso ${errorCorreo ? "con-error" : ""}`}>
              <label htmlFor="correo">Correo institucional</label>
              <input
                id="correo"
                type="email"
                value={correo}
                placeholder="usuario@epn.edu.ec"
                autoComplete="email"
                onChange={(evento) => {
                  setCorreo(evento.target.value);
                  setErrorCorreo(false);
                }}
              />
            </div>

            <div className={`grupo-acceso ${errorContrasena ? "con-error" : ""}`}>
              <label htmlFor="contrasena">Contraseña</label>

              <div className="campo-contrasena">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  onChange={(evento) => {
                    setContrasena(evento.target.value);
                    setErrorContrasena(false);
                  }}
                />

                <button
                  type="button"
                  className="boton-ojo"
                  onClick={() => setMostrarContrasena((actual) => !actual)}
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarContrasena ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <div className="opciones-acceso">
              <label className="mantener-sesion">
                <input
                  type="checkbox"
                  checked={mantenerSesion}
                  onChange={(evento) => setMantenerSesion(evento.target.checked)}
                />
                <span>Mantener sesión iniciada</span>
              </label>

              <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" className="boton-principal-acceso" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="cambio-acceso">
              <span>¿Aún no tienes una cuenta?</span>
              <Link to="/registrarse">Crear cuenta</Link>
            </div>

            <AvisoLegal />
          </form>
        </section>
      </main>

      <PieAcceso />
    </div>
  );
}

function EncabezadoAcceso({ pagina }) {
  return (
    <header className="encabezado-acceso">
      <div className="contenedor-encabezado-acceso">
        <Link to="/" className="marca-acceso">
          <strong>TalentoESFOT</strong>
          <span>Escuela Politécnica Nacional</span>
        </Link>

        <nav className="menu-acceso">
          <Link to="/">INICIO</Link>
          <Link to="/iniciar-sesion" className={pagina === "iniciar" ? "activo" : ""}>INICIAR SESIÓN</Link>
          <Link to="/registrarse" className={pagina === "registro" ? "activo boton-registro-menu" : "boton-registro-menu"}>CREAR CUENTA</Link>
        </nav>
      </div>
    </header>
  );
}

function ImagenAcceso() {
  return (
    <section className="tarjeta-imagen-acceso">
      <img src={IMAGEN_ACCESO} alt="Campus de la Escuela Politécnica Nacional" />

      <div className="capa-imagen-acceso">
        <span>TALENTOESFOT</span>
        <h2>Construye tu perfil profesional</h2>
        <p>Organiza tu experiencia, formación y habilidades para presentar mejor todo lo que puedes aportar.</p>
      </div>
    </section>
  );
}

function AvisoLegal() {
  return (
    <p className="aviso-legal-acceso">
      Al continuar aceptas los{" "}
      <Link to="/terminos-y-privacidad#terminos">Términos y condiciones</Link>
      {" "}y la{" "}
      <Link to="/terminos-y-privacidad#privacidad">Política de privacidad</Link>.
    </p>
  );
}

function PieAcceso() {
  return (
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
  );
}

export { EncabezadoAcceso, ImagenAcceso, AvisoLegal, PieAcceso };
export default PaginaInicioSesion;