import { Link } from "react-router-dom";
import "../styles/home.css";

function HomePage() {
  return (
    <div className="home-page">

      <header className="navbar">
        <div className="logo">
          Poli<span>CV</span>
        </div>

        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#funciones">Funciones</a>
          <a href="#como-funciona">Cómo funciona</a>
        </nav>

        <div className="nav-actions">
          <Link className="register-link" to="/registrarse">
            Registrarse
          </Link>

          <Link className="login-button" to="/iniciar-sesion">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main>

        <section id="inicio" className="hero section">
          <div className="hero-content">
            <h1>
              Construye un CV que muestre tu potencial
            </h1>

            <p>
              Crea, organiza y mejora tu currículum vitae con apoyo
              de inteligencia artificial. Presenta tus habilidades,
              experiencia y formación de manera clara y profesional.
            </p>

            <div className="hero-buttons">
              <Link to="/registrarse" className="primary-home-button">
                Crear mi CV
              </Link>

              <a href="#beneficios" className="secondary-home-button">
                Conocer PoliCV
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="/images/hero-cv.png"
              alt="Representación del currículum profesional en PoliCV"
            />
          </div>
        </section>

        <section className="services-bar">
          <span>CV Inteligente</span>
          <span>Plantillas</span>
          <span>PDF</span>
          <span>Landing Profesional</span>
          <span>Ofertas laborales</span>
          <span>IA</span>
        </section>

        <section id="beneficios" className="section split-section">
          <div className="section-text">
            <span className="section-label">BENEFICIOS</span>

            <h2>
              Convierte tu experiencia en un perfil profesional
            </h2>

            <p>
              Registra tu formación académica, experiencia,
              proyectos, prácticas, cursos, habilidades e idiomas.
              PoliCV te ayuda a organizar esta información para
              construir un perfil profesional completo.
            </p>

            <p>
              Con ayuda del asistente de inteligencia artificial
              podrás mejorar la redacción de tu información sin
              agregar conocimientos o experiencias que no hayas
              proporcionado.
            </p>

            <Link to="/registrarse" className="outline-button">
              Conoce al asistente IA
            </Link>
          </div>

          <div className="section-image">
            <img
              src="/images/beneficios.png"
              alt="Perfil profesional y asistente de inteligencia artificial"
            />
          </div>
        </section>

        <section id="funciones" className="section split-section reverse">
          <div className="section-image">
            <img
              src="/images/funciones.png"
              alt="Funciones disponibles en PoliCV"
            />
          </div>

          <div className="section-text">
            <span className="section-label">FUNCIONES</span>

            <h2>
              Todo lo que necesitas para fortalecer tu perfil profesional
            </h2>

            <p>
              Desde la creación de tu currículum hasta la búsqueda
              de oportunidades relacionadas con tus conocimientos,
              PoliCV reúne diferentes herramientas en una sola
              plataforma.
            </p>

            <div className="feature-grid">
              <article>
                <h3>Crear currículum</h3>
                <p>
                  Diseña un CV profesional con plantillas modernas.
                </p>
              </article>

              <article>
                <h3>Asistente con IA</h3>
                <p>
                  Mejora la redacción de tu información profesional.
                </p>
              </article>

              <article>
                <h3>Ofertas laborales</h3>
                <p>
                  Encuentra oportunidades relacionadas con tu perfil.
                </p>
              </article>

              <article>
                <h3>Landing profesional</h3>
                <p>
                  Comparte tu perfil mediante una página profesional.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section how-section">
          <span className="section-label">CÓMO FUNCIONA</span>

          <h2>
            Crea tu perfil profesional en pocos pasos
          </h2>

          <p>
            Sigue un proceso claro y guiado para organizar tu
            información y generar un currículum profesional.
          </p>

          <div className="steps">
            <article>
              <span>1</span>
              <h3>Completa tu perfil</h3>
              <p>
                Registra tu formación, experiencia, proyectos,
                habilidades y demás información profesional.
              </p>
            </article>

            <article className="active-step">
              <span>2</span>
              <h3>Mejora con IA</h3>
              <p>
                Recibe ayuda para organizar y mejorar la redacción
                de tu información.
              </p>
            </article>

            <article>
              <span>3</span>
              <h3>Genera tu CV</h3>
              <p>
                Selecciona una plantilla, revisa tu información y
                genera tu currículum en PDF.
              </p>
            </article>
          </div>

          <h2 className="more-title">
            Más herramientas para impulsar tu crecimiento profesional
          </h2>

          <div className="extra-features">
            <article>
              <h3>Ofertas relacionadas</h3>
              <p>
                Descubre oportunidades relacionadas con tus
                habilidades y conocimientos.
              </p>
            </article>

            <article>
              <h3>Conoce tus competencias</h3>
              <p>
                Compara los requisitos laborales con tu perfil e
                identifica competencias que puedes fortalecer.
              </p>
            </article>

            <article>
              <h3>Adapta tu currículum</h3>
              <p>
                Recibe sugerencias para adaptar tu CV a una
                oportunidad laboral específica.
              </p>
            </article>
          </div>
        </section>

        <section className="cta">
          <div>
            <span>COMIENZA AHORA</span>

            <h2>
              Empieza a construir tu perfil profesional
            </h2>

            <div className="cta-buttons">
              <Link to="/registrarse">
                Crear mi cuenta
              </Link>

              <Link to="/iniciar-sesion">
                Iniciar sesión
              </Link>
            </div>
          </div>

          <img
            src="/images/cta-cv.png"
            alt="Currículums creados con PoliCV"
          />
        </section>

      </main>

      <footer>
        <div>
          <h2>PoliCV</h2>

          <p>
            Plataforma web para la creación, mejora y adaptación de
            currículums vitae con apoyo de inteligencia artificial.
          </p>
        </div>

        <div>
          <h3>PoliCV</h3>
          <a href="#inicio">Inicio</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#funciones">Funciones</a>
          <a href="#como-funciona">Cómo funciona</a>
        </div>

        <div>
          <h3>Cuenta</h3>
          <Link to="/registrarse">Registrarse</Link>
          <Link to="/iniciar-sesion">Iniciar sesión</Link>
        </div>

        <div>
          <h3>Información</h3>
          <span>Acerca del proyecto</span>
          <span>Privacidad</span>
          <span>Términos de uso</span>
        </div>

        <p className="copyright">
          © 2026 PoliCV. Todos los derechos reservados.
        </p>
      </footer>

    </div>
  );
}

export default HomePage;