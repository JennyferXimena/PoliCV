const propuestaModel = require("../../models/propuestaModel");

const ESTADOS = ["pendiente","en_revision","aceptada","rechazada"];
const TRANSICIONES = {
  pendiente:["en_revision"],
  en_revision:["aceptada","rechazada"],
  aceptada:[],
  rechazada:[]
};

async function listar(req, res) {
  const estado = String(req.query.estado || "");
  const buscar = String(req.query.buscar || "").trim();

  if (estado && !ESTADOS.includes(estado)) {
    return res.status(400).json({ mensaje:"Estado inválido" });
  }

  if (buscar.length > 100) {
    return res.status(400).json({ mensaje:"La búsqueda es demasiado larga" });
  }

  try {
    const [propuestas,resumen] = await Promise.all([
      propuestaModel.listarTodas({ estado:estado || undefined,buscar }),
      propuestaModel.obtenerResumenPropuestas()
    ]);

    return res.status(200).json({
      propuestas,
      resumen,
      total_filtradas:propuestas.length
    });
  } catch (error) {
    console.error("Error al obtener propuestas:", error);
    return res.status(500).json({ mensaje:"Error al obtener las propuestas" });
  }
}

async function actualizar(req, res) {
  const idPropuesta = Number(req.params.id);
  const { estado,respuesta_admin } = req.body || {};

  if (!Number.isInteger(idPropuesta) || idPropuesta <= 0) {
    return res.status(400).json({ mensaje:"Propuesta inválida" });
  }

  if (!ESTADOS.includes(estado) || estado === "pendiente") {
    return res.status(400).json({ mensaje:"Estado inválido" });
  }

  try {
    const propuesta = await propuestaModel.buscarPorId(idPropuesta);

    if (!propuesta) {
      return res.status(404).json({ mensaje:"Propuesta no encontrada" });
    }

    if (!TRANSICIONES[propuesta.estado]?.includes(estado)) {
      return res.status(400).json({
        mensaje:`No se puede cambiar una propuesta de ${propuesta.estado} a ${estado}`
      });
    }

    let respuesta = null;

    if (estado === "aceptada" || estado === "rechazada") {
      respuesta = String(respuesta_admin || "").trim();

      if (respuesta.length < 10 || respuesta.length > 500) {
        return res.status(400).json({
          mensaje:"La respuesta debe tener entre 10 y 500 caracteres"
        });
      }
    }

    await propuestaModel.actualizarEstado(idPropuesta,estado,respuesta);

    return res.status(200).json({
      mensaje:estado === "en_revision"
        ? "Propuesta marcada en revisión"
        : estado === "aceptada"
          ? "Propuesta aceptada correctamente"
          : "Propuesta rechazada correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar propuesta:", error);
    return res.status(500).json({ mensaje:"Error al actualizar la propuesta" });
  }
}

module.exports = { listar,actualizar };