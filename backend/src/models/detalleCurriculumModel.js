const pool = require("../config/database");

const SECCIONES = {
  formacion: {
    tabla: "formacion_academica",
    id: "id_formacion",
    campos: [
      "institucion",
      "titulo",
      "fecha_inicio",
      "fecha_fin",
      "en_curso",
      "descripcion"
    ],
    obligatorios: ["institucion", "titulo"]
  },

  experiencias: {
    tabla: "experiencias_laborales",
    id: "id_experiencia",
    campos: [
      "empresa",
      "cargo",
      "fecha_inicio",
      "fecha_fin",
      "actualmente",
      "descripcion"
    ],
    obligatorios: ["empresa", "cargo"]
  },

  proyectos: {
    tabla: "proyectos",
    id: "id_proyecto",
    campos: [
      "nombre",
      "descripcion",
      "tecnologias",
      "enlace"
    ],
    obligatorios: ["nombre"]
  },

  habilidades: {
    tabla: "habilidades",
    id: "id_habilidad",
    campos: [
      "nombre",
      "nivel"
    ],
    obligatorios: ["nombre"]
  },

  idiomas: {
    tabla: "idiomas",
    id: "id_idioma",
    campos: [
      "idioma",
      "nivel"
    ],
    obligatorios: ["idioma", "nivel"]
  },

  cursos: {
    tabla: "cursos_certificaciones",
    id: "id_curso",
    campos: [
      "nombre",
      "institucion",
      "fecha_obtencion",
      "enlace"
    ],
    obligatorios: ["nombre"]
  }
};

function obtenerConfiguracion(seccion) {
  return SECCIONES[seccion] || null;
}

function normalizarValor(valor) {
  if (valor === "" || valor === undefined) {
    return null;
  }

  return valor;
}

async function listar(seccion, idCurriculum) {
  const config = obtenerConfiguracion(seccion);

  if (!config) {
    throw new Error("SECCION_INVALIDA");
  }

  const [rows] = await pool.execute(
    `SELECT *
     FROM ${config.tabla}
     WHERE id_curriculum = ?
     ORDER BY ${config.id} DESC`,
    [idCurriculum]
  );

  return rows;
}

async function crear(
  seccion,
  idCurriculum,
  datos
) {
  const config = obtenerConfiguracion(seccion);

  if (!config) {
    throw new Error("SECCION_INVALIDA");
  }

  const columnas = [
    "id_curriculum",
    ...config.campos
  ];

  const valores = [
    idCurriculum,
    ...config.campos.map((campo) =>
      normalizarValor(datos[campo])
    )
  ];

  const placeholders =
    columnas.map(() => "?").join(", ");

  const [resultado] = await pool.execute(
    `INSERT INTO ${config.tabla}
      (${columnas.join(", ")})
     VALUES (${placeholders})`,
    valores
  );

  return resultado.insertId;
}

async function actualizar(
  seccion,
  idItem,
  idCurriculum,
  datos
) {
  const config = obtenerConfiguracion(seccion);

  if (!config) {
    throw new Error("SECCION_INVALIDA");
  }

  const asignaciones = config.campos
    .map((campo) => `${campo} = ?`)
    .join(", ");

  const valores = config.campos.map((campo) =>
    normalizarValor(datos[campo])
  );

  valores.push(
    idItem,
    idCurriculum
  );

  const [resultado] = await pool.execute(
    `UPDATE ${config.tabla}
     SET ${asignaciones}
     WHERE ${config.id} = ?
       AND id_curriculum = ?`,
    valores
  );

  return resultado.affectedRows;
}

async function eliminar(
  seccion,
  idItem,
  idCurriculum
) {
  const config = obtenerConfiguracion(seccion);

  if (!config) {
    throw new Error("SECCION_INVALIDA");
  }

  const [resultado] = await pool.execute(
    `DELETE FROM ${config.tabla}
     WHERE ${config.id} = ?
       AND id_curriculum = ?`,
    [
      idItem,
      idCurriculum
    ]
  );

  return resultado.affectedRows;
}

module.exports = {
  obtenerConfiguracion,
  listar,
  crear,
  actualizar,
  eliminar
};