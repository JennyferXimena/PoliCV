import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/estudiante/estudiante.css";
import "../../styles/estudiante/detalleCurriculum.css";

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function fechaInput(valor) {
  return valor ? String(valor).substring(0, 10) : "";
}

function contarPalabras(texto = "") {
  return String(texto).trim().split(/\s+/).filter(Boolean).length;
}

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function crearContenidoInicial() {
  return {
    descripcion: "",
    formacion: [],
    idiomas: [],
    habilidades: [],
    cursos: [],
    proyectos: [],
    practicas: [],
    experiencia: [],
    referencias: []
  };
}

function normalizarContenido(respuesta) {
  const contenido = respuesta.contenido || {};

  return {
    descripcion: contenido.descripcion || "",

    formacion: (contenido.formacion || []).map((item) => ({
      ...item,
      fecha_inicio: fechaInput(item.fecha_inicio),
      fecha_fin: fechaInput(item.fecha_fin),
      evidencia_archivo: item.evidencia_archivo || ""
    })),

    idiomas: (contenido.idiomas || []).map((item) => ({
      ...item,
      nivel: ["Básico", "Intermedio", "Avanzado"].includes(item.nivel)
        ? item.nivel
        : "",
      tiene_certificado: Boolean(
        item.tiene_certificado ||
        item.evidencia_archivo
      ),
      evidencia_archivo:
        item.evidencia_archivo || ""
    })),

    habilidades: (contenido.habilidades || []).map((item) => ({
      ...item,
      nivel: ["Básico", "Intermedio", "Avanzado"].includes(item.nivel)
        ? item.nivel
        : ""
    })),

    cursos: (contenido.cursos || []).map((item) => ({
      ...item,
      tipo: item.tipo || "",
      fecha_obtencion: fechaInput(item.fecha_obtencion),
      fecha_expiracion: fechaInput(item.fecha_expiracion),
      descripcion: item.descripcion || "",
      evidencia_url: item.evidencia_url || item.enlace || "",
      evidencia_archivo: item.evidencia_archivo || ""
    })),

    proyectos: (contenido.proyectos || []).map((item) => ({
      ...item,
      tipo_proyecto: item.tipo_proyecto || "",
      rol: item.rol || "",
      fecha_inicio: fechaInput(item.fecha_inicio),
      fecha_fin: fechaInput(item.fecha_fin),
      estado: item.estado || "",
      evidencia_url: item.evidencia_url || item.enlace || "",
      evidencia_archivo: item.evidencia_archivo || ""
    })),

    practicas: (contenido.practicas || []).map((item) => ({
      ...item,
      tipo:
        ["comunitaria", "laboral"].includes(
          normalizarTexto(item.tipo)
        )
          ? normalizarTexto(item.tipo)
          : "",
      area: item.area || item.cargo_area || "",
      rol_funcion: item.rol_funcion || "",
      actividades: item.actividades || item.descripcion || "",
      fecha_inicio: fechaInput(item.fecha_inicio),
      fecha_fin: fechaInput(item.fecha_fin),
      modalidad: item.modalidad || "",
      evidencia_url: item.evidencia_url || "",
      evidencia_archivo: item.evidencia_archivo || ""
    })),

    experiencia: (contenido.experiencia || []).map((item) => ({
      ...item,
      cargo: item.cargo || "",
      area: item.area || "",
      tipo_empleo: item.tipo_empleo || "",
      fecha_inicio: fechaInput(item.fecha_inicio),
      fecha_fin: fechaInput(item.fecha_fin),
      actualmente: Boolean(item.actualmente),
      modalidad: item.modalidad || "",
      evidencia_url: item.evidencia_url || "",
      evidencia_archivo: item.evidencia_archivo || ""
    })),

    referencias: (contenido.referencias || []).map((item) => ({
      ...item,
      tipo_referencia: item.tipo_referencia || "",
      telefono: item.telefono || "",
      autorizacion: Boolean(item.autorizacion)
    }))
  };
}

/* =========================================================
   COMPONENTE
========================================================= */

