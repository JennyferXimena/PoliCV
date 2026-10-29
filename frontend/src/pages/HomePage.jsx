import { Link } from "react-router-dom";
import "../styles/home.css";

function HomePage() {
  return (
    <div className="home-page">

      {/* HEADER */}
      <header className="home-header">
        <div className="home-header-container">

          <Link to="/" className="home-brand">
            <span className="home-brand-title">
              PoliCV
            </span>

            <span className="home-brand-subtitle">
              Escuela Politécnica Nacional
            </span>
          </Link>

          <nav className="home-nav">
            <a href="#inicio">
              Inicio
            </a>

            <a href="#como-funciona">
              Cómo funciona
            </a>

            <a href="#plantillas">
              Plantillas
            </a>

            <a href="#funciones">
              Funciones
            </a>

            <a href="#acerca">
              Acerca de
            </a>
          </nav>

          <div className="home-header-actions">
            <Link
              to="/iniciar-sesion"
              className="btn-header-login"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/registrarse"
              className="btn-header-register"
            >
              Crear cuenta
            </Link>
          </div>

        </div>
      </header>


      {/* HERO */}
      <section
        className="hero-section"
        id="inicio"
      >
        <div className="hero-container">

          <div className="hero-content">

            <span className="hero-eyebrow">
              TU PERFIL PROFESIONAL, MÁS CERCA
              DE TUS OPORTUNIDADES
            </span>

            <h1>
              Construye un currículum
              que represente tu perfil
              profesional
            </h1>

            <p className="hero-description">
              Organiza tu experiencia, formación,
              habilidades y logros en un solo lugar.
              PoliCV te ayuda a crear, mejorar y
              presentar tu currículum de manera
              profesional.
            </p>

            <div className="hero-buttons">

              <Link
                to="/registrarse"
                className="btn-primary"
              >
                Crear mi currículum
                <span>→</span>
              </Link>

              <a
                href="#como-funciona"
                className="btn-secondary"
              >
                Ver cómo funciona
              </a>

            </div>

            <div className="hero-small-info">
              <span>
                Creación estructurada
              </span>

              <span>
                Sugerencias inteligentes
              </span>

              <span>
                Plantillas profesionales
              </span>
            </div>

          </div>


          <div className="hero-visual">

            <div className="hero-photo-wrapper">
              <img
                src="/images/portada2.png"
                alt="Estudiante preparando su perfil profesional"
                className="hero-photo"
              />
            </div>

            <div className="hero-cv-preview">
              <img
                src="/images/plantilla1.png"
                alt="Ejemplo de currículum profesional"
              />
            </div>

          </div>

        </div>
      </section>


      {/* BARRA DE BENEFICIOS */}
      <section className="quick-benefits">
        <div className="quick-benefits-container">

          <article className="quick-benefit">
            <img
              src="/images/icon1.png"
              alt=""
            />

            <div>
              <h3>
                Organiza tu perfil
              </h3>

              <p>
                Toda tu información en un solo lugar.
              </p>
            </div>
          </article>


          <article className="quick-benefit">
            <img
              src="/images/icon2.png"
              alt=""
            />

            <div>
              <h3>
                Mejora tu redacción
              </h3>

              <p>
                Recibe sugerencias para presentar
                mejor tu experiencia.
              </p>
            </div>
          </article>


          <article className="quick-benefit">
            <img
              src="/images/icon3.png"
              alt=""
            />

            <div>
              <h3>
                Elige una plantilla
              </h3>

              <p>
                Diseños profesionales para
                diferentes perfiles.
              </p>
            </div>
          </article>


          <article className="quick-benefit">
            <img
              src="/images/icon4.png"
              alt=""
            />

            <div>
              <h3>
                Comparte tu CV
              </h3>

              <p>
                Prepara tu información para
                compartirla profesionalmente.
              </p>
            </div>
          </article>

        </div>
      </section>


      {/* FUNCIONES */}
      <section
        className="features-section"
        id="funciones"
      >
        <div className="section-container">

          <div className="section-heading">
            <span className="section-label">
              FUNCIONALIDADES
            </span>

            <h2>
              Tu perfil, mejor presentado
            </h2>

            <p>
              Herramientas para organizar,
              mejorar y presentar tu información
              profesional de una manera clara.
            </p>
          </div>


          <div className="features-grid">

            <article className="feature-card">

              <div className="feature-card-content">

                <div className="feature-icon">
                  <img
                    src="/images/icon5.png"
                    alt=""
                  />
                </div>

                <h3>
                  Crea y organiza tu currículum
                </h3>

                <p>
                  Registra tu formación,
                  experiencia, proyectos,
                  cursos, habilidades e idiomas
                  de forma organizada.
                </p>

                <Link to="/registrarse">
                  Comenzar
                  <span>→</span>
                </Link>

              </div>

              <div className="feature-card-image">
                <img
                  src="/images/imagecv.png"
                  alt="Edición de currículum"
                />
              </div>

            </article>


            <article className="feature-card">

              <div className="feature-card-content">

                <div className="feature-icon">
                  <img
                    src="/images/icon6.png"
                    alt=""
                  />
                </div>

                <h3>
                  Mejora textos con asistencia
                  inteligente
                </h3>

                <p>
                  Recibe sugerencias para mejorar
                  la redacción, corregir errores
                  y presentar tu experiencia de
                  forma profesional.
                </p>

                <Link to="/registrarse">
                  Conocer funciones
                  <span>→</span>
                </Link>

              </div>

              <div className="feature-card-image">
                <img
                  src="/images/imageia.png"
                  alt="Asistente inteligente de PoliCV"
                />
              </div>

            </article>


            <article className="feature-card">

              <div className="feature-card-content">

                <div className="feature-icon">
                  <img
                    src="/images/icon7.png"
                    alt=""
                  />
                </div>

                <h3>
                  Prepáralo para compartir
                </h3>

                <p>
                  Presenta tu información con
                  diseños profesionales y prepara
                  tu currículum para futuras
                  oportunidades.
                </p>

                <a href="#plantillas">
                  Ver plantillas
                  <span>→</span>
                </a>

              </div>

              <div className="feature-card-image">
                <img
                  src="/images/imagepdf.png"
                  alt="Currículum profesional"
                />
              </div>

            </article>

          </div>

        </div>
      </section>


      {/* PLANTILLAS */}
      <section
        className="templates-section"
        id="plantillas"
      >
        <div className="section-container">

          <div className="templates-header">

            <div>
              <span className="section-label">
                DISEÑOS PROFESIONALES
              </span>

              <h2>
                Plantillas para presentar
                mejor tu perfil
              </h2>

              <p>
                Elige un estilo que se adapte
                a tu perfil y al tipo de
                oportunidad que buscas.
              </p>
            </div>

          </div>


          <div className="templates-grid">

            <article className="template-card">
              <div className="template-image-wrapper">
                <img
                  src="/images/plantilla1.png"
                  alt="Plantilla moderna"
                />
              </div>

              <div className="template-info">
                <div>
                  <h3>
                    Moderna
                  </h3>

                  <p>
                    Diseño actual y organizado.
                  </p>
                </div>

                <span className="template-number">
                  01
                </span>
              </div>
            </article>


            <article className="template-card">
              <div className="template-image-wrapper">
                <img
                  src="/images/plantilla2.png"
                  alt="Plantilla clásica"
                />
              </div>

              <div className="template-info">
                <div>
                  <h3>
                    Clásica
                  </h3>

                  <p>
                    Presentación sobria y profesional.
                  </p>
                </div>

                <span className="template-number">
                  02
                </span>
              </div>
            </article>


            <article className="template-card">
              <div className="template-image-wrapper">
                <img
                  src="/images/plantilla3.png"
                  alt="Plantilla elegante"
                />
              </div>

              <div className="template-info">
                <div>
                  <h3>
                    Elegante
                  </h3>

                  <p>
                    Estilo limpio y contemporáneo.
                  </p>
                </div>

                <span className="template-number">
                  03
                </span>
              </div>
            </article>

          </div>

        </div>
      </section>


      {/* CÓMO FUNCIONA */}
      <section
        className="steps-section"
        id="como-funciona"
      >
        <div className="section-container">

          <div className="section-heading">
            <span className="section-label">
              PROCESO
            </span>

            <h2>
              Cómo funciona PoliCV
            </h2>

            <p>
              Construye y mejora tu currículum
              en un proceso sencillo.
            </p>
          </div>


          <div className="steps-grid">

            <article className="step-item">

              <div className="step-number">
                01
              </div>

              <img
                src="/images/icon1.png"
                alt=""
              />

              <h3>
                Completa tu información
              </h3>

              <p>
                Registra tu formación,
                experiencia, habilidades,
                proyectos y cursos.
              </p>

            </article>


            <article className="step-item">

              <div className="step-number">
                02
              </div>

              <img
                src="/images/icon2.png"
                alt=""
              />

              <h3>
                Revisa y mejora
              </h3>

              <p>
                Utiliza las sugerencias de
                PoliCV para mejorar la
                presentación de tu información.
              </p>

            </article>


            <article className="step-item">

              <div className="step-number">
                03
              </div>

              <img
                src="/images/icon3.png"
                alt=""
              />

              <h3>
                Elige tu estilo
              </h3>

              <p>
                Selecciona la plantilla que
                mejor represente tu perfil
                profesional.
              </p>

            </article>


            <article className="step-item">

              <div className="step-number">
                04
              </div>

              <img
                src="/images/icon4.png"
                alt=""
              />

              <h3>
                Presenta tu perfil
              </h3>

              <p>
                Utiliza tu currículum para
                mostrar mejor tus capacidades
                y experiencia.
              </p>

            </article>

          </div>

        </div>
      </section>


      {/* ACERCA DE */}
      <section
        className="about-section"
        id="acerca"
      >
        <div className="about-image">
          <img
            src="/images/portada.png"
            alt="Estudiantes de la Escuela Politécnica Nacional"
          />
        </div>

        <div className="about-content">

          <span className="section-label light">
            SOBRE POLICV
          </span>

          <h2>
            Una herramienta pensada para
            acompañar tu perfil profesional
          </h2>

          <p>
            PoliCV busca facilitar la organización
            de la información académica y profesional
            de los estudiantes, brindando herramientas
            que permitan mejorar la presentación de
            sus conocimientos, experiencias y proyectos.
          </p>

          <Link
            to="/registrarse"
            className="btn-light"
          >
            Crear mi currículum
            <span>→</span>
          </Link>

        </div>
      </section>


      {/* CTA FINAL */}
      <section className="final-cta">

        <div className="final-cta-overlay" />

        <div className="final-cta-container">

          <div className="final-cta-text">

            <span>
              TU EXPERIENCIA CUENTA
            </span>

            <h2>
              Organiza tu perfil.
              Preséntalo mejor.
            </h2>

            <p>
              Construye un currículum que
              muestre de forma clara tu
              formación, proyectos y experiencia.
            </p>

          </div>


          <div className="final-cta-action">
            <Link
              to="/registrarse"
              className="btn-cta"
            >
              Crear mi currículum
              <span>→</span>
            </Link>
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="home-footer">

        <div className="home-footer-container">

          <div className="footer-brand">
            <strong>
              PoliCV
            </strong>

            <span>
              Escuela Politécnica Nacional
            </span>
          </div>


          <div className="footer-links">
            <a href="#inicio">
              Inicio
            </a>

            <a href="#como-funciona">
              Cómo funciona
            </a>

            <a href="#plantillas">
              Plantillas
            </a>

            <a href="#funciones">
              Funciones
            </a>
          </div>


          <div className="footer-social">

            <img
              src="/images/icon8.png"
              alt="LinkedIn"
            />

            <img
              src="/images/icon9.png"
              alt="Instagram"
            />

            <img
              src="/images/icon10.png"
              alt="YouTube"
            />

          </div>


          <div className="footer-copy">
            <span>
              © 2026 PoliCV
            </span>

            <span>
              Todos los derechos reservados.
            </span>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default HomePage;