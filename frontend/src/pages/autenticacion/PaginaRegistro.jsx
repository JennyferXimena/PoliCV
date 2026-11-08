import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/autenticacion/registro.css";

const URL_API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CLAVE_REGISTRO = "borrador_registro";
const CORREO_INSTITUCIONAL = /^[A-Za-z0-9._%+-]+@epn\.edu\.ec$/i;

const obtenerBorradorRegistro = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_REGISTRO)) || {};
  } catch {
    sessionStorage.removeItem(CLAVE_REGISTRO);
    return {};
  }
};

function PaginaRegistro() {
  const navegar = useNavigate();
  const borrador = obtenerBorradorRegistro();

  const [nombres, setNombres] = useState(borrador.nombres || "");
  const [apellidos, setApellidos] = useState(borrador.apellidos || "");
  const [correo, setCorreo] = useState(borrador.correo || "");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(CLAVE_REGISTRO, JSON.stringify({ nombres, apellidos, correo }));
  }, [nombres, apellidos, correo]);

  const validarContrasena = (valor) =>
    valor.length >= 8 &&
    valor.length <= 12 &&
    /[a-z]/.test(valor) &&
    /[A-Z]/.test(valor) &&
    /\d/.test(valor) &&
    /[^A-Za-z0-9]/.test(valor);

  const obtenerFortaleza = () => {
    if (!contrasena) return "";

    let requisitos = 0;
    if (contrasena.length >= 8 && contrasena.length <= 12) requisitos++;
    if (/[a-z]/.test(contrasena)) requisitos++;
    if (/[A-Z]/.test(contrasena)) requisitos++;
    if (/\d/.test(contrasena)) requisitos++;
    if (/[^A-Za-z0-9]/.test(contrasena)) requisitos++;

    if (requisitos <= 2) return "Débil";
    if (requisitos <= 4) return "Media";
    return "Fuerte";
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    const nombresLimpios = nombres.trim();
    const apellidosLimpios = apellidos.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (!nombresLimpios || !apellidosLimpios || !correoLimpio || !contrasena || !confirmarContrasena) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }

    if (!CORREO_INSTITUCIONAL.test(correoLimpio)) {
      setMensaje("Debes utilizar un correo institucional @epn.edu.ec.");
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

    if (!aceptaTerminos) {
      setMensaje("Debes aceptar los Términos y condiciones y la Política de privacidad.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${URL_API}/api/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: nombresLimpios,
          apellidos: apellidosLimpios,
          email: correoLimpio,
          password: contrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "No se pudo crear la cuenta.");
        return;
      }

      sessionStorage.removeItem(CLAVE_REGISTRO);
      sessionStorage.setItem("correo_verificacion", correoLimpio);
      navegar(`/verificar-correo?email=${encodeURIComponent(correoLimpio)}`);
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const fortaleza = obtenerFortaleza();

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
            <Link to="/registrarse" className="boton-registro-menu activo">CREAR CUENTA</Link>
          </nav>
        </div>
      </header>

      <main className="contenido-acceso contenido-registro">
        <section className="tarjeta-imagen-acceso">
          <img src="/images/esfot.jpg" alt="Escuela Politécnica Nacional" />

          <div className="capa-imagen-acceso">
            <span>TALENTOESFOT</span>
            <h2>Construye tu perfil profesional</h2>
            <p>
              Organiza tu información académica y profesional para crear un currículum que represente lo mejor de ti.
            </p>
          </div>
        </section>

        <section className="zona-formulario-acceso">
          <form className="formulario-acceso formulario-registro" onSubmit={registrar}>
            <span className="etiqueta-acceso">ÚNETE A TALENTOESFOT</span>
            <h1>Crear cuenta</h1>
            <p className="descripcion-acceso">
              Registra tu cuenta institucional para comenzar a construir tu perfil profesional.
            </p>

            {mensaje && <div className="mensaje-error-acceso">{mensaje}</div>}

            <div className="fila-registro">
              <div className="grupo-acceso">
                <label>Nombres</label>
                <input
                  type="text"
                  value={nombres}
                  maxLength={80}
                  placeholder="Tus nombres"
                  autoComplete="given-name"
                  onChange={(e) => setNombres(e.target.value)}
                />
              </div>

              <div className="grupo-acceso">
                <label>Apellidos</label>
                <input
                  type="text"
                  value={apellidos}
                  maxLength={80}
                  placeholder="Tus apellidos"
                  autoComplete="family-name"
                  onChange={(e) => setApellidos(e.target.value)}
                />
              </div>
            </div>

            <div className="grupo-acceso">
              <label>Correo institucional</label>
              <input
                type="email"
                value={correo}
                maxLength={150}
                placeholder="usuario@epn.edu.ec"
                autoComplete="email"
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="grupo-acceso">
              <label>Contraseña</label>

              <div className="campo-contrasena">
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  maxLength={12}
                  placeholder="8 a 12 caracteres"
                  autoComplete="new-password"
                  onChange={(e) => setContrasena(e.target.value)}
                />

                <button
                  type="button"
                  className="boton-ojo"
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                >
                  {mostrarContrasena ? "◉" : "◎"}
                </button>
              </div>

              <small className="requisitos-contrasena">
                8–12 caracteres · mayúscula · minúscula · número · carácter especial
              </small>

              {fortaleza && (
                <div className={`nivel-contrasena ${fortaleza.toLowerCase().replace("é", "e")}`}>
                  Seguridad: <strong>{fortaleza}</strong>
                </div>
              )}
            </div>

            <div className="grupo-acceso">
              <label>Confirmar contraseña</label>

              <div className="campo-contrasena">
                <input
                  type={mostrarConfirmacion ? "text" : "password"}
                  value={confirmarContrasena}
                  maxLength={12}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                />

                <button
                  type="button"
                  className="boton-ojo"
                  aria-label={mostrarConfirmacion ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setMostrarConfirmacion((valor) => !valor)}
                >
                  {mostrarConfirmacion ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <label className="aceptar-terminos">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />

              <span>
                He leído y acepto los{" "}
                <Link to="/terminos-y-privacidad?desde=registro#terminos">
                  Términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link to="/terminos-y-privacidad?desde=registro#privacidad">
                  Política de privacidad
                </Link>.
              </span>
            </label>

            <button type="submit" className="boton-principal-acceso" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <div className="cambio-acceso">
              <span>¿Ya tienes una cuenta?</span>
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </div>

            <p className="aviso-legal-acceso">
              Al crear una cuenta aceptas las condiciones de uso de TalentoESFOT.
            </p>
          </form>
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

export default PaginaRegistro;