import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/publicas/inicio.css";

const CONTACTOS_PERSONALES = {
  gmail: "mailto:TU_CORREO@gmail.com",
  linkedin: "https://www.linkedin.com/in/TU_USUARIO",
  github: "https://github.com/TU_USUARIO"
};

const REDES_TALENTOESFOT = {
  youtube: "https://www.youtube.com/",
  tiktok: "https://www.tiktok.com/",
  facebook: "https://www.facebook.com/",
  whatsapp: "https://www.whatsapp.com/"
};

const BENEFICIOS = [
  {
    icono: "/images/icon1.png",
    titulo: "Organiza tu perfil",
    resumen: "Toda tu información profesional en un solo lugar.",
    detalle: "Organiza tu información de forma clara y estructurada.",
    puntos: [
      "Datos personales y descripción profesional.",
      "Formación académica, idiomas y habilidades.",
      "Cursos, proyectos, prácticas y experiencia laboral.",
      "Referencias organizadas dentro del mismo currículum."
    ]
  },
  {
    icono: "/images/icon2.png",
    titulo: "Mejora tu redacción",
    resumen: "Recibe sugerencias para presentar mejor tu experiencia.",
    detalle: "Mejora la presentación de tus textos sin cambiar el sentido de tu información.",
    puntos: [
      "Corrige ortografía y gramática.",
      "Organiza mejor las ideas.",
      "Mantiene la información real registrada por el estudiante.",
      "Evita inventar experiencias, conocimientos o logros."
    ]
  },
  {
    icono: "/images/icon3.png",
    titulo: "Elige una plantilla",
    resumen: "Diseños profesionales para diferentes perfiles.",
    detalle: "Elige el diseño que mejor represente tu perfil profesional.",
    puntos: [
      "Moderna: visual y organizada.",
      "Clásica: formal y profesional.",
      "Minimalista: limpia y fácil de leer.",
      "Puedes revisar el diseño antes de generar tu PDF."
    ]
  },
  {
    icono: "/images/icon4.png",
    titulo: "Comparte tu CV",
    resumen: "Prepara tu información para presentarla profesionalmente.",
    detalle: "Prepara tu currículum para utilizarlo en oportunidades académicas y profesionales.",
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
    imagen: "/images/plantilla1.png",
    titulo: "Crea y organiza tu currículum",
    resumen: "Registra tu formación, experiencia, proyectos, cursos, habilidades e idiomas de forma organizada.",
    detalle: "TalentoESFOT guía la creación del currículum mediante una estructura definida para que la información académica y profesional permanezca organizada, sea fácil de actualizar y pueda presentarse con claridad."
  },
  {
    imagen: "/images/imageia.png",
    titulo: "Mejora textos con asistencia inteligente",
    resumen: "Corrige y mejora la presentación de tus ideas sin inventar información.",
    detalle: "La asistencia inteligente ayuda a corregir ortografía, gramática y redacción, manteniendo el significado original de la información registrada por el estudiante."
  },
  {
    imagen: "/images/imagelp.png",
    imagenSecundaria: "/images/imagepdf.png",
    titulo: "Prepáralo para compartir",
    resumen: "Presenta tu perfil con plantillas profesionales y genera tu currículum en PDF o en Landing Page.",
    detalle: "Selecciona una plantilla profesional, revisa cómo se presenta tu información y genera un archivo PDF o en una Landing Page listo para utilizar en postulaciones y oportunidades profesionales."
  }
];

const PLANTILLAS = [
  {
    nombre: "Moderna",
    numero: "01",
    imagen: "/images/plantilla1.png",
    descripcion: "Diseño actual, visual y organizado.",
    detalle: "La plantilla Moderna distribuye la información de forma visual y dinámica. Es ideal para perfiles que desean destacar habilidades, datos de contacto y experiencia con una presentación contemporánea."
  },
  {
    nombre: "Clásica",
    numero: "02",
    imagen: "/images/plantilla2.png",
    descripcion: "Presentación sobria y profesional.",
    detalle: "La plantilla Clásica prioriza una estructura formal y cronológica. Es apropiada para procesos donde se busca una lectura sencilla, tradicional y enfocada en la experiencia y formación."
  },
  {
    nombre: "Minimalista",
    numero: "03",
    imagen: "/images/plantilla3.png",
    descripcion: "Estilo limpio, claro y contemporáneo.",
    detalle: "La plantilla Minimalista utiliza espacios amplios y pocos elementos decorativos para que el contenido sea el protagonista. Es ideal para un perfil limpio y fácil de revisar."
  }
];

const PASOS = [
  { numero: "01", icono: "/images/icon1.png", titulo: "Completa tu información", descripcion: "Registra tu formación, experiencia, habilidades, proyectos y cursos." },
  { numero: "02", icono: "/images/icon2.png", titulo: "Revisa y mejora", descripcion: "Utiliza las herramientas de TalentoESFOT para mejorar la presentación de tu información." },
  { numero: "03", icono: "/images/icon3.png", titulo: "Elige tu estilo", descripcion: "Selecciona la plantilla que mejor represente tu perfil profesional." },
  { numero: "04", icono: "/images/icon4.png", titulo: "Presenta tu perfil", descripcion: "Genera tu currículum y presenta de forma clara tus capacidades y experiencia." }
];

const PREGUNTAS = [
  { pregunta: "¿Qué es TalentoESFOT?", respuesta: "TalentoESFOT es una plataforma orientada a estudiantes de la Esfot y recién graduados que permite organizar información académica y profesional para crear y presentar un currículum de manera estructurada." },
  { pregunta: "¿Cómo creo mi currículum?", respuesta: "Primero debes crear una cuenta e iniciar sesión con tu cuenta institucional. Después completas tu perfil y registras la información solicitada en las secciones del currículum." },
  { pregunta: "¿Puedo mejorar mi CV con ayuda de IA?", respuesta: "Sí. La asistencia inteligente puede ayudarte a mejorar ortografía, gramática y redacción, pero conserva el significado de tus datos y no debe inventar experiencia, conocimientos o logros." },
  { pregunta: "¿Puedo descargar mi currículum en PDF?", respuesta: "Sí. Una vez que hayas registrado la información de tu currículum podrás seleccionar un diseño disponible y generar el archivo PDF, incluso puedes generar una Landing page ." },
  { pregunta: "¿Puedo elegir diferentes plantillas?", respuesta: "Sí. TalentoESFOT dispone de las plantillas Moderna, Clásica y Minimalista. Su disponibilidad puede ser administrada desde el sistema." },
  { pregunta: "¿Mi información queda guardada?", respuesta: "Sí. La información que guardes en tu cuenta permanece asociada a tu usuario para que puedas continuar trabajando en tus currículums posteriormente." }
];

function PaginaInicio() {
  const navegar = useNavigate();
  const [sesionActiva, setSesionActiva] = useState(Boolean(localStorage.getItem("token") || sessionStorage.getItem("token")));
  const [modal, setModal] = useState(null);
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") {
        setModal(null);
        setMenuAbierto(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    setSesionActiva(false);
    setMenuAbierto(false);
    navegar("/");
  };

  const cerrarMenu = () => setMenuAbierto(false);
  const destinoPrincipal = sesionActiva ? "/estudiante" : "/registrarse";
  const textoPrincipal = sesionActiva ? "Ir a mi panel" : "Crear mi currículum";

  return (
    <div className="pagina-inicio">
      {/* ENCABEZADO */}
      <header className="encabezado-inicio">
        <div className="contenedor-encabezado">
          <Link to="/" className="marca-inicio" onClick={cerrarMenu}>
            <span className="titulo-marca">TalentoESFOT</span>
            <span className="subtitulo-marca">Escuela Politécnica Nacional</span>
          </Link>

          <button
            type="button"
            className="boton-menu"
            onClick={() => setMenuAbierto((actual) => !actual)}
            aria-label="Abrir o cerrar menú"
            aria-expanded={menuAbierto}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={menuAbierto ? "navegacion-inicio abierto" : "navegacion-inicio"}>
            <a href="#inicio" onClick={cerrarMenu}>INICIO</a>
            <a href="#funciones" onClick={cerrarMenu}>FUNCIONES</a>
            <a href="#plantillas" onClick={cerrarMenu}>PLANTILLAS</a>
            <a href="#como-funciona" onClick={cerrarMenu}>CÓMO FUNCIONA</a>
            <a href="#preguntas" onClick={cerrarMenu}>PREGUNTAS FRECUENTES</a>
            <a href="#sobre-mi" onClick={cerrarMenu}>SOBRE MÍ</a>
          </nav>

          <div className="acciones-encabezado">
            {!sesionActiva ? (
              <>
                <Link to="/iniciar-sesion" className="boton-iniciar">Iniciar sesión</Link>
                <Link to="/registrarse" className="boton-registro">Crear cuenta</Link>
              </>
            ) : (
              <>
                <Link to="/estudiante" className="boton-registro">Ir a mi panel</Link>
                <button type="button" className="boton-cerrar-sesion" onClick={cerrarSesion}>Cerrar sesión</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PORTADA */}
      <section className="portada-inicio" id="inicio">
        <div className="capa-portada" />

        <div className="contenedor-portada">
          <div className="contenido-portada">
            <span className="etiqueta-portada">TU PERFIL PROFESIONAL, MÁS CERCA DE TUS OPORTUNIDADES</span>

            <h1>Construye un currículum que represente tu perfil profesional</h1>

            <p className="descripcion-portada">
              Organiza tu experiencia, formación, habilidades y logros en un solo lugar.
              TalentoESFOT te ayuda a crear, mejorar y presentar tu currículum de manera profesional.
            </p>

            <div className="botones-portada">
              <Link to={destinoPrincipal} className="boton-principal">
                {textoPrincipal} <span>→</span>
              </Link>

              <a href="#como-funciona" className="boton-secundario">Ver cómo funciona</a>
            </div>

            <div className="informacion-portada">
              <span>Creación estructurada</span>
              <span>Sugerencias inteligentes</span>
              <span>Plantillas profesionales</span>
            </div>
          </div>

          <div className="visual-portada">
            <div className="circulo-portada">
              <img src="/images/portada.png" alt="Perfil profesional de TalentoESFOT" className="imagen-portada" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="seccion-beneficios">
        <div className="contenedor-beneficios">
          {BENEFICIOS.map((beneficio) => (
            <article className="tarjeta-beneficio" key={beneficio.titulo}>
              <div className="icono-beneficio">
                <img src={beneficio.icono} alt="" />
              </div>

              <div className="contenido-beneficio">
                <h3>{beneficio.titulo}</h3>
                <p>{beneficio.resumen}</p>

                <button
                  type="button"
                  className="boton-leer-mas"
                  onClick={() => setModal({
                    titulo: beneficio.titulo,
                    descripcion: beneficio.detalle,
                    puntos: beneficio.puntos,
                    tipo: "beneficio"
                  })}
                >
                  Leer más <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="seccion-funcionalidades" id="funciones">
        <img src="/images/icon1.png" alt="" className="decoracion-funciones decoracion-uno" />
        <img src="/images/icon3.png" alt="" className="decoracion-funciones decoracion-dos" />

        <div className="contenedor-seccion">
          <div className="encabezado-seccion">
            <span className="etiqueta-seccion">FUNCIONALIDADES</span>
            <h2>Tu perfil, mejor presentado</h2>
            <p>Herramientas para organizar, mejorar y presentar tu información profesional de una manera clara.</p>
          </div>

          <div className="cuadricula-funciones">
            {FUNCIONALIDADES.map((funcionalidad, indice) => (
              <article className="tarjeta-funcion" key={funcionalidad.titulo}>
                <div className="medio-funcion">
                  <img src={funcionalidad.imagen} alt={funcionalidad.titulo} className="imagen-funcion-principal" />

                  {funcionalidad.imagenSecundaria && (
                    <img src={funcionalidad.imagenSecundaria} alt="Documento PDF" className="imagen-funcion-flotante" />
                  )}

                  <span className="numero-funcion">0{indice + 1}</span>
                </div>

                <div className="contenido-funcion">
                  <h3>{funcionalidad.titulo}</h3>
                  <p>{funcionalidad.resumen}</p>

                  <button
                    type="button"
                    className="boton-leer-mas"
                    onClick={() => setModal({
                      titulo: funcionalidad.titulo,
                      descripcion: funcionalidad.detalle,
                      imagen: funcionalidad.imagen,
                      tipo: "funcionalidad"
                    })}
                  >
                    Leer más <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PLANTILLAS */}
      <section className="seccion-plantillas" id="plantillas">
        <div className="contenedor-seccion">
          <div className="encabezado-plantillas">
            <span className="etiqueta-seccion">DISEÑOS PROFESIONALES</span>
            <h2>Plantillas para presentar mejor tu perfil</h2>
            <p>Elige un estilo que se adapte a tu perfil y al tipo de oportunidad que buscas. Haz clic sobre una plantilla para verla con mayor detalle.</p>
          </div>

          <div className="cuadricula-plantillas">
            {PLANTILLAS.map((plantilla) => (
              <button
                type="button"
                className="tarjeta-plantilla"
                key={plantilla.nombre}
                onClick={() => setModal({
                  titulo: plantilla.nombre,
                  descripcion: plantilla.detalle,
                  imagen: plantilla.imagen,
                  tipo: "plantilla"
                })}
              >
                <div className="contenedor-imagen-plantilla">
                  <img src={plantilla.imagen} alt={`Plantilla ${plantilla.nombre}`} />
                </div>

                <div className="informacion-plantilla">
                  <div>
                    <h3>{plantilla.nombre}</h3>
                    <p>{plantilla.descripcion}</p>
                  </div>
                  <span className="numero-plantilla">{plantilla.numero}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="seccion-proceso" id="como-funciona">
        <div className="contenedor-seccion">
          <div className="encabezado-seccion encabezado-proceso">
            <span className="etiqueta-seccion clara">PROCESO</span>
            <h2>Cómo funciona TalentoESFOT</h2>
            <p>Construye y mejora tu currículum mediante un proceso sencillo.</p>
          </div>

          <div className="cuadricula-pasos">
            {PASOS.map((paso, indice) => (
              <button
                type="button"
                key={paso.numero}
                className={pasoSeleccionado === indice ? "tarjeta-paso seleccionado" : "tarjeta-paso"}
                onClick={() => setPasoSeleccionado(indice)}
              >
                <div className="numero-paso">{paso.numero}</div>
                <img src={paso.icono} alt="" />
                <h3>{paso.titulo}</h3>
                <p>{paso.descripcion}</p>
              </button>
            ))}
          </div>

          <div className="seccion-video">
            <div className="texto-video">
              <span className="etiqueta-seccion clara">CONOCE EL PROCESO</span>
              <h3>Descubre cómo utilizar TalentoESFOT</h3>
              <p>¿Quieres aprender a dominar TalentoESFOT de forma rápida y sin complicaciones? En este vídeo voy a explicar de manera práctica todo lo que necesitas saber sobre la creación de currículums vitae.</p>
            </div>

            <div className="contenedor-video">
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
      <section className="seccion-preguntas" id="preguntas">
        <div className="contenedor-seccion contenedor-preguntas">
          <div className="visual-preguntas">
            <div className="imagen-pregunta-principal">
              <img src="/images/pregunta5.jpg" alt="Perfil profesional y currículum" />
            </div>

            <div className="imagen-pregunta-secundaria">
              <img src="/images/pregunta4.jpg" alt="Tecnología e inteligencia artificial" />
            </div>
          </div>

          <div className="contenido-preguntas">
            <span className="etiqueta-seccion">PREGUNTAS FRECUENTES</span>
            <h2>Resuelve tus dudas sobre TalentoESFOT</h2>

            <p className="introduccion-preguntas">
              Encuentra respuestas rápidas sobre el funcionamiento de la plataforma y la creación de tu currículum.
            </p>

            <div className="lista-preguntas">
              {PREGUNTAS.map((item, indice) => {
                const abierta = preguntaAbierta === indice;

                return (
                  <article className={abierta ? "item-pregunta abierto" : "item-pregunta"} key={item.pregunta}>
                    <button
                      type="button"
                      className="boton-pregunta"
                      onClick={() => setPreguntaAbierta(abierta ? null : indice)}
                      aria-expanded={abierta}
                    >
                      <span>{item.pregunta}</span>
                      <strong>{abierta ? "-" : "+"}</strong>
                    </button>

                    <div className="respuesta-pregunta">
                      <p>{item.respuesta}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE MÍ Y PIE DE PÁGINA */}
      <section className="seccion-autora-pie" id="sobre-mi">
        <div className="tarjeta-autora">
          <div className="area-foto-autora">
            <div className="circulo-amarillo-autora" />
            <img src="/images/mifoto.jpg" alt="Jennyfer Guayanay" className="foto-autora" />
          </div>

          <div className="contenido-autora">
            <span className="etiqueta-seccion">SOBRE MÍ</span>
            <h2>Conoce a la autora de TalentoESFOT</h2>
            <h3>Jennyfer Guayanay</h3>
            <span className="rol-autora">Desarrollo de Software · ESFOT - Escuela Politécnica Nacional</span>

            <p>
              Soy Jennyfer Guayanay, estudiante de Desarrollo de Software en la Escuela Politécnica Nacional y autora de TalentoESFOT.
              Desarrollé esta plataforma como parte de mi proyecto de integración curricular, con el objetivo de ofrecer a estudiantes y recién graduados
              una herramienta útil para organizar su información académica y profesional, mejorar la presentación de su perfil y destacar de forma clara
              sus capacidades, conocimientos y experiencias. A través de TalentoESFOT busco combinar el desarrollo de software con una solución práctica
              que contribuya a una mejor presentación profesional.
            </p>

            <div className="enlaces-autora">
              <a href={CONTACTOS_PERSONALES.gmail} className="enlace-autora" aria-label="Gmail">
                <img src="/images/gmail.png" alt="" />
                <span>Gmail</span>
              </a>

              <a href={CONTACTOS_PERSONALES.linkedin} target="_blank" rel="noreferrer" className="enlace-autora" aria-label="LinkedIn">
                <img src="/images/linkedl.png" alt="" />
                <span>LinkedIn</span>
              </a>

              <a href={CONTACTOS_PERSONALES.github} target="_blank" rel="noreferrer" className="enlace-autora" aria-label="GitHub">
                <img src="/images/github.png" alt="" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <footer className="pie-inicio">
          <div className="contenedor-pie">
            <div className="marca-pie">
              <strong>TalentoESFOT</strong>
              <span>Escuela Politécnica Nacional</span>
              <p>
                Poca información genera una buena impresión: un Currículum vitae bien elaborado no plasma todo lo que se ha logrado,
                sino lo mejor que puedes brindar.
              </p>
            </div>

            <div className="bloque-redes-pie">
              <h3>Redes oficiales</h3>

              <div className="redes-pie">
                <a href={REDES_TALENTOESFOT.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                  <img src="/images/YouTube.png" alt="" />
                  <span>YouTube</span>
                </a>

                <a href={REDES_TALENTOESFOT.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
                  <img src="/images/ticktock.png" alt="" />
                  <span>TikTok</span>
                </a>

                <a href={REDES_TALENTOESFOT.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <img src="/images/Facebook.png" alt="" />
                  <span>Facebook</span>
                </a>

                <a href={REDES_TALENTOESFOT.whatsapp} target="_blank" rel="noreferrer" aria-label="Canal de WhatsApp">
                  <img src="/images/WhatsApp.png" alt="" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="legal-pie">
              <h3>Información legal</h3>
              <Link to="/terminos-y-privacidad#terminos">Términos y condiciones</Link>
              <Link to="/terminos-y-privacidad#privacidad">Política de privacidad</Link>
            </div>
          </div>

          <div className="inferior-pie">
            <span>© 2026 TalentoESFOT</span>
            <span>Proyecto de integración curricular - ESFOT - EPN</span>
            <span>Todos los derechos reservados.</span>
          </div>
        </footer>
      </section>

      {/* MODAL */}
      {modal && (
        <div
          className="capa-modal"
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setModal(null);
          }}
        >
          <div
            className={modal.tipo === "plantilla" ? "modal-inicio modal-plantilla" : "modal-inicio"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
          >
            <button type="button" className="boton-cerrar-modal" onClick={() => setModal(null)} aria-label="Cerrar">×</button>

            {modal.imagen && modal.tipo !== "beneficio" && (
              <div className="imagen-modal">
                <img src={modal.imagen} alt="" />
              </div>
            )}

            <div className="contenido-modal">
              <span className="etiqueta-seccion">TALENTOESFOT</span>
              <h3 id="titulo-modal">{modal.titulo}</h3>
              <p>{modal.descripcion}</p>

              {modal.puntos?.length > 0 && (
                <ul className="puntos-modal">
                  {modal.puntos.map((punto) => <li key={punto}>{punto}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaginaInicio;
