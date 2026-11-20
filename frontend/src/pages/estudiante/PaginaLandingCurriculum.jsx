import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";
import "../../styles/estudiante/landingCurriculum.css";

function fecha(valor) {
  if (!valor) return "";

  const cadena = String(valor);

  if (/^\d{4}-\d{2}-\d{2}/.test(cadena)) {
    const [anio, mes] =
      cadena.substring(0, 10).split("-");

    return `${mes}/${anio}`;
  }

  return cadena;
}

function texto(valor) {
  return String(valor || "").trim();
}

function obtenerUrlBackend() {
  return String(api.defaults.baseURL || "")
    .replace(/\/api\/?$/, "");
}

function urlArchivo(ruta) {
  if (!texto(ruta)) return "";

  if (/^https?:\/\//i.test(ruta)) {
    return ruta;
  }

  return `${obtenerUrlBackend()}${
    ruta.startsWith("/") ? "" : "/"
  }${ruta}`;
}

function obtenerAnexos(contenido) {
  const anexos = [];

  const agregar = (
    seccion,
    titulo,
    archivo,
    enlace
  ) => {
    if (!texto(archivo) && !texto(enlace)) {
      return;
    }

    anexos.push({
      seccion,
      titulo: texto(titulo) || "Evidencia",
      archivo: texto(archivo),
      enlace: texto(enlace)
    });
  };

  (contenido.formacion || []).forEach((item) => {
    agregar(
      "Formación académica",
      item.titulo || item.institucion,
      item.evidencia_archivo,
      item.evidencia_url
    );
  });

  (contenido.cursos || []).forEach((item) => {
    agregar(
      "Cursos y certificaciones",
      item.nombre,
      item.evidencia_archivo,
      item.evidencia_url || item.enlace
    );
  });

  (contenido.proyectos || []).forEach((item) => {
    agregar(
      "Proyectos",
      item.nombre,
      item.evidencia_archivo,
      item.evidencia_url || item.enlace
    );
  });

  (contenido.practicas || []).forEach((item) => {
    agregar(
      "Prácticas",
      item.institucion,
      item.evidencia_archivo,
      item.evidencia_url
    );
  });

  (contenido.experiencia || []).forEach((item) => {
    agregar(
      "Experiencia laboral",
      item.cargo || item.empresa,
      item.evidencia_archivo,
      item.evidencia_url
    );
  });

  return anexos;
}

function VistaLanding({ datos, landing }) {
  const perfil = datos?.perfil || {};
  const curriculum = datos?.curriculum || {};
  const contenido = datos?.contenido || {};
  const anexos = obtenerAnexos(contenido);

  const foto = perfil.fotografia_url
    ? urlArchivo(perfil.fotografia_url)
    : "";

  const nombre =
    `${texto(perfil.nombres)} ${texto(perfil.apellidos)}`
      .trim() ||
    "Estudiante ESFOT";

  return (
    <div
      className={`cv-public-page tema-${landing.tema} paleta-${landing.paleta}`}
    >
      <header className="cv-public-nav">
        <div className="cv-public-logo">
          <span>CV</span>
          <strong>{nombre}</strong>
        </div>

        <nav>
          <a href="#sobre-mi">Sobre mí</a>
          <a href="#formacion">Formación</a>

          {contenido.proyectos?.length > 0 && (
            <a href="#proyectos">Proyectos</a>
          )}

          {anexos.length > 0 && (
            <a href="#anexos">Anexos</a>
          )}
        </nav>
      </header>

      <main>
        <section className="cv-public-hero">
          <div className="cv-public-hero-copy">
            <span className="cv-public-eyebrow">
              PERFIL PROFESIONAL
            </span>

            <h1>{nombre}</h1>

            <h2>
              {texto(curriculum.titulo_profesional) ||
                texto(perfil.titulo_profesional) ||
                texto(perfil.carrera)}
            </h2>

            {texto(contenido.descripcion) && (
              <p>{contenido.descripcion}</p>
            )}

            <div className="cv-public-contact">
              {perfil.email && (
                <a href={`mailto:${perfil.email}`}>
                  {perfil.email}
                </a>
              )}

              {perfil.telefono && (
                <span>{perfil.telefono}</span>
              )}

              {perfil.ciudad_pais && (
                <span>{perfil.ciudad_pais}</span>
              )}
            </div>

            <div className="cv-public-social">
              {perfil.linkedin_url && (
                <a
                  href={perfil.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              )}

              {perfil.github_url && (
                <a
                  href={perfil.github_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}

              {perfil.sitio_web && (
                <a
                  href={perfil.sitio_web}
                  target="_blank"
                  rel="noreferrer"
                >
                  Portafolio
                </a>
              )}
            </div>
          </div>

          <div className="cv-public-photo-wrap">
            {foto ? (
              <img
                src={foto}
                alt={nombre}
                className="cv-public-photo"
              />
            ) : (
              <div className="cv-public-photo-placeholder">
                {nombre.charAt(0)}
              </div>
            )}
          </div>
        </section>

        <section
          id="sobre-mi"
          className="cv-public-section cv-public-soft"
        >
          <div className="cv-public-section-title">
            <span>COMPETENCIAS</span>
            <h2>Habilidades e idiomas</h2>
          </div>

          <div className="cv-public-two-columns">
            {contenido.habilidades?.length > 0 && (
              <article className="cv-public-card">
                <h3>Habilidades</h3>

                <div className="cv-public-tags">
                  {contenido.habilidades.map(
                    (habilidad, indice) => (
                      <span key={indice}>
                        {habilidad.nombre}
                        {habilidad.nivel
                          ? ` · ${habilidad.nivel}`
                          : ""}
                      </span>
                    )
                  )}
                </div>
              </article>
            )}

            {contenido.idiomas?.length > 0 && (
              <article className="cv-public-card">
                <h3>Idiomas</h3>

                <div className="cv-public-list-simple">
                  {contenido.idiomas.map(
                    (idioma, indice) => (
                      <div key={indice}>
                        <strong>
                          {idioma.idioma}
                        </strong>
                        <span>{idioma.nivel}</span>
                      </div>
                    )
                  )}
                </div>
              </article>
            )}
          </div>
        </section>

        <section
          id="formacion"
          className="cv-public-section"
        >
          <div className="cv-public-section-title">
            <span>TRAYECTORIA</span>
            <h2>Formación académica</h2>
          </div>

          <div className="cv-public-timeline">
            <article>
              <span className="cv-public-dot" />

              <div>
                <h3>{perfil.carrera}</h3>
                <strong>
                  Escuela Politécnica Nacional - ESFOT
                </strong>
                <p>
                  {perfil.estado_academico ||
                    "Formación actual"}
                </p>
              </div>
            </article>

            {(contenido.formacion || []).map(
              (item, indice) => (
                <article key={indice}>
                  <span className="cv-public-dot" />

                  <div>
                    <h3>{item.titulo}</h3>
                    <strong>
                      {item.institucion}
                    </strong>
                    <p>
                      {[
                        fecha(item.fecha_inicio),
                        item.fecha_fin
                          ? fecha(item.fecha_fin)
                          : "Actualidad",
                        item.ciudad_pais
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {contenido.cursos?.length > 0 && (
          <section className="cv-public-section cv-public-soft">
            <div className="cv-public-section-title">
              <span>APRENDIZAJE</span>
              <h2>Cursos y certificaciones</h2>
            </div>

            <div className="cv-public-grid">
              {contenido.cursos.map(
                (curso, indice) => (
                  <article
                    className="cv-public-card"
                    key={indice}
                  >
                    <span className="cv-public-card-label">
                      {curso.tipo || "Curso"}
                    </span>

                    <h3>{curso.nombre}</h3>

                    <strong>
                      {curso.institucion}
                    </strong>

                    <p>
                      {[
                        fecha(curso.fecha_obtencion),
                        curso.horas_duracion
                          ? `${curso.horas_duracion} horas`
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    {curso.descripcion && (
                      <p>{curso.descripcion}</p>
                    )}
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {contenido.proyectos?.length > 0 && (
          <section
            id="proyectos"
            className="cv-public-section"
          >
            <div className="cv-public-section-title">
              <span>PORTAFOLIO</span>
              <h2>Proyectos</h2>
            </div>

            <div className="cv-public-grid">
              {contenido.proyectos.map(
                (proyecto, indice) => (
                  <article
                    className="cv-public-card cv-public-project"
                    key={indice}
                  >
                    <div className="cv-public-project-top">
                      <span>
                        {proyecto.tipo_proyecto}
                      </span>

                      <small>
                        {proyecto.estado}
                      </small>
                    </div>

                    <h3>{proyecto.nombre}</h3>

                    {proyecto.rol && (
                      <strong>
                        Rol: {proyecto.rol}
                      </strong>
                    )}

                    <p>
                      {proyecto.descripcion}
                    </p>

                    {proyecto.tecnologias && (
                      <div className="cv-public-tags">
                        {proyecto.tecnologias
                          .split(",")
                          .map((tecnologia) => tecnologia.trim())
                          .filter(Boolean)
                          .map((tecnologia, posicion) => (
                            <span key={posicion}>
                              {tecnologia}
                            </span>
                          ))}
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {contenido.practicas?.length > 0 && (
          <section className="cv-public-section cv-public-soft">
            <div className="cv-public-section-title">
              <span>EXPERIENCIA FORMATIVA</span>
              <h2>Prácticas</h2>
            </div>

            <div className="cv-public-grid">
              {contenido.practicas.map(
                (practica, indice) => (
                  <article
                    className="cv-public-card"
                    key={indice}
                  >
                    <span className="cv-public-card-label">
                      {practica.tipo === "comunitaria"
                        ? "Comunitaria"
                        : practica.tipo === "laboral"
                          ? "Laboral"
                          : practica.tipo}
                    </span>

                    <h3>{practica.institucion}</h3>

                    <strong>
                      {[
                        practica.area ||
                          practica.cargo_area,
                        practica.rol_funcion,
                        practica.modalidad
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </strong>

                    <p>
                      {practica.actividades ||
                        practica.descripcion}
                    </p>
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {contenido.experiencia?.length > 0 && (
          <section className="cv-public-section">
            <div className="cv-public-section-title">
              <span>TRAYECTORIA PROFESIONAL</span>
              <h2>Experiencia laboral</h2>
            </div>

            <div className="cv-public-timeline">
              {contenido.experiencia.map(
                (experiencia, indice) => (
                  <article key={indice}>
                    <span className="cv-public-dot" />

                    <div>
                      <h3>
                        {experiencia.cargo ||
                          experiencia.empresa}
                      </h3>

                      <strong>
                        {[
                          experiencia.empresa,
                          experiencia.tipo_empleo,
                          experiencia.modalidad
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </strong>

                      <p>
                        {[
                          fecha(experiencia.fecha_inicio),
                          experiencia.actualmente
                            ? "Actualidad"
                            : fecha(experiencia.fecha_fin),
                          experiencia.ciudad_pais
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      <p>
                        {experiencia.descripcion}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {contenido.referencias?.length > 0 && (
          <section className="cv-public-section cv-public-soft">
            <div className="cv-public-section-title">
              <span>REFERENCIAS</span>
              <h2>Personas de referencia</h2>
            </div>

            <div className="cv-public-grid">
              {contenido.referencias.map(
                (referencia, indice) => (
                  <article
                    className="cv-public-card"
                    key={indice}
                  >
                    <span className="cv-public-card-label">
                      {referencia.tipo_referencia}
                    </span>

                    <h3>
                      {referencia.nombre_completo}
                    </h3>

                    <strong>
                      {referencia.cargo}
                    </strong>

                    <p>
                      {referencia.empresa_institucion}
                    </p>

                    <p>
                      {[
                        referencia.email,
                        referencia.telefono
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {anexos.length > 0 && (
          <section
            id="anexos"
            className="cv-public-section"
          >
            <div className="cv-public-section-title">
              <span>EVIDENCIAS</span>
              <h2>Anexos</h2>
              <p>
                Documentos, imágenes y enlaces que respaldan
                la información del currículum.
              </p>
            </div>

            <div className="cv-public-annex-grid">
              {anexos.map((anexo, indice) => {
                const archivoUrl =
                  anexo.archivo
                    ? urlArchivo(anexo.archivo)
                    : "";

                const esImagen =
                  /\.(jpg|jpeg|png)$/i.test(
                    anexo.archivo
                  );

                return (
                  <article
                    className="cv-public-annex-card"
                    key={indice}
                  >
                    {archivoUrl && esImagen ? (
                      <img
                        src={archivoUrl}
                        alt={anexo.titulo}
                      />
                    ) : (
                      <div className="cv-public-annex-icon">
                        DOC
                      </div>
                    )}

                    <div>
                      <span>{anexo.seccion}</span>
                      <h3>{anexo.titulo}</h3>

                      <div className="cv-public-annex-actions">
                        {archivoUrl && (
                          <a
                            href={archivoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver evidencia
                          </a>
                        )}

                        {anexo.enlace && (
                          <a
                            href={anexo.enlace}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Abrir enlace
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="cv-public-footer">
        <strong>PoliCV</strong>
        <span>
          Currículum profesional digital
        </span>
      </footer>
    </div>
  );
}

function PaginaLandingCurriculum() {
  const { id, slug } = useParams();
  const navigate = useNavigate();

  const esPublica = Boolean(slug);

  const [datos, setDatos] = useState(null);
  const [landing, setLanding] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    const ruta = esPublica
      ? `/landing/publica/${slug}`
      : `/landing/${id}`;

    api
      .get(ruta)
      .then((response) => {
        if (!activo) return;

        setDatos(response.data?.datos || null);
        setLanding(response.data?.landing || null);
      })
      .catch((errorPeticion) => {
        if (!activo) return;

        setError(
          errorPeticion.response?.data?.mensaje ||
          "No se pudo cargar la Landing Page"
        );
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [id, slug, esPublica]);

  const guardarDiseno = async () => {
    if (!landing) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const response = await api.put(
        `/landing/${id}`,
        {
          tema: landing.tema,
          paleta: landing.paleta
        }
      );

      setLanding(response.data?.landing);
      setMensaje("Diseño guardado correctamente");
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo guardar el diseño"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPublicacion = async () => {
    if (!landing) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const response = await api.patch(
        `/landing/${id}/publicacion`,
        {
          publicada: !landing.publicada
        }
      );

      setLanding(response.data?.landing);
      setMensaje(response.data?.mensaje);
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo cambiar la publicación"
      );
    } finally {
      setGuardando(false);
    }
  };

  const copiarEnlace = async () => {
    if (!landing?.slug) return;

    const url =
      `${window.location.origin}/cv/${landing.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setMensaje("Enlace copiado");
    } catch {
      setError("No se pudo copiar el enlace");
    }
  };

  if (cargando) {
    return (
      <main className="landing-loading">
        Cargando Landing Page...
      </main>
    );
  }

  if (error && (!datos || !landing)) {
    return (
      <main className="landing-loading">
        <div>
          <h2>Landing Page no disponible</h2>
          <p>{error}</p>

          {!esPublica && (
            <button
              type="button"
              onClick={() =>
                navigate("/estudiante/curriculums")
              }
            >
              Volver a mis currículums
            </button>
          )}
        </div>
      </main>
    );
  }

  if (esPublica) {
    return (
      <VistaLanding
        datos={datos}
        landing={landing}
      />
    );
  }

  return (
    <div className="student-page">
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-logo">P</div>

          <div>
            <h2>PoliCV</h2>
            <span>Estudiante</span>
          </div>
        </div>

        <nav className="student-menu">
          <Link to="/estudiante">
            <span>01</span>
            Inicio
          </Link>

          <Link to="/perfil">
            <span>02</span>
            Mi perfil
          </Link>

          <Link
            to="/estudiante/curriculums"
            className="active"
          >
            <span>03</span>
            Mis currículums
          </Link>

          <Link to="/estudiante/asistente-ia">
            <span>04</span>
            Asistente IA
          </Link>

          <Link to="/estudiante/propuestas">
            <span>05</span>
            Propuestas de mejora
          </Link>
        </nav>
      </aside>

      <main className="student-main">
        <header className="student-header">
          <div>
            <span className="student-header-label">
              LANDING PAGE
            </span>

            <h1>
              {datos?.curriculum?.nombre}
            </h1>

            <p>
              Personaliza y publica la página profesional
              de este currículum.
            </p>
          </div>
        </header>

        <div className="student-content">
          <section className="landing-editor">
            <div className="landing-editor-header">
              <div>
                <span>PERSONALIZACIÓN</span>
                <h2>Diseño de la Landing Page</h2>
                <p>
                  El tema y los colores cambian la apariencia,
                  pero no modifican tu información.
                </p>
              </div>

              <Link
                to={`/estudiante/curriculums/${id}`}
                className="landing-back"
              >
                ← Gestionar currículum
              </Link>
            </div>

            <div className="landing-editor-controls">
              <div className="landing-control">
                <label>Tema</label>

                <div className="landing-theme-options">
                  {["claro", "oscuro"].map((tema) => (
                    <button
                      type="button"
                      key={tema}
                      className={
                        landing.tema === tema
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setLanding((anterior) => ({
                          ...anterior,
                          tema
                        }))
                      }
                    >
                      {tema === "claro"
                        ? "Claro"
                        : "Oscuro"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="landing-control">
                <label>Paleta de colores</label>

                <div className="landing-palette-options">
                  {[
                    ["verde", "Verde"],
                    ["azul", "Azul"],
                    ["amarillo", "Amarillo / Naranja"],
                    ["rosa", "Rosa / Rojo"],
                    ["morado", "Morado / Lila"]
                  ].map(([paleta, nombre]) => (
                    <button
                      type="button"
                      key={paleta}
                      title={nombre}
                      className={`landing-palette-dot ${paleta} ${
                        landing.paleta === paleta
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setLanding((anterior) => ({
                          ...anterior,
                          paleta
                        }))
                      }
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </div>

              <div className="landing-editor-actions">
                <button
                  type="button"
                  onClick={guardarDiseno}
                  disabled={guardando}
                >
                  Guardar diseño
                </button>

                <button
                  type="button"
                  className={
                    landing.publicada
                      ? "unpublish"
                      : "publish"
                  }
                  onClick={cambiarPublicacion}
                  disabled={guardando}
                >
                  {landing.publicada
                    ? "Despublicar"
                    : "Publicar"}
                </button>

                {landing.publicada && (
                  <>
                    <button
                      type="button"
                      className="secondary"
                      onClick={copiarEnlace}
                    >
                      Copiar enlace
                    </button>

                    <a
                      href={`/cv/${landing.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="landing-public-link"
                    >
                      Abrir página pública
                    </a>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="landing-message error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="landing-message success">
                {mensaje}
              </div>
            )}
          </section>

          <section className="landing-preview-wrap">
            <div className="landing-preview-label">
              <span>VISTA PREVIA</span>
              <strong>
                Así se verá tu página pública
              </strong>
            </div>

            <div className="landing-preview">
              <VistaLanding
                datos={datos}
                landing={landing}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PaginaLandingCurriculum;