function PaginaDetalleCurriculum() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("datos_personales");
  const [contenido, setContenido] = useState(crearContenidoInicial());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [mejorando, setMejorando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const usuarioGuardado =
    localStorage.getItem("usuario") ||
    sessionStorage.getItem("usuario");

  const usuario = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    let activo = true;

    api
      .get(`/curriculums/${id}/contenido-fijo`)
      .then((response) => {
        if (!activo) return;

        const respuesta = response.data;

        setDatos(respuesta);
        setContenido(normalizarContenido(respuesta));

        if (respuesta.secciones?.length > 0) {
          setSeccionActiva(respuesta.secciones[0].clave);
        }
      })
      .catch((errorPeticion) => {
        if (!activo) return;

        setError(
          errorPeticion.response?.data?.mensaje ||
          "No se pudo cargar el currículum"
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
  }, [id]);

  const recargarContenido = async () => {
    const response = await api.get(
      `/curriculums/${id}/contenido-fijo`
    );

    setDatos(response.data);
    setContenido(normalizarContenido(response.data));
  };

  /* =======================================================
     ACCIONES GENERALES
  ======================================================= */

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/iniciar-sesion");
  };

  const guardar = async (seccion, informacion) => {
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      const response = await api.put(
        `/curriculums/${id}/contenido-fijo/${seccion}`,
        { datos: informacion }
      );

      setMensaje(
        response.data?.mensaje ||
        "Información guardada correctamente"
      );

      await recargarContenido();
      return true;
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo guardar la información"
      );

      return false;
    } finally {
      setGuardando(false);
    }
  };

  const generarPDF = async () => {
    setError("");
    setMensaje("");
    setGenerandoPDF(true);

    try {
      const response = await api.get(
        `/curriculums/${id}/pdf`,
        { responseType: "blob" }
      );

      const archivo = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const url = window.URL.createObjectURL(archivo);
      const enlace = document.createElement("a");

      const nombreCV =
        datos?.curriculum?.nombre || "PoliCV";

      const nombreSeguro = nombreCV
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]/g, "_");

      enlace.href = url;
      enlace.download = `CV_${nombreSeguro}.pdf`;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      window.URL.revokeObjectURL(url);

      setMensaje("PDF generado correctamente");
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo generar el PDF"
      );
    } finally {
      setGenerandoPDF(false);
    }
  };

  const mejorarDescripcion = async () => {
    const texto = contenido.descripcion.trim();

    if (!texto) {
      setError("Escribe primero una descripción");
      return;
    }

    setError("");
    setMensaje("");
    setMejorando(true);

    try {
      const response = await api.post(
        "/ia/mejorar-texto",
        {
          tipo: "perfil_profesional",
          texto
        }
      );

      const sugerencia = response.data?.sugerencia;

      if (!sugerencia) {
        setError("La IA no devolvió una sugerencia");
        return;
      }

      setContenido((anterior) => ({
        ...anterior,
        descripcion: sugerencia
      }));

      setMensaje(
        "La descripción fue mejorada. Revísala antes de guardar."
      );
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo mejorar la descripción"
      );
    } finally {
      setMejorando(false);
    }
  };

  /* =======================================================
     LISTAS
  ======================================================= */

  const agregarElemento = (seccion, elemento, maximo) => {
    const lista = contenido[seccion] || [];

    if (lista.length >= maximo) {
      setError(
        `Solo puedes registrar hasta ${maximo} elementos`
      );
      return;
    }

    setContenido((anterior) => ({
      ...anterior,
      [seccion]: [
        ...(anterior[seccion] || []),
        elemento
      ]
    }));

    setError("");
    setMensaje("");
  };

  const modificarElemento = (
    seccion,
    indice,
    campo,
    valor
  ) => {
    setContenido((anterior) => {
      const lista = [...(anterior[seccion] || [])];

      lista[indice] = {
        ...lista[indice],
        [campo]: valor
      };

      return {
        ...anterior,
        [seccion]: lista
      };
    });

    setError("");
    setMensaje("");
  };

  const eliminarElemento = (seccion, indice) => {
    setContenido((anterior) => ({
      ...anterior,
      [seccion]: (anterior[seccion] || []).filter(
        (_, posicion) => posicion !== indice
      )
    }));

    setError("");
    setMensaje("");
  };

  /* =======================================================
     ARCHIVOS
  ======================================================= */

  const validarArchivo = (archivo) => {
    if (!archivo) {
      return false;
    }

    const extensiones = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".apk"
    ];

    const nombre = archivo.name.toLowerCase();

    if (!extensiones.some((extension) =>
      nombre.endsWith(extension)
    )) {
      setError(
        "El archivo debe ser PDF, JPG, JPEG, PNG o APK"
      );
      return false;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError(
        "El archivo no puede superar 5 MB"
      );
      return false;
    }

    return true;
  };

  const subirEvidencia = async (
    seccion,
    archivo,
    identificador
  ) => {
    if (!validarArchivo(archivo)) {
      return null;
    }

    setError("");
    setMensaje("");
    setSubiendoArchivo(identificador);

    try {
      const formulario = new FormData();
      formulario.append("archivo", archivo);

      const response = await api.post(
        `/curriculums/${id}/archivo/${seccion}`,
        formulario
      );

      setMensaje(
        response.data?.mensaje ||
        "Archivo subido correctamente"
      );

      return response.data?.archivo?.ruta || null;
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.mensaje ||
        "No se pudo subir el archivo"
      );

      return null;
    } finally {
      setSubiendoArchivo("");
    }
  };

  const seleccionarEvidencia = async (
    seccion,
    indice,
    archivo
  ) => {
    const identificador = `${seccion}-${indice}`;

    const ruta = await subirEvidencia(
      seccion,
      archivo,
      identificador
    );

    if (ruta) {
      modificarElemento(
        seccion === "formacion"
          ? "formacion"
          : seccion === "experiencia"
            ? "experiencia"
            : seccion,
        indice,
        "evidencia_archivo",
        ruta
      );
    }
  };

  /* =======================================================
     IDIOMAS
  ======================================================= */

  const idiomaEsIngles = (idioma) => {
    const catalogoIngles = datos?.catalogos?.idiomas?.find(
      (item) =>
        ["ingles", "english"].includes(
          normalizarTexto(item.nombre)
        )
    );

    if (!catalogoIngles) {
      return ["ingles", "english"].includes(
        normalizarTexto(idioma?.idioma)
      );
    }

    return (
      Number(idioma?.id_idioma_catalogo) ===
      Number(catalogoIngles.id_idioma_catalogo)
    );
  };

  const actualizarIdiomaIngles = (nivel) => {
    const catalogoIngles = datos?.catalogos?.idiomas?.find(
      (item) =>
        ["ingles", "english"].includes(
          normalizarTexto(item.nombre)
        )
    );

    if (!catalogoIngles) {
      setError(
        "El catálogo de idiomas no tiene configurado Inglés"
      );
      return;
    }

    setContenido((anterior) => {
      const lista = [...anterior.idiomas];

      const indice = lista.findIndex(
        (item) =>
          Number(item.id_idioma_catalogo) ===
          Number(catalogoIngles.id_idioma_catalogo)
      );

      const inglesAnterior =
        indice >= 0
          ? lista[indice]
          : {};

      const ingles = {
        ...inglesAnterior,
        id_idioma_catalogo:
          catalogoIngles.id_idioma_catalogo,
        idioma: catalogoIngles.nombre,
        nivel,
        tiene_certificado:
          Boolean(
            inglesAnterior.tiene_certificado ||
            inglesAnterior.evidencia_archivo
          ),
        evidencia_archivo:
          inglesAnterior.evidencia_archivo || ""
      };

      if (indice >= 0) {
        lista[indice] = ingles;
      } else {
        lista.unshift(ingles);
      }

      return {
        ...anterior,
        idiomas: lista
      };
    });

    setError("");
    setMensaje("");
  };

  const agregarIdioma = () => {
    const adicionales = contenido.idiomas.filter(
      (idioma) => !idiomaEsIngles(idioma)
    );

    if (adicionales.length >= 2) {
      setError(
        "Solo puedes agregar dos idiomas adicionales"
      );
      return;
    }

    setContenido((anterior) => ({
      ...anterior,
      idiomas: [
        ...anterior.idiomas,
        {
          id_idioma_catalogo: "",
          idioma: "",
          nivel: "",
          tiene_certificado: false,
          evidencia_archivo: ""
        }
      ]
    }));

    setError("");
    setMensaje("");
  };

  const modificarIdioma = (
    indiceReal,
    campo,
    valor
  ) => {
    setContenido((anterior) => {
      const lista = [...anterior.idiomas];

      const nuevo = {
        ...lista[indiceReal],
        [campo]: valor
      };

      if (campo === "id_idioma_catalogo") {
        const idioma = datos.catalogos.idiomas.find(
          (item) =>
            String(item.id_idioma_catalogo) ===
            String(valor)
        );

        nuevo.idioma = idioma?.nombre || "";
      }

      lista[indiceReal] = nuevo;

      return {
        ...anterior,
        idiomas: lista
      };
    });

    setError("");
    setMensaje("");
  };

  const subirCertificadoIdioma = async (
    indiceReal,
    archivo
  ) => {
    if (!archivo) {
      return;
    }

    const nombre = archivo.name.toLowerCase();

    const extensionesPermitidas = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png"
    ];

    if (
      !extensionesPermitidas.some(
        (extension) =>
          nombre.endsWith(extension)
      )
    ) {
      setError(
        "El certificado debe ser PDF, JPG, JPEG o PNG"
      );
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError(
        "El certificado no puede superar 5 MB"
      );
      return;
    }

    const identificador =
      `idiomas-${indiceReal}`;

    const ruta = await subirEvidencia(
      "idiomas",
      archivo,
      identificador
    );

    if (!ruta) {
      return;
    }

    modificarIdioma(
      indiceReal,
      "evidencia_archivo",
      ruta
    );

    modificarIdioma(
      indiceReal,
      "tiene_certificado",
      true
    );

    setMensaje(
      "Certificado cargado correctamente"
    );
  };

  const guardarIdiomas = () => {
    const catalogoIdiomas =
      datos.catalogos?.idiomas || [];

    const inglesCatalogo = catalogoIdiomas.find(
      (item) =>
        ["ingles", "english"].includes(
          normalizarTexto(item.nombre)
        )
    );

    if (!inglesCatalogo) {
      setError(
        "El catálogo no tiene configurado el idioma Inglés"
      );
      return;
    }

    const inglesGuardado = contenido.idiomas.find(
      (item) => idiomaEsIngles(item)
    );

    if (
      !inglesGuardado ||
      !["Básico", "Intermedio", "Avanzado"].includes(
        inglesGuardado.nivel
      )
    ) {
      setError(
        "Selecciona el nivel de Inglés"
      );
      return;
    }

    const adicionales = contenido.idiomas.filter(
      (item) => !idiomaEsIngles(item)
    );

    if (adicionales.length > 2) {
      setError(
        "Solo puedes registrar hasta dos idiomas adicionales"
      );
      return;
    }

    const idsUsados = new Set([
      Number(inglesCatalogo.id_idioma_catalogo)
    ]);

    for (let i = 0; i < adicionales.length; i += 1) {
      const idioma = adicionales[i];

      if (!idioma.id_idioma_catalogo) {
        setError(
          `Selecciona el idioma adicional ${i + 1}`
        );
        return;
      }

      if (
        !["Básico", "Intermedio", "Avanzado"].includes(
          idioma.nivel
        )
      ) {
        setError(
          `Selecciona el nivel del idioma adicional ${i + 1}`
        );
        return;
      }

      const idIdioma = Number(
        idioma.id_idioma_catalogo
      );

      if (idsUsados.has(idIdioma)) {
        setError("No puedes repetir un idioma");
        return;
      }

      idsUsados.add(idIdioma);
    }

    guardar(
      "idiomas",
      [
        {
          id_idioma_catalogo:
            inglesCatalogo.id_idioma_catalogo,
          idioma: inglesCatalogo.nombre,
          nivel: inglesGuardado.nivel,
          tiene_certificado:
            Boolean(
              inglesGuardado.evidencia_archivo
            ),
          evidencia_archivo:
            inglesGuardado.evidencia_archivo ||
            null
        },
        ...adicionales.map((idioma) => ({
          id_idioma_catalogo:
            idioma.id_idioma_catalogo,
          idioma: idioma.idioma,
          nivel: idioma.nivel,
          tiene_certificado:
            Boolean(
              idioma.evidencia_archivo
            ),
          evidencia_archivo:
            idioma.evidencia_archivo ||
            null
        }))
      ]
    );
  };

  /* =======================================================
     HABILIDADES
  ======================================================= */

  const obtenerNivelHabilidad = (habilidad) => {
    const guardada = contenido.habilidades.find(
      (item) =>
        Number(item.id_habilidad_catalogo) ===
        Number(habilidad.id_habilidad_catalogo)
    );

    return ["Básico", "Intermedio", "Avanzado"].includes(
      guardada?.nivel
    )
      ? guardada.nivel
      : "";
  };

  const cambiarNivelHabilidad = (
    habilidad,
    nivel
  ) => {
    setContenido((anterior) => {
      const lista = [...anterior.habilidades];

      const indice = lista.findIndex(
        (item) =>
          Number(item.id_habilidad_catalogo) ===
          Number(habilidad.id_habilidad_catalogo)
      );

      const nueva = {
        id_habilidad_catalogo:
          habilidad.id_habilidad_catalogo,
        nombre: habilidad.nombre,
        tipo: habilidad.tipo,
        nivel
      };

      if (indice >= 0) {
        lista[indice] = nueva;
      } else {
        lista.push(nueva);
      }

      return {
        ...anterior,
        habilidades: lista
      };
    });

    setError("");
    setMensaje("");
  };

  const guardarHabilidades = () => {
    const catalogo =
      datos.catalogos?.habilidades || [];

    const tecnicas = catalogo
      .filter((item) => item.tipo === "tecnica")
      .slice(0, 5);

    const blandas = catalogo
      .filter((item) => item.tipo === "blanda")
      .slice(0, 5);

    if (tecnicas.length !== 5) {
      setError(
        "La carrera debe tener cinco habilidades técnicas configuradas"
      );
      return;
    }

    if (blandas.length !== 5) {
      setError(
        "Deben existir cinco habilidades blandas configuradas"
      );
      return;
    }

    const todas = [...tecnicas, ...blandas];

    const lista = todas.map((habilidad) => ({
      id_habilidad_catalogo:
        habilidad.id_habilidad_catalogo,
      nombre: habilidad.nombre,
      tipo: habilidad.tipo,
      nivel: obtenerNivelHabilidad(habilidad)
    }));

    if (lista.some((item) => !item.nivel)) {
      setError(
        "Selecciona el nivel de las diez habilidades"
      );
      return;
    }

    guardar("habilidades", lista);
  };

  /* =======================================================
     VALIDACIONES POR SECCIÓN
  ======================================================= */

  const guardarFormacion = () => {
    if (contenido.formacion.length > 3) {
      setError(
        "Solo puedes registrar hasta tres estudios adicionales"
      );
      return;
    }

    guardar("formacion", contenido.formacion);
  };

  const guardarCursos = () => {
    guardar("cursos", contenido.cursos);
  };

  const guardarProyectos = () => {
    if (contenido.proyectos.length === 0) {
      setError(
        "Debes registrar al menos un proyecto"
      );
      return;
    }

    guardar("proyectos", contenido.proyectos);
  };

  const guardarPracticas = () => {
    guardar("practicas", contenido.practicas);
  };

  const guardarExperiencias = () => {
    guardar("experiencia", contenido.experiencia);
  };

  const guardarReferencias = () => {
    guardar("referencias", contenido.referencias);
  };

  /* =======================================================
     CARGANDO
  ======================================================= */

  if (cargando || !datos) {
    return (
      <main style={{ padding: "40px" }}>
        Cargando currículum...
      </main>
    );
  }

  const perfil = datos.perfil;

  /* =======================================================
     RENDERIZAR SECCIÓN
  ======================================================= */

  const renderSeccion = () => {
    /* =====================================================
       1. DATOS PERSONALES
    ===================================================== */

    if (seccionActiva === "datos_personales") {
      const datosFaltantes = [];

      if (!perfil.nombres?.trim()) {
        datosFaltantes.push("nombres");
      }

      if (!perfil.apellidos?.trim()) {
        datosFaltantes.push("apellidos");
      }

      if (!perfil.telefono?.trim()) {
        datosFaltantes.push("teléfono");
      }

      if (!perfil.ciudad_pais?.trim()) {
        datosFaltantes.push("ciudad y provincia");
      }

      if (!perfil.fotografia_url?.trim()) {
        datosFaltantes.push("fotografía");
      }

      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>DATOS PERSONALES</span>
            <h2>Información personal</h2>
            <p>
              Los datos principales se obtienen de tu perfil.
              La fotografía debe cargarse desde un archivo de tu
              computador en Mi perfil.
            </p>
          </div>

          <div className="cv-detail-form">
            <div className="cv-project-fields">
              <div className="cv-detail-field">
                <label>Nombres *</label>
                <input
                  type="text"
                  value={perfil.nombres || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>Apellidos *</label>
                <input
                  type="text"
                  value={perfil.apellidos || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>Teléfono *</label>
                <input
                  type="text"
                  value={perfil.telefono || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>Ciudad y provincia *</label>
                <input
                  type="text"
                  value={perfil.ciudad_pais || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>Correo institucional</label>
                <input
                  type="text"
                  value={perfil.email || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>Fotografía *</label>
                <input
                  type="text"
                  value={
                    perfil.fotografia_url
                      ? "Fotografía registrada"
                      : "Fotografía pendiente"
                  }
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={perfil.linkedin_url || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field">
                <label>GitHub</label>
                <input
                  type="text"
                  value={perfil.github_url || ""}
                  disabled
                />
              </div>

              <div className="cv-detail-field full">
                <label>Sitio web o portafolio</label>
                <input
                  type="text"
                  value={perfil.sitio_web || ""}
                  disabled
                />
              </div>
            </div>

            {datosFaltantes.length > 0 && (
              <div className="cv-detail-message error">
                Completa en Mi perfil:{" "}
                {datosFaltantes.join(", ")}.
              </div>
            )}

            <Link
              to={`/perfil?volverCurriculum=${id}`}
              className="cv-detail-save"
            >
              Editar datos en Mi perfil
            </Link>
          </div>
        </section>
      );
    }

    /* =====================================================
       2. DESCRIPCIÓN PERSONAL O PROFESIONAL
    ===================================================== */

    if (seccionActiva === "descripcion") {
      const palabras =
        contarPalabras(contenido.descripcion);

      const guardarDescripcion = () => {
        if (palabras < 30 || palabras > 120) {
          setError(
            "La descripción debe contener entre 30 y 120 palabras"
          );
          return;
        }

        guardar(
          "descripcion",
          {
            texto: contenido.descripcion.trim()
          }
        );
      };

      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>
              DESCRIPCIÓN PERSONAL O PROFESIONAL
            </span>

            <h2>Presenta tu perfil profesional</h2>

            <p>
              Resume tus conocimientos, fortalezas,
              experiencia, objetivos y áreas de interés
              sin inventar información.
            </p>
          </div>

          <div className="cv-detail-form">
            <div className="cv-detail-field full">
              <label>
                Descripción personal o profesional *
              </label>

              <textarea
                rows="8"
                maxLength={1500}
                value={contenido.descripcion}
                onChange={(e) => {
                  setContenido((anterior) => ({
                    ...anterior,
                    descripcion: e.target.value
                  }));

                  setError("");
                  setMensaje("");
                }}
                placeholder="Ej. Estudiante de Tecnología Superior en Desarrollo de Software con conocimientos en desarrollo web, aplicaciones móviles y bases de datos..."
              />

              <small>
                {palabras} / 30–120 palabras
              </small>
            </div>

            <div className="cv-detail-actions">
              <button
                type="button"
                onClick={mejorarDescripcion}
                disabled={
                  mejorando ||
                  !contenido.descripcion.trim()
                }
              >
                {mejorando
                  ? "Mejorando..."
                  : "Mejorar redacción con IA"}
              </button>

              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando ||
                  palabras < 30 ||
                  palabras > 120
                }
                onClick={guardarDescripcion}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar descripción"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    /* =====================================================
       3. FORMACIÓN ACADÉMICA
    ===================================================== */

    if (seccionActiva === "formacion") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>FORMACIÓN ACADÉMICA</span>
            <h2>Formación actual y adicional</h2>
            <p>
              La carrera y el estado académico actuales
              se obtienen de tu perfil. Puedes agregar
              hasta tres estudios adicionales.
            </p>
          </div>

          <div className="cv-detail-form">
            <div className="cv-project-card">
              <div className="cv-project-card-title">
                <div>
                  <span>FORMACIÓN ACTUAL</span>
                  <h3>
                    Escuela Politécnica Nacional - ESFOT
                  </h3>
                </div>
              </div>

              <div className="cv-project-fields">
                <div className="cv-detail-field">
                  <label>Carrera actual *</label>
                  <input
                    type="text"
                    value={perfil.carrera || ""}
                    disabled
                  />
                </div>

                <div className="cv-detail-field">
                  <label>Estado académico *</label>
                  <input
                    type="text"
                    value={
                      perfil.estado_academico ||
                      "No registrado"
                    }
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="cv-skill-group-header">
              <h3>Estudios adicionales</h3>
              <p>
                Esta parte es opcional. Máximo tres.
              </p>
            </div>

            {contenido.formacion.map(
              (estudio, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        ESTUDIO ADICIONAL {indice + 1}
                      </span>

                      <h3>
                        {estudio.titulo ||
                          "Nuevo estudio"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "formacion",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>Título o grado *</label>

                      <input
                        type="text"
                        value={estudio.titulo || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "formacion",
                            indice,
                            "titulo",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Institución *</label>

                      <input
                        type="text"
                        value={
                          estudio.institucion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "formacion",
                            indice,
                            "institucion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Fecha de inicio *</label>

                      <input
                        type="date"
                        value={
                          estudio.fecha_inicio || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "formacion",
                            indice,
                            "fecha_inicio",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Fecha de finalización
                      </label>

                      <input
                        type="date"
                        value={
                          estudio.fecha_fin || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "formacion",
                            indice,
                            "fecha_fin",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Ciudad y país</label>

                      <input
                        type="text"
                        value={
                          estudio.ciudad_pais || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "formacion",
                            indice,
                            "ciudad_pais",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Evidencia</label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          seleccionarEvidencia(
                            "formacion",
                            indice,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF, JPG, JPEG o PNG.
                        Máximo 5 MB.
                      </small>

                      {estudio.evidencia_archivo && (
                        <small>
                          Archivo guardado:{" "}
                          {estudio.evidencia_archivo}
                        </small>
                      )}

                      {subiendoArchivo ===
                        `formacion-${indice}` && (
                        <small>
                          Subiendo archivo...
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.formacion.length < 3 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "formacion",
                    {
                      titulo: "",
                      institucion: "",
                      fecha_inicio: "",
                      fecha_fin: "",
                      ciudad_pais: "",
                      evidencia_archivo: ""
                    },
                    3
                  )
                }
              >
                + Agregar estudio adicional
              </button>
            )}

            <button
              type="button"
              className="cv-detail-save"
              disabled={guardando}
              onClick={guardarFormacion}
            >
              {guardando
                ? "Guardando..."
                : "Guardar formación"}
            </button>
          </div>
        </section>
      );
    }

    /* =====================================================
       4. IDIOMAS
    ===================================================== */

    if (seccionActiva === "idiomas") {
      const catalogoIdiomas =
        datos.catalogos?.idiomas || [];

      const inglesCatalogo =
        catalogoIdiomas.find(
          (item) =>
            ["ingles", "english"].includes(
              normalizarTexto(item.nombre)
            )
        );

      const indiceIngles =
        contenido.idiomas.findIndex(
          (item) => idiomaEsIngles(item)
        );

      const ingles =
        indiceIngles >= 0
          ? contenido.idiomas[indiceIngles]
          : {
              id_idioma_catalogo:
                inglesCatalogo
                  ?.id_idioma_catalogo || "",
              idioma:
                inglesCatalogo?.nombre ||
                "Inglés",
              nivel: "",
              tiene_certificado: false,
              evidencia_archivo: ""
            };

      const adicionales = contenido.idiomas
        .map((idioma, indiceReal) => ({
          ...idioma,
          indiceReal
        }))
        .filter(
          (idioma) => !idiomaEsIngles(idioma)
        );

      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>IDIOMAS</span>
            <h2>Idiomas</h2>
            <p>
              Inglés es obligatorio. Puedes agregar
              máximo dos idiomas adicionales.
            </p>
          </div>

          <div className="cv-detail-form">
            <div className="cv-project-card">
              <div className="cv-project-card-title">
                <div>
                  <span>IDIOMA OBLIGATORIO</span>
                  <h3>Inglés</h3>
                </div>
              </div>

              <div className="cv-project-fields">
                <div className="cv-detail-field">
                  <label>Nivel de inglés *</label>

                  <select
                    value={ingles.nivel || ""}
                    onChange={(e) =>
                      actualizarIdiomaIngles(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecciona un nivel
                    </option>

                    <option value="Básico">
                      Básico
                    </option>

                    <option value="Intermedio">
                      Intermedio
                    </option>

                    <option value="Avanzado">
                      Avanzado
                    </option>
                  </select>
                </div>

                {ingles.nivel && indiceIngles >= 0 && (
                  <div className="cv-detail-field full">
                    <label>
                      Certificado o evidencia
                      <span> (opcional)</span>
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      disabled={
                        subiendoArchivo ===
                        `idiomas-${indiceIngles}`
                      }
                      onChange={(e) =>
                        subirCertificadoIdioma(
                          indiceIngles,
                          e.target.files?.[0]
                        )
                      }
                    />

                    <small>
                      PDF, JPG, JPEG o PNG. Máximo 5 MB.
                    </small>

                    {subiendoArchivo ===
                      `idiomas-${indiceIngles}` && (
                      <p className="cv-detail-file-ok">
                        Subiendo certificado...
                      </p>
                    )}

                    {ingles.evidencia_archivo &&
                      subiendoArchivo !==
                        `idiomas-${indiceIngles}` && (
                      <p className="cv-detail-file-ok">
                        Certificado cargado correctamente
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="cv-skill-group-header">
              <h3>Idiomas adicionales</h3>
              <p>
                Esta parte es opcional. Máximo dos.
              </p>
            </div>

            {adicionales.map(
              (idioma, indice) => (
                <article
                  className="cv-project-card"
                  key={idioma.indiceReal}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        IDIOMA ADICIONAL {indice + 1}
                      </span>

                      <h3>
                        {idioma.idioma ||
                          "Nuevo idioma"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "idiomas",
                          idioma.indiceReal
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>Idioma *</label>

                      <select
                        value={
                          idioma.id_idioma_catalogo ||
                          ""
                        }
                        onChange={(e) =>
                          modificarIdioma(
                            idioma.indiceReal,
                            "id_idioma_catalogo",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona un idioma
                        </option>

                        {catalogoIdiomas
                          .filter(
                            (item) =>
                              ![
                                "ingles",
                                "english"
                              ].includes(
                                normalizarTexto(
                                  item.nombre
                                )
                              )
                          )
                          .map((item) => (
                            <option
                              key={
                                item.id_idioma_catalogo
                              }
                              value={
                                item.id_idioma_catalogo
                              }
                            >
                              {item.nombre}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>Nivel *</label>

                      <select
                        value={idioma.nivel || ""}
                        onChange={(e) =>
                          modificarIdioma(
                            idioma.indiceReal,
                            "nivel",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona un nivel
                        </option>

                        <option value="Básico">
                          Básico
                        </option>

                        <option value="Intermedio">
                          Intermedio
                        </option>

                        <option value="Avanzado">
                          Avanzado
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        Certificado o evidencia
                        <span> (opcional)</span>
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        disabled={
                          subiendoArchivo ===
                          `idiomas-${idioma.indiceReal}`
                        }
                        onChange={(e) =>
                          subirCertificadoIdioma(
                            idioma.indiceReal,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF, JPG, JPEG o PNG. Máximo 5 MB.
                      </small>

                      {subiendoArchivo ===
                        `idiomas-${idioma.indiceReal}` && (
                        <p className="cv-detail-file-ok">
                          Subiendo certificado...
                        </p>
                      )}

                      {idioma.evidencia_archivo &&
                        subiendoArchivo !==
                          `idiomas-${idioma.indiceReal}` && (
                        <p className="cv-detail-file-ok">
                          Certificado cargado correctamente
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {adicionales.length < 2 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={agregarIdioma}
              >
                + Agregar idioma adicional
              </button>
            )}

            <button
              type="button"
              className="cv-detail-save"
              disabled={guardando}
              onClick={guardarIdiomas}
            >
              {guardando
                ? "Guardando..."
                : "Guardar idiomas"}
            </button>
          </div>
        </section>
      );
    }

    /* =====================================================
       5. HABILIDADES
    ===================================================== */

    if (seccionActiva === "habilidades") {
      const catalogo =
        datos.catalogos?.habilidades || [];

      const tecnicas = catalogo
        .filter(
          (item) => item.tipo === "tecnica"
        )
        .slice(0, 5);

      const blandas = catalogo
        .filter(
          (item) => item.tipo === "blanda"
        )
        .slice(0, 5);

      const renderGrupo = (
        titulo,
        descripcion,
        habilidades
      ) => (
        <div className="cv-skill-group">
          <div className="cv-skill-group-header">
            <h3>{titulo}</h3>
            <p>{descripcion}</p>
          </div>

          <div className="cv-skill-grid">
            {habilidades.map((habilidad) => (
              <article
                className="cv-skill-card"
                key={
                  habilidad.id_habilidad_catalogo
                }
              >
                <div>
                  <strong>
                    {habilidad.nombre}
                  </strong>

                  {habilidad.descripcion && (
                    <p>
                      {habilidad.descripcion}
                    </p>
                  )}
                </div>

                <label>
                  Nivel de dominio *

                  <select
                    value={
                      obtenerNivelHabilidad(
                        habilidad
                      )
                    }
                    onChange={(e) =>
                      cambiarNivelHabilidad(
                        habilidad,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecciona
                    </option>

                    <option value="Básico">
                      Básico
                    </option>

                    <option value="Intermedio">
                      Intermedio
                    </option>

                    <option value="Avanzado">
                      Avanzado
                    </option>
                  </select>
                </label>
              </article>
            ))}
          </div>
        </div>
      );

      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>HABILIDADES</span>
            <h2>Habilidades profesionales</h2>
            <p>
              Las habilidades están predeterminadas.
              Selecciona únicamente tu nivel de dominio.
              No se utilizan porcentajes.
            </p>
          </div>

          <div className="cv-detail-form">
            {renderGrupo(
              "Habilidades técnicas",
              "Cinco competencias técnicas definidas según tu carrera.",
              tecnicas
            )}

            {renderGrupo(
              "Habilidades blandas",
              "Trabajo en equipo, Comunicación efectiva, Resolución de problemas, Adaptabilidad y Responsabilidad.",
              blandas
            )}

            {tecnicas.length !== 5 && (
              <div className="cv-detail-message error">
                Aún no existen cinco habilidades
                técnicas configuradas para esta
                carrera.
              </div>
            )}

            {blandas.length !== 5 && (
              <div className="cv-detail-message error">
                Aún no existen cinco habilidades
                blandas configuradas.
              </div>
            )}

            <button
              type="button"
              className="cv-detail-save"
              disabled={
                guardando ||
                tecnicas.length !== 5 ||
                blandas.length !== 5
              }
              onClick={guardarHabilidades}
            >
              {guardando
                ? "Guardando..."
                : "Guardar habilidades"}
            </button>
          </div>
        </section>
      );
    }

    /* =====================================================
       6. CURSOS Y CERTIFICACIONES
    ===================================================== */

    if (seccionActiva === "cursos") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>
              CURSOS Y CERTIFICACIONES
            </span>

            <h2>Cursos y certificaciones</h2>

            <p>
              Sección opcional. Puedes registrar
              hasta cinco.
            </p>
          </div>

          <div className="cv-project-list">
            {contenido.cursos.map(
              (curso, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        REGISTRO {indice + 1}
                      </span>

                      <h3>
                        {curso.nombre ||
                          "Nuevo curso o certificación"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "cursos",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>Tipo *</label>

                      <select
                        value={curso.tipo || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "tipo",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Curso">
                          Curso
                        </option>

                        <option value="Certificación">
                          Certificación
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>Nombre *</label>

                      <input
                        type="text"
                        value={curso.nombre || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "nombre",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Institución o plataforma *
                      </label>

                      <input
                        type="text"
                        value={
                          curso.institucion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "institucion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Fecha de emisión o finalización *
                      </label>

                      <input
                        type="date"
                        value={
                          curso.fecha_obtencion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "fecha_obtencion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Fecha de expiración
                      </label>

                      <input
                        type="date"
                        value={
                          curso.fecha_expiracion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "fecha_expiracion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Horas</label>

                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={
                          curso.horas_duracion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "horas_duracion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field full">
                      <label>Descripción</label>

                      <textarea
                        rows="4"
                        value={
                          curso.descripcion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "descripcion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Enlace de evidencia
                      </label>

                      <input
                        type="url"
                        placeholder="https://..."
                        value={
                          curso.evidencia_url || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "cursos",
                            indice,
                            "evidencia_url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Archivo de evidencia
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          seleccionarEvidencia(
                            "cursos",
                            indice,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF, JPG, JPEG o PNG.
                        Máximo 5 MB.
                      </small>

                      {curso.evidencia_archivo && (
                        <small>
                          Archivo guardado:{" "}
                          {curso.evidencia_archivo}
                        </small>
                      )}

                      {subiendoArchivo ===
                        `cursos-${indice}` && (
                        <small>
                          Subiendo archivo...
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.cursos.length < 5 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "cursos",
                    {
                      tipo: "",
                      nombre: "",
                      institucion: "",
                      fecha_obtencion: "",
                      fecha_expiracion: "",
                      horas_duracion: "",
                      descripcion: "",
                      evidencia_url: "",
                      evidencia_archivo: ""
                    },
                    5
                  )
                }
              >
                + Agregar curso o certificación
              </button>
            )}

            <div className="cv-project-actions">
              <button
                type="button"
                className="cv-detail-save"
                disabled={guardando}
                onClick={guardarCursos}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cursos y certificaciones"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    /* =====================================================
       7. PROYECTOS
    ===================================================== */

    if (seccionActiva === "proyectos") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>PROYECTOS</span>
            <h2>Proyectos destacados</h2>
            <p>
              Debes registrar mínimo un proyecto y
              máximo tres.
            </p>
          </div>

          <div className="cv-project-list">
            {contenido.proyectos.map(
              (proyecto, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        PROYECTO {indice + 1}
                      </span>

                      <h3>
                        {proyecto.nombre ||
                          "Nuevo proyecto"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "proyectos",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>
                        Nombre del proyecto *
                      </label>

                      <input
                        type="text"
                        value={
                          proyecto.nombre || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "nombre",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Tipo de proyecto *
                      </label>

                      <select
                        value={
                          proyecto.tipo_proyecto ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "tipo_proyecto",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Académico">
                          Académico
                        </option>

                        <option value="Personal">
                          Personal
                        </option>

                        <option value="Profesional">
                          Profesional
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field full">
                      <label>Descripción *</label>

                      <textarea
                        rows="5"
                        value={
                          proyecto.descripcion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "descripcion",
                            e.target.value
                          )
                        }
                      />

                      <small>
                        {contarPalabras(
                          proyecto.descripcion
                        )}{" "}
                        / 40–150 palabras
                      </small>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Tecnologías o herramientas *
                      </label>

                      <input
                        type="text"
                        placeholder="React, Node.js, MySQL"
                        value={
                          proyecto.tecnologias || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "tecnologias",
                            e.target.value
                          )
                        }
                      />

                      <small>
                        Máximo ocho, separadas por coma.
                      </small>
                    </div>

                    <div className="cv-detail-field">
                      <label>Rol *</label>

                      <input
                        type="text"
                        value={proyecto.rol || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "rol",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Fecha de inicio *</label>

                      <input
                        type="date"
                        value={
                          proyecto.fecha_inicio || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "fecha_inicio",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Fecha de finalización
                      </label>

                      <input
                        type="date"
                        value={
                          proyecto.fecha_fin || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "fecha_fin",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Estado *</label>

                      <select
                        value={proyecto.estado || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "estado",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="En desarrollo">
                          En desarrollo
                        </option>

                        <option value="Finalizado">
                          Finalizado
                        </option>

                        <option value="Pausado">
                          Pausado
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Enlace de evidencia
                      </label>

                      <input
                        type="url"
                        placeholder="Repositorio o demo"
                        value={
                          proyecto.evidencia_url ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "proyectos",
                            indice,
                            "evidencia_url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        Archivo de evidencia
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.apk"
                        onChange={(e) =>
                          seleccionarEvidencia(
                            "proyectos",
                            indice,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF, imagen o APK.
                        Máximo 5 MB.
                      </small>

                      {proyecto.evidencia_archivo && (
                        <small>
                          Archivo guardado:{" "}
                          {proyecto.evidencia_archivo}
                        </small>
                      )}

                      {subiendoArchivo ===
                        `proyectos-${indice}` && (
                        <small>
                          Subiendo archivo...
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.proyectos.length < 3 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "proyectos",
                    {
                      nombre: "",
                      tipo_proyecto: "",
                      descripcion: "",
                      tecnologias: "",
                      rol: "",
                      fecha_inicio: "",
                      fecha_fin: "",
                      estado: "",
                      evidencia_url: "",
                      evidencia_archivo: ""
                    },
                    3
                  )
                }
              >
                + Agregar proyecto
              </button>
            )}

            <div className="cv-project-actions">
              <button
                type="button"
                className="cv-detail-save"
                disabled={
                  guardando ||
                  contenido.proyectos.length === 0
                }
                onClick={guardarProyectos}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar proyectos"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    /* =====================================================
       8. PRÁCTICAS
    ===================================================== */

    if (seccionActiva === "practicas") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>PRÁCTICAS</span>
            <h2>Prácticas</h2>
            <p>
              Sección opcional. Puedes registrar
              hasta cuatro prácticas.
            </p>
          </div>

          <div className="cv-project-list">
            {contenido.practicas.map(
              (practica, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        PRÁCTICA {indice + 1}
                      </span>

                      <h3>
                        {practica.institucion ||
                          "Nueva práctica"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "practicas",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>
                        Tipo de práctica *
                      </label>

                      <select
                        value={practica.tipo || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "tipo",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="comunitaria">
                          Comunitaria
                        </option>

                        <option value="laboral">
                          Laboral
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Institución o empresa *
                      </label>

                      <input
                        type="text"
                        value={
                          practica.institucion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "institucion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Área *</label>

                      <input
                        type="text"
                        value={practica.area || ""}
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "area",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Rol o función *
                      </label>

                      <input
                        type="text"
                        value={
                          practica.rol_funcion || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "rol_funcion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        Actividades realizadas *
                      </label>

                      <textarea
                        rows="5"
                        value={
                          practica.actividades || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "actividades",
                            e.target.value
                          )
                        }
                      />

                      <small>
                        {contarPalabras(
                          practica.actividades
                        )}{" "}
                        / 30–120 palabras
                      </small>
                    </div>

                    <div className="cv-detail-field">
                      <label>Fecha de inicio *</label>

                      <input
                        type="date"
                        value={
                          practica.fecha_inicio || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "fecha_inicio",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Fecha de finalización
                      </label>

                      <input
                        type="date"
                        value={
                          practica.fecha_fin || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "fecha_fin",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Modalidad *</label>

                      <select
                        value={
                          practica.modalidad || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "modalidad",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Presencial">
                          Presencial
                        </option>

                        <option value="Híbrida">
                          Híbrida
                        </option>

                        <option value="Remota">
                          Remota
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Enlace de evidencia
                      </label>

                      <input
                        type="url"
                        placeholder="https://..."
                        value={
                          practica.evidencia_url ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "practicas",
                            indice,
                            "evidencia_url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        Archivo de evidencia
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          seleccionarEvidencia(
                            "practicas",
                            indice,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF o imagen. Máximo 5 MB.
                      </small>

                      {practica.evidencia_archivo && (
                        <small>
                          Archivo guardado:{" "}
                          {practica.evidencia_archivo}
                        </small>
                      )}

                      {subiendoArchivo ===
                        `practicas-${indice}` && (
                        <small>
                          Subiendo archivo...
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.practicas.length < 4 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "practicas",
                    {
                      tipo: "",
                      institucion: "",
                      area: "",
                      rol_funcion: "",
                      actividades: "",
                      fecha_inicio: "",
                      fecha_fin: "",
                      modalidad: "",
                      evidencia_url: "",
                      evidencia_archivo: ""
                    },
                    4
                  )
                }
              >
                + Agregar práctica
              </button>
            )}

            <div className="cv-project-actions">
              <button
                type="button"
                className="cv-detail-save"
                disabled={guardando}
                onClick={guardarPracticas}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar prácticas"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    /* =====================================================
       9. EXPERIENCIA LABORAL
    ===================================================== */

    if (seccionActiva === "experiencia") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>EXPERIENCIA LABORAL</span>
            <h2>Experiencia laboral</h2>
            <p>
              Sección opcional. Puedes registrar
              hasta tres experiencias laborales.
            </p>
          </div>

          <div className="cv-project-list">
            {contenido.experiencia.map(
              (experiencia, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        EXPERIENCIA {indice + 1}
                      </span>

                      <h3>
                        {experiencia.empresa ||
                          "Nueva experiencia"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "experiencia",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>
                        Empresa o institución *
                      </label>

                      <input
                        type="text"
                        value={
                          experiencia.empresa || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "empresa",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Cargo</label>

                      <input
                        type="text"
                        value={
                          experiencia.cargo || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "cargo",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>Área</label>

                      <input
                        type="text"
                        value={
                          experiencia.area || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "area",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Tipo de empleo *
                      </label>

                      <select
                        value={
                          experiencia.tipo_empleo ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "tipo_empleo",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Tiempo completo">
                          Tiempo completo
                        </option>

                        <option value="Medio tiempo">
                          Medio tiempo
                        </option>

                        <option value="Temporal">
                          Temporal
                        </option>

                        <option value="Por proyecto">
                          Por proyecto
                        </option>

                        <option value="Freelance">
                          Freelance
                        </option>

                        <option value="Contrato">
                          Contrato
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        Funciones y logros *
                      </label>

                      <textarea
                        rows="5"
                        value={
                          experiencia.descripcion ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "descripcion",
                            e.target.value
                          )
                        }
                      />

                      <small>
                        {contarPalabras(
                          experiencia.descripcion
                        )}{" "}
                        / 30–120 palabras
                      </small>
                    </div>

                    <div className="cv-detail-field">
                      <label>Fecha de inicio *</label>

                      <input
                        type="date"
                        value={
                          experiencia.fecha_inicio ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "fecha_inicio",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            experiencia.actualmente
                          }
                          onChange={(e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "actualmente",
                              e.target.checked
                            )
                          }
                        />{" "}
                        Actualmente trabajo aquí
                      </label>
                    </div>

                    {!experiencia.actualmente && (
                      <div className="cv-detail-field">
                        <label>
                          Fecha de finalización
                        </label>

                        <input
                          type="date"
                          value={
                            experiencia.fecha_fin ||
                            ""
                          }
                          onChange={(e) =>
                            modificarElemento(
                              "experiencia",
                              indice,
                              "fecha_fin",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}

                    <div className="cv-detail-field">
                      <label>Modalidad *</label>

                      <select
                        value={
                          experiencia.modalidad ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "modalidad",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Presencial">
                          Presencial
                        </option>

                        <option value="Híbrida">
                          Híbrida
                        </option>

                        <option value="Remota">
                          Remota
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Ciudad y provincia *
                      </label>

                      <input
                        type="text"
                        value={
                          experiencia.ciudad_pais ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "ciudad_pais",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Enlace de evidencia
                      </label>

                      <input
                        type="url"
                        placeholder="https://..."
                        value={
                          experiencia.evidencia_url ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "experiencia",
                            indice,
                            "evidencia_url",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Archivo de evidencia
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          seleccionarEvidencia(
                            "experiencia",
                            indice,
                            e.target.files?.[0]
                          )
                        }
                      />

                      <small>
                        PDF o imagen. Máximo 5 MB.
                      </small>

                      {experiencia.evidencia_archivo && (
                        <small>
                          Archivo guardado:{" "}
                          {experiencia.evidencia_archivo}
                        </small>
                      )}

                      {subiendoArchivo ===
                        `experiencia-${indice}` && (
                        <small>
                          Subiendo archivo...
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.experiencia.length < 3 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "experiencia",
                    {
                      empresa: "",
                      cargo: "",
                      area: "",
                      tipo_empleo: "",
                      descripcion: "",
                      fecha_inicio: "",
                      fecha_fin: "",
                      actualmente: false,
                      modalidad: "",
                      ciudad_pais: "",
                      evidencia_url: "",
                      evidencia_archivo: ""
                    },
                    3
                  )
                }
              >
                + Agregar experiencia
              </button>
            )}

            <div className="cv-project-actions">
              <button
                type="button"
                className="cv-detail-save"
                disabled={guardando}
                onClick={guardarExperiencias}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar experiencia"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    /* =====================================================
       10. REFERENCIAS
    ===================================================== */

    if (seccionActiva === "referencias") {
      return (
        <section className="cv-detail-form-card">
          <div className="cv-detail-card-header">
            <span>REFERENCIAS</span>
            <h2>Referencias</h2>
            <p>
              Sección opcional. Puedes registrar
              hasta cinco referencias académicas,
              laborales o profesionales.
            </p>
          </div>

          <div className="cv-project-list">
            {contenido.referencias.map(
              (referencia, indice) => (
                <article
                  className="cv-project-card"
                  key={indice}
                >
                  <div className="cv-project-card-title">
                    <div>
                      <span>
                        REFERENCIA {indice + 1}
                      </span>

                      <h3>
                        {referencia.nombre_completo ||
                          "Nueva referencia"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="cv-project-delete"
                      onClick={() =>
                        eliminarElemento(
                          "referencias",
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="cv-project-fields">
                    <div className="cv-detail-field">
                      <label>
                        Tipo de referencia *
                      </label>

                      <select
                        value={
                          referencia.tipo_referencia ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "tipo_referencia",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        <option value="Académica">
                          Académica
                        </option>

                        <option value="laboral">
                          Laboral
                        </option>

                        <option value="Profesional">
                          Profesional
                        </option>
                      </select>
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Nombre completo *
                      </label>

                      <input
                        type="text"
                        value={
                          referencia.nombre_completo ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "nombre_completo",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Cargo u ocupación *
                      </label>

                      <input
                        type="text"
                        value={
                          referencia.cargo || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "cargo",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Institución o empresa *
                      </label>

                      <input
                        type="text"
                        value={
                          referencia.empresa_institucion ||
                          ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "empresa_institucion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Correo electrónico *
                      </label>

                      <input
                        type="email"
                        value={
                          referencia.email || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "email",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field">
                      <label>
                        Número de teléfono
                      </label>

                      <input
                        type="tel"
                        placeholder="09xxxxxxxx"
                        value={
                          referencia.telefono || ""
                        }
                        onChange={(e) =>
                          modificarElemento(
                            "referencias",
                            indice,
                            "telefono",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cv-detail-field full">
                      <label>
                        <input
                          type="checkbox"
                          checked={
                            referencia.autorizacion
                          }
                          onChange={(e) =>
                            modificarElemento(
                              "referencias",
                              indice,
                              "autorizacion",
                              e.target.checked
                            )
                          }
                        />{" "}
                        Confirmo que tengo autorización
                        para utilizar los datos de esta
                        referencia *
                      </label>
                    </div>
                  </div>
                </article>
              )
            )}

            {contenido.referencias.length < 5 && (
              <button
                type="button"
                className="cv-project-add"
                onClick={() =>
                  agregarElemento(
                    "referencias",
                    {
                      tipo_referencia: "",
                      nombre_completo: "",
                      cargo: "",
                      empresa_institucion: "",
                      email: "",
                      telefono: "",
                      autorizacion: false
                    },
                    5
                  )
                }
              >
                + Agregar referencia
              </button>
            )}

            <div className="cv-project-actions">
              <button
                type="button"
                className="cv-detail-save"
                disabled={guardando}
                onClick={guardarReferencias}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar referencias"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  /* =========================================================
     INTERFAZ PRINCIPAL
  ========================================================= */

  return (
    <div className="student-page">
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-logo">
            P
          </div>

          <div>
            <h2>PoliCV</h2>
            <span>Estudiante</span>
          </div>
        </div>

        <div className="student-profile-mini">
          <div className="student-avatar">
            {perfil.nombres
              ?.charAt(0)
              ?.toUpperCase() || "E"}
          </div>

          <div>
            <strong>{perfil.nombres}</strong>
            <span>{usuario?.email}</span>
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

        <button
          type="button"
          className="student-logout"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="student-main">
        <header className="student-header">
          <div>
            <span className="student-header-label">
              CONTENIDO DEL CURRÍCULUM
            </span>

            <h1>
              {datos.curriculum.nombre}
            </h1>

            <p>{perfil.carrera}</p>
          </div>

          <div className="student-header-account">
            <div>
              <span>Sesión iniciada como</span>
              <strong>{usuario?.email}</strong>
            </div>

            <div className="student-header-avatar">
              {perfil.nombres
                ?.charAt(0)
                ?.toUpperCase() || "E"}
            </div>
          </div>
        </header>

        <div className="student-content">
          <section className="cv-detail-heading">
            <div>
              <span>
                ESTRUCTURA PREDETERMINADA
              </span>

              <h2>
                Completa tu currículum
              </h2>

              <p>
                Las secciones y opciones están
                configuradas según las reglas de
                PoliCV.
              </p>
            </div>

            <div className="cv-detail-actions">
              <button
                type="button"
                className="cv-detail-save"
                onClick={generarPDF}
                disabled={generandoPDF}
              >
                {generandoPDF
                  ? "Generando PDF..."
                  : "Generar PDF"}
              </button>

              <Link
                to={`/estudiante/curriculums/${id}/landing`}
                className="cv-detail-back"
              >
                Mi Landing Page
              </Link>

              <Link
                to="/estudiante/curriculums"
                className="cv-detail-back"
              >
                Volver a mis currículums
              </Link>
            </div>
          </section>

          <section className="cv-detail-tabs">
            {datos.secciones.map((seccion) => (
              <button
                key={seccion.id_seccion}
                type="button"
                className={
                  seccionActiva === seccion.clave
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setSeccionActiva(seccion.clave);
                  setError("");
                  setMensaje("");
                }}
              >
                {seccion.clave === "habilidades"
                  ? "Habilidades"
                  : seccion.nombre}
              </button>
            ))}
          </section>

          {error && (
            <div className="cv-detail-message error">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="cv-detail-message success">
              {mensaje}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            {renderSeccion()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PaginaDetalleCurriculum;
