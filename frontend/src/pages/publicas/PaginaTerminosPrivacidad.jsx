// Página de términos y privacidad de TalentoESFOT
// Explica las condiciones de uso y el tratamiento de la información.

import { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "../../styles/publicas/terminosPrivacidad.css";

function PaginaTerminosPrivacidad() {
  const ubicacion = useLocation();
  const [parametros] = useSearchParams();
  const desdeRegistro = parametros.get("desde") === "registro";

  useEffect(() => {
    if (!ubicacion.hash) return;

    const elemento = document.querySelector(ubicacion.hash);
    if (!elemento) return;

    const temporizador = setTimeout(() => {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => clearTimeout(temporizador);
  }, [ubicacion.hash]);

  return (
    <div className="pagina-legal">

      {/* ENCABEZADO */}
      <header className="encabezado-legal">
        <div className="contenedor-encabezado-legal">
          <Link to="/" className="marca-legal">
            <strong>TalentoESFOT</strong>
            <span>Escuela Politécnica Nacional</span>
          </Link>

          {desdeRegistro ? (
            <Link to="/registrarse" className="boton-volver-legal">
              ← Continuar registrándome
            </Link>
          ) : (
            <Link to="/" className="boton-volver-legal">
              Volver al inicio
            </Link>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido-principal-legal">
        <section className="portada-legal">
          <span>INFORMACIÓN LEGAL</span>
          <h1>Términos y privacidad</h1>
          <p>
            Conoce las condiciones de uso de TalentoESFOT y cómo se utiliza la información registrada dentro de la plataforma.
          </p>
        </section>

        <div className="distribucion-legal">

          {/* MENÚ LATERAL */}
          <aside className="menu-legal">
            <a href="#terminos">Términos y condiciones</a>
            <a href="#privacidad">Política de privacidad</a>

            {desdeRegistro && (
              <Link to="/registrarse" className="boton-continuar-registro">
                ← Continuar registrándome
              </Link>
            )}
          </aside>

          {/* CONTENIDO LEGAL */}
          <div className="contenido-legal">

            <section id="terminos" className="seccion-legal">
              <span className="etiqueta-legal">TÉRMINOS Y CONDICIONES</span>
              <h2>Condiciones de uso de TalentoESFOT</h2>

              <h3>1. Finalidad de la plataforma</h3>
              <p>
                TalentoESFOT es una plataforma desarrollada con fines académicos para apoyar a estudiantes y recién graduados en la organización, elaboración, mejora y presentación de su currículum vitae.
              </p>

              <h3>2. Registro y acceso</h3>
              <p>
                Para utilizar las funcionalidades privadas de la plataforma, el usuario debe crear una cuenta utilizando la información solicitada por el sistema. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
              </p>

              <h3>3. Información registrada</h3>
              <p>
                El usuario es responsable de que la información académica, profesional y personal registrada en TalentoESFOT sea correcta, actual y corresponda a su experiencia real.
              </p>

              <h3>4. Asistencia inteligente</h3>
              <p>
                Las funciones de asistencia inteligente están diseñadas para apoyar la mejora de la redacción y presentación de los textos. El usuario debe revisar las sugerencias antes de utilizarlas y confirmar que mantienen el significado de la información original.
              </p>

              <h3>5. Uso adecuado</h3>
              <p>
                El usuario se compromete a utilizar TalentoESFOT únicamente para fines legítimos relacionados con la creación y presentación de su perfil académico y profesional.
              </p>

              <h3>6. Disponibilidad del servicio</h3>
              <p>
                Al tratarse de un proyecto académico, algunas funcionalidades pueden ser modificadas, mejoradas o temporalmente interrumpidas durante el desarrollo, mantenimiento o actualización del sistema.
              </p>

              <h3>7. Aceptación</h3>
              <p>
                Al crear una cuenta y utilizar TalentoESFOT, el usuario declara haber leído y aceptado estos términos y condiciones.
              </p>
            </section>

            <section id="privacidad" className="seccion-legal">
              <span className="etiqueta-legal">POLÍTICA DE PRIVACIDAD</span>
              <h2>Tratamiento de la información</h2>

              <h3>1. Datos recopilados</h3>
              <p>
                TalentoESFOT puede almacenar los datos necesarios para el funcionamiento de la cuenta y la creación del currículum, como nombres, correo electrónico, información académica, habilidades, proyectos, cursos, prácticas, experiencia laboral y referencias.
              </p>

              <h3>2. Uso de los datos</h3>
              <p>
                La información registrada se utiliza para permitir al usuario administrar su perfil, crear currículums, utilizar las herramientas disponibles y generar las presentaciones correspondientes.
              </p>

              <h3>3. Contraseñas y seguridad</h3>
              <p>
                Las contraseñas no se almacenan en texto plano. TalentoESFOT utiliza mecanismos de autenticación y medidas técnicas orientadas a proteger el acceso a las cuentas de usuario.
              </p>

              <h3>4. Sesión del usuario</h3>
              <p>
                El usuario podrá elegir mantener su sesión iniciada cuando utilice un dispositivo personal. En equipos compartidos o públicos se recomienda no utilizar esta opción y cerrar la sesión desde la plataforma al finalizar.
              </p>

              <h3>5. Información del currículum</h3>
              <p>
                La información privada del currículum permanece asociada a la cuenta del usuario. Solo las funcionalidades que el usuario decida publicar o compartir podrán ser visibles fuera de su sesión.
              </p>

              <h3>6. Servicios externos</h3>
              <p>
                Algunas funciones pueden depender de servicios externos necesarios para el funcionamiento de la plataforma. El uso de dichos servicios estará limitado a las funcionalidades implementadas por TalentoESFOT.
              </p>

              <h3>7. Responsabilidad del usuario</h3>
              <p>
                El usuario debe evitar compartir sus credenciales, utilizar contraseñas seguras y cerrar sesión cuando acceda desde equipos que no sean de su uso personal.
              </p>

              <h3>8. Actualizaciones</h3>
              <p>
                Esta política podrá actualizarse cuando se incorporen nuevas funcionalidades o sea necesario precisar el tratamiento de la información dentro del proyecto.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="pie-legal">
        <div>
          <strong>TalentoESFOT</strong>
          <span>Escuela Politécnica Nacional</span>
        </div>

        <p>© 2026 TalentoESFOT · Proyecto de integración curricular - ESFOT - EPN</p>
      </footer>

    </div>
  );
}

export default PaginaTerminosPrivacidad;