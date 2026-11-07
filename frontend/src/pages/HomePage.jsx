import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import "../styles/home.css";


const CONTACTOS_PERSONALES = {
  gmail:
    "mailto:TU_CORREO@gmail.com",

  linkedin:
    "https://www.linkedin.com/in/TU_USUARIO",

  github:
    "https://github.com/TU_USUARIO"
};


const REDES_TALENTOESFOT = {
  youtube:
    "https://www.youtube.com/",

  tiktok:
    "https://www.tiktok.com/",

  facebook:
    "https://www.facebook.com/",

  whatsapp:
    "https://www.whatsapp.com/"
};


const BENEFICIOS = [
  {
    icono:
      "/images/icon1.png",

    titulo:
      "Organiza tu perfil",

    resumen:
      "Toda tu información profesional en un solo lugar.",

    detalle:
      "Organiza tu información de forma clara y estructurada.",
    puntos: [
      "Datos personales y descripción profesional.",
      "Formación académica, idiomas y habilidades.",
      "Cursos, proyectos, prácticas y experiencia laboral.",
      "Referencias organizadas dentro del mismo currículum."
    ]
  },

  {
    icono:
      "/images/icon2.png",

    titulo:
      "Mejora tu redacción",

    resumen:
      "Recibe sugerencias para presentar mejor tu experiencia.",

    detalle:
      "Mejora la presentación de tus textos sin cambiar el sentido de tu información.",
    puntos: [
      "Corrige ortografía y gramática.",
      "Organiza mejor las ideas.",
      "Mantiene la información real registrada por el estudiante.",
      "Evita inventar experiencias, conocimientos o logros."
    ]
  },

  {
    icono:
      "/images/icon3.png",

    titulo:
      "Elige una plantilla",

    resumen:
      "Diseños profesionales para diferentes perfiles.",

    detalle:
      "Elige el diseño que mejor represente tu perfil profesional.",
    puntos: [
      "Moderna: visual y organizada.",
      "Clásica: formal y profesional.",
      "Minimalista: limpia y fácil de leer.",
      "Puedes revisar el diseño antes de generar tu PDF."
    ]
  },

  {
    icono:
      "/images/icon4.png",

    titulo:
      "Comparte tu CV",

    resumen:
      "Prepara tu información para presentarla profesionalmente.",

    detalle:
      "Prepara tu currículum para utilizarlo en oportunidades académicas y profesionales.",
    puntos: [
      "Genera tu currículum en formato PDF.",
      "Utiliza un diseño profesional seleccionado previamente.",
      "Mantén tu información organizada y lista para presentar.",
      "Comparte tu perfil de una manera clara y profesional."
    ]
  }
];


const FUNCIONALIDADES = [
  {
    imagen:
      "/images/plantilla1.png",

    titulo:
      "Crea y organiza tu currículum",

    resumen:
      "Registra tu formación, experiencia, proyectos, cursos, habilidades e idiomas de forma organizada.",

    detalle:
      "TalentoESFOT guía la creación del currículum mediante una estructura definida para que la información académica y profesional permanezca organizada, sea fácil de actualizar y pueda presentarse con claridad."
  },

  {
    imagen:
      "/images/imageia.png",

    titulo:
      "Mejora textos con asistencia inteligente",

    resumen:
      "Corrige y mejora la presentación de tus ideas sin inventar información.",

    detalle:
      "La asistencia inteligente ayuda a corregir ortografía, gramática y redacción, manteniendo el significado original de la información registrada por el estudiante."
  },

  {
    imagen:
      "/images/imagelp.png",

    imagenSecundaria:
      "/images/imagepdf.png",

    titulo:
      "Prepáralo para compartir",

    resumen:
      "Presenta tu perfil con plantillas profesionales y genera tu currículum en PDF.",

    detalle:
      "Selecciona una plantilla profesional, revisa cómo se presenta tu información y genera un archivo PDF listo para utilizar en postulaciones y oportunidades profesionales."
  }
];


const PLANTILLAS = [
  {
    nombre:
      "Moderna",

    numero:
      "01",

    imagen:
      "/images/plantilla1.png",

    descripcion:
      "Diseño actual, visual y organizado.",

    detalle:
      "La plantilla Moderna distribuye la información de forma visual y dinámica. Es ideal para perfiles que desean destacar habilidades, datos de contacto y experiencia con una presentación contemporánea."
  },

  {
    nombre:
      "Clásica",

    numero:
      "02",

    imagen:
      "/images/plantilla2.png",

    descripcion:
      "Presentación sobria y profesional.",

    detalle:
      "La plantilla Clásica prioriza una estructura formal y cronológica. Es apropiada para procesos donde se busca una lectura sencilla, tradicional y enfocada en la experiencia y formación."
  },

  {
    nombre:
      "Minimalista",

    numero:
      "03",

    imagen:
      "/images/plantilla3.png",

    descripcion:
      "Estilo limpio, claro y contemporáneo.",

    detalle:
      "La plantilla Minimalista utiliza espacios amplios y pocos elementos decorativos para que el contenido sea el protagonista. Es ideal para un perfil limpio y fácil de revisar."
  }
];


const PASOS = [
  {
    numero:
      "01",

    icono:
      "/images/icon1.png",

    titulo:
      "Completa tu información",

    descripcion:
      "Registra tu formación, experiencia, habilidades, proyectos y cursos."
  },

  {
    numero:
      "02",

    icono:
      "/images/icon2.png",

    titulo:
      "Revisa y mejora",

    descripcion:
      "Utiliza las herramientas de TalentoESFOT para mejorar la presentación de tu información."
  },

  {
    numero:
      "03",

    icono:
      "/images/icon3.png",

    titulo:
      "Elige tu estilo",

    descripcion:
      "Selecciona la plantilla que mejor represente tu perfil profesional."
  },

  {
    numero:
      "04",

    icono:
      "/images/icon4.png",

    titulo:
      "Presenta tu perfil",

    descripcion:
      "Genera tu currículum y presenta de forma clara tus capacidades y experiencia."
  }
];


const PREGUNTAS = [
  {
    pregunta:
      "¿Qué es TalentoESFOT?",

    respuesta:
      "TalentoESFOT es una plataforma orientada a estudiantes y recién graduados que permite organizar información académica y profesional para crear y presentar un currículum de manera estructurada."
  },

  {
    pregunta:
      "¿Cómo creo mi currículum?",

    respuesta:
      "Primero debes crear una cuenta e iniciar sesión. Después completas tu perfil y registras la información solicitada en las secciones del currículum."
  },

  {
    pregunta:
      "¿Puedo mejorar mi CV con ayuda de IA?",

    respuesta:
      "Sí. La asistencia inteligente puede ayudarte a mejorar ortografía, gramática y redacción, pero conserva el significado de tus datos y no debe inventar experiencia, conocimientos o logros."
  },

  {
    pregunta:
      "¿Puedo descargar mi currículum en PDF?",

    respuesta:
      "Sí. Una vez que hayas registrado la información de tu currículum podrás seleccionar un diseño disponible y generar el archivo PDF."
  },

  {
    pregunta:
      "¿Puedo elegir diferentes plantillas?",

    respuesta:
      "Sí. TalentoESFOT dispone de las plantillas Moderna, Clásica y Minimalista. Su disponibilidad puede ser administrada desde el sistema."
  },

  {
    pregunta:
      "¿Mi información queda guardada?",

    respuesta:
      "Sí. La información que guardes en tu cuenta permanece asociada a tu usuario para que puedas continuar trabajando en tus currículums posteriormente."
  }
];


function HomePage() {
  const navigate =
    useNavigate();


  const [
    sesionActiva,
    setSesionActiva
  ] = useState(
    Boolean(
      localStorage.getItem(
        "token"
      ) ||
      sessionStorage.getItem(
        "token"
      )
    )
  );


  const [
    modal,
    setModal
  ] = useState(null);


  const [
    preguntaAbierta,
    setPreguntaAbierta
  ] = useState(null);


  const [
    pasoSeleccionado,
    setPasoSeleccionado
  ] = useState(null);


  const [
    menuAbierto,
    setMenuAbierto
  ] = useState(false);


  useEffect(() => {
    const cerrarConEscape =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          setModal(null);
          setMenuAbierto(false);
        }
      };


    window.addEventListener(
      "keydown",
      cerrarConEscape
    );


    return () => {
      window.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, []);


  const cerrarSesion =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "usuario"
      );

      sessionStorage.removeItem(
        "token"
      );

      sessionStorage.removeItem(
        "usuario"
      );


      setSesionActiva(false);
      setMenuAbierto(false);

      navigate("/");
    };


  const destinoPrincipal =
    sesionActiva
      ? "/estudiante"
      : "/registrarse";


  const textoPrincipal =
    sesionActiva
      ? "Ir a mi panel"
      : "Crear mi currículum";


  const cerrarMenu =
    () => {
      setMenuAbierto(false);
    };


  return (
    <div className="home-page">

      {/* HEADER */}
      <header className="home-header">
        <div className="home-header-container">

          <Link
            to="/"
            className="home-brand"
            onClick={cerrarMenu}
          >
            <span className="home-brand-title">
              TalentoESFOT
            </span>
            <span className="home-brand-subtitle">
              Escuela Politécnica Nacional
            </span>
          </Link>


          <button
            type="button"
            className="home-menu-toggle"
            onClick={() =>
              setMenuAbierto(
                (actual) =>
                  !actual
              )
            }
            aria-label="Abrir o cerrar menú"
            aria-expanded={
              menuAbierto
            }
          >
            <span />
            <span />
            <span />
          </button>


          <nav
            className={
              menuAbierto
                ? "home-nav open"
                : "home-nav"
            }
          >
            <a href="#inicio" onClick={cerrarMenu}>
              Inicio
            </a>
            <a href="#funciones" onClick={cerrarMenu}>
              Funciones
            </a>
            <a href="#plantillas" onClick={cerrarMenu}>
              Plantillas
            </a>
            <a href="#como-funciona" onClick={cerrarMenu}>
              Cómo funciona
            </a>
            <a href="#preguntas" onClick={cerrarMenu}>
              Preguntas frecuentes
            </a>
            <a href="#sobre-mi" onClick={cerrarMenu}>
              Sobre mí
            </a>
          </nav>


          <div className="home-header-actions">

            {!sesionActiva && (
              <>
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
              </>
            )}


            {sesionActiva && (
              <>
                <Link
                  to="/estudiante"
                  className="btn-header-register"
                >
                  Ir a mi panel
                </Link>

                <button
                  type="button"
                  className="btn-header-logout"
                  onClick={
                    cerrarSesion
                  }
                >
                  Cerrar sesión
                </button>
              </>
            )}

          </div>
        </div>
      </header>


      {/* HERO */}
      <section
        className="hero-section"
        id="inicio"
      >
        <div className="hero-overlay" />

        <div className="hero-container">

          <div className="hero-content">

            <span className="hero-eyebrow">
              TU PERFIL PROFESIONAL, MÁS CERCA DE TUS OPORTUNIDADES
            </span>

            <h1>
              Construye un currículum que represente tu perfil profesional
            </h1>

            <p className="hero-description">
              Organiza tu experiencia, formación,
              habilidades y logros en un solo lugar.
              TalentoESFOT te ayuda a crear, mejorar
              y presentar tu currículum de manera
              profesional.
            </p>

            <div className="hero-buttons">
              <Link
                to={
                  destinoPrincipal
                }
                className="btn-primary"
              >
                {textoPrincipal}
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
              <span>Creación estructurada</span>
              <span>Sugerencias inteligentes</span>
              <span>Plantillas profesionales</span>
            </div>
          </div>


          <div className="hero-visual">
            <div className="hero-circle-accent">
              <img
                src="/images/portada2.png"
                alt="Perfil profesional de TalentoESFOT"
                className="hero-photo"
              />
            </div>
          </div>

        </div>
      </section>


      {/* BENEFICIOS */}
      <section className="quick-benefits">
        <div className="quick-benefits-container">

          {BENEFICIOS.map(
            (beneficio) => (
              <article
                className="quick-benefit"
                key={
                  beneficio.titulo
                }
              >
                <div className="quick-benefit-icon">
                  <img
                    src={beneficio.icono}
                    alt=""
                  />
                </div>

                <div className="quick-benefit-content">
                  <h3>{beneficio.titulo}</h3>
                  <p>{beneficio.resumen}</p>

                  <button
                    type="button"
                    className="read-more-button"
                    onClick={() =>
                      setModal({
                        titulo:
                          beneficio.titulo,
                        descripcion:
                          beneficio.detalle,
                        puntos:
                          beneficio.puntos,
                        imagen:
                          beneficio.icono,
                        tipo:
                          "beneficio"
                      })
                    }
                  >
                    Leer más
                    <span>→</span>
                  </button>
                </div>
              </article>
            )
          )}

        </div>
      </section>


      {/* FUNCIONALIDADES */}
      <section
        className="features-section"
        id="funciones"
      >
        <img
          src="/images/icon1.png"
          alt=""
          className="features-decoration decoration-one"
        />

        <img
          src="/images/icon3.png"
          alt=""
          className="features-decoration decoration-two"
        />

        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">
              FUNCIONALIDADES
            </span>
            <h2>Tu perfil, mejor presentado</h2>
            <p>
              Herramientas para organizar,
              mejorar y presentar tu información
              profesional de una manera clara.
            </p>
          </div>


          <div className="features-grid">

            {FUNCIONALIDADES.map(
              (
                funcionalidad,
                indice
              ) => (
                <article
                  className="feature-card"
                  key={
                    funcionalidad.titulo
                  }
                >
                  <div className="feature-card-media">
                    <img
                      src={
                        funcionalidad.imagen
                      }
                      alt={
                        funcionalidad.titulo
                      }
                      className="feature-main-image"
                    />

                    {funcionalidad
                      .imagenSecundaria && (
                      <img
                        src={
                          funcionalidad
                            .imagenSecundaria
                        }
                        alt="Documento PDF"
                        className="feature-floating-image"
                      />
                    )}

                    <span className="feature-card-number">
                      0{indice + 1}
                    </span>
                  </div>

                  <div className="feature-card-content">
                    <h3>{funcionalidad.titulo}</h3>
                    <p>{funcionalidad.resumen}</p>

                    <button
                      type="button"
                      className="read-more-button"
                      onClick={() =>
                        setModal({
                          titulo:
                            funcionalidad
                              .titulo,
                          descripcion:
                            funcionalidad
                              .detalle,
                          imagen:
                            funcionalidad
                              .imagen,
                          tipo:
                            "funcionalidad"
                        })
                      }
                    >
                      Leer más
                      <span>→</span>
                    </button>
                  </div>
                </article>
              )
            )}

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
            <span className="section-label">
              DISEÑOS PROFESIONALES
            </span>
            <h2>
              Plantillas para presentar mejor tu perfil
            </h2>
            <p>
              Elige un estilo que se adapte a tu
              perfil y al tipo de oportunidad que buscas.
              Haz clic sobre una plantilla para verla
              con mayor detalle.
            </p>
          </div>


          <div className="templates-grid">

            {PLANTILLAS.map(
              (plantilla) => (
                <button
                  type="button"
                  className="template-card"
                  key={
                    plantilla.nombre
                  }
                  onClick={() =>
                    setModal({
                      titulo:
                        plantilla.nombre,
                      descripcion:
                        plantilla.detalle,
                      imagen:
                        plantilla.imagen,
                      tipo:
                        "plantilla"
                    })
                  }
                >
                  <div className="template-image-wrapper">
                    <img
                      src={plantilla.imagen}
                      alt={`Plantilla ${plantilla.nombre}`}
                    />
                  </div>

                  <div className="template-info">
                    <div>
                      <h3>{plantilla.nombre}</h3>
                      <p>{plantilla.descripcion}</p>
                    </div>

                    <span className="template-number">
                      {plantilla.numero}
                    </span>
                  </div>
                </button>
              )
            )}

          </div>
        </div>
      </section>


      {/* CÓMO FUNCIONA */}
      <section
        className="steps-section"
        id="como-funciona"
      >
        <div className="section-container">

          <div className="section-heading steps-heading">
            <span className="section-label light">
              PROCESO
            </span>
            <h2>
              Cómo funciona TalentoESFOT
            </h2>
            <p>
              Construye y mejora tu currículum
              mediante un proceso sencillo.
            </p>
          </div>


          <div className="steps-grid">

            {PASOS.map(
              (
                paso,
                indice
              ) => (
                <button
                  type="button"
                  key={paso.numero}
                  className={
                    pasoSeleccionado ===
                    indice
                      ? "step-item selected"
                      : "step-item"
                  }
                  onClick={() =>
                    setPasoSeleccionado(
                      indice
                    )
                  }
                >
                  <div className="step-number">
                    {paso.numero}
                  </div>

                  <img
                    src={paso.icono}
                    alt=""
                  />

                  <h3>{paso.titulo}</h3>
                  <p>{paso.descripcion}</p>
                </button>
              )
            )}

          </div>


          <div className="video-section">
            <div className="video-copy">
              <span className="section-label light">
                CONOCE EL PROCESO
              </span>
              <h3>
                Descubre cómo utilizar TalentoESFOT
              </h3>
              <p>
                Este video indica el funcionamiento de TalentoESFOT. Puedes ver cómo crear tu currículum, mejorar la presentación de tu información y generar un archivo PDF listo para compartir.
              </p>
            </div>

            <div className="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/YQd1jrYjnzo?start=70"
                title="Video de funcionamiento de TalentoESFOT"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

        </div>
      </section>


      {/* PREGUNTAS FRECUENTES */}
      <section
        className="faq-section"
        id="preguntas"
      >
        <div className="section-container faq-container">

          <div className="faq-visual">

            <div className="faq-main-image">
              <img
                src="/images/pregunta5.jpg"
                alt="TalentoESFOT y desarrollo profesional"
              />
            </div>


            <div className="faq-small-image">
              <img
                src="/images/pregunta4.jpg"
                alt="Inteligencia artificial aplicada"
              />
            </div>

          </div>


          <div className="faq-content">
            <span className="section-label">
              PREGUNTAS FRECUENTES
            </span>

            <h2>
              Resuelve tus dudas sobre TalentoESFOT
            </h2>

            <p className="faq-intro">
              Encuentra respuestas rápidas sobre el
              funcionamiento de la plataforma y la
              creación de tu currículum.
            </p>


            <div className="faq-list">

              {PREGUNTAS.map(
                (
                  item,
                  indice
                ) => {
                  const abierta =
                    preguntaAbierta ===
                    indice;

                  return (
                    <article
                      className={
                        abierta
                          ? "faq-item open"
                          : "faq-item"
                      }
                      key={item.pregunta}
                    >
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() =>
                          setPreguntaAbierta(
                            abierta
                              ? null
                              : indice
                          )
                        }
                        aria-expanded={
                          abierta
                        }
                      >
                        <span>{item.pregunta}</span>
                        <strong>
                          {abierta ? "−" : "+"}
                        </strong>
                      </button>

                      <div className="faq-answer">
                        <p>{item.respuesta}</p>
                      </div>
                    </article>
                  );
                }
              )}

            </div>
          </div>

        </div>
      </section>


      {/* SOBRE MÍ + FOOTER */}
      <section
        className="author-footer-section"
        id="sobre-mi"
      >
        <div className="author-card">

          <div className="author-photo-area">
            <div className="author-yellow-circle" />
            <img
              src="/images/mifoto.jpg"
              alt="Jennyfer Guayanay"
              className="author-photo"
            />
          </div>


          <div className="author-content">
            <span className="section-label">
              SOBRE MÍ
            </span>

            <h2>
              Conoce a la autora de TalentoESFOT
            </h2>

            <h3>
              Jennyfer Guayanay
            </h3>

            <span className="author-role">
              Desarrollo de Software · ESFOT - Escuela Politécnica Nacional
            </span>

            <p>
              Soy Jennyfer Guayanay, estudiante de
              Desarrollo de Software en la Escuela
              Politécnica Nacional y autora de
              TalentoESFOT. Desarrollé esta plataforma
              como parte de mi proyecto de integración
              curricular, con el objetivo de ofrecer a
              estudiantes y recién graduados una
              herramienta útil para organizar su
              información académica y profesional,
              mejorar la presentación de su perfil y
              destacar de forma clara sus capacidades,
              conocimientos y experiencias. A través de
              TalentoESFOT busco combinar el desarrollo
              de software con una solución práctica que
              contribuya a una mejor presentación
              profesional.
            </p>


            <div className="author-links">
              <a
                href={CONTACTOS_PERSONALES.gmail}
                className="author-link"
                aria-label="Gmail"
              >
                <img src="/images/gmail.png" alt="" />
                <span>Gmail</span>
              </a>

              <a
                href={CONTACTOS_PERSONALES.linkedin}
                target="_blank"
                rel="noreferrer"
                className="author-link"
                aria-label="LinkedIn"
              >
                <img src="/images/linkedl.png" alt="" />
                <span>LinkedIn</span>
              </a>

              <a
                href={CONTACTOS_PERSONALES.github}
                target="_blank"
                rel="noreferrer"
                className="author-link"
                aria-label="GitHub"
              >
                <img src="/images/github.png" alt="" />
                <span>GitHub</span>
              </a>
            </div>

          </div>
        </div>


        <footer className="home-footer">
          <div className="home-footer-container">

            <div className="footer-brand">
              <strong>
                TalentoESFOT
              </strong>

              <span>
                Escuela Politécnica Nacional
              </span>

              <p>
                Poca información genera una buena
                impresión: un Currículum vitae bien
                elaborado no plasma todo lo que se ha
                logrado, sino lo mejor que puedes brindar.
              </p>
            </div>


            <div className="footer-social-block">
              <h3>
                Redes oficiales
              </h3>

              <div className="footer-social">
                <a
                  href={REDES_TALENTOESFOT.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  <img src="/images/YouTube.png" alt="" />
                  <span>YouTube</span>
                </a>

                <a
                  href={REDES_TALENTOESFOT.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                >
                  <img src="/images/ticktock.png" alt="" />
                  <span>TikTok</span>
                </a>

                <a
                  href={REDES_TALENTOESFOT.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <img src="/images/Facebook.png" alt="" />
                  <span>Facebook</span>
                </a>

                <a
                  href={REDES_TALENTOESFOT.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Canal de WhatsApp"
                >
                  <img src="/images/WhatsApp.png" alt="" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>


            <div className="footer-legal">
              <h3>
                Información legal
              </h3>

              <Link to="/terminos-y-privacidad#terminos">
                Términos y condiciones
              </Link>

              <Link to="/terminos-y-privacidad#privacidad">
                Política de privacidad
              </Link>
            </div>

          </div>


          <div className="footer-bottom">
            <span>
              © 2026 TalentoESFOT
            </span>
            <span>
              Proyecto de integración curricular - ESFOT - EPN
            </span>
            <span>
              Todos los derechos reservados.
            </span>
          </div>
        </footer>
      </section>


      {/* MODAL GENERAL */}
      {modal && (
        <div
          className="home-modal-overlay"
          role="presentation"
          onMouseDown={
            (event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setModal(null);
              }
            }
          }
        >
          <div
            className={
              modal.tipo ===
              "plantilla"
                ? "home-modal template-preview-modal"
                : "home-modal"
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-modal-title"
          >
            <button
              type="button"
              className="home-modal-close"
              onClick={() =>
                setModal(null)
              }
              aria-label="Cerrar"
            >
              ×
            </button>

            {modal.imagen &&
              modal.tipo !== "beneficio" && (
              <div className="home-modal-image">
                <img
                  src={modal.imagen}
                  alt=""
                />
              </div>
            )}

            <div className="home-modal-content">
              <span className="section-label">
                TALENTOESFOT
              </span>
              <h3 id="home-modal-title">
                {modal.titulo}
              </h3>
              <p>
                {modal.descripcion}
              </p>

              {modal.puntos && (
                <ul className="home-modal-points">
                  {modal.puntos.map(
                    (punto) => (
                      <li key={punto}>
                        {punto}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


export default HomePage;
