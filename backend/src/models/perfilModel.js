const pool = require("../config/database");

async function crearPerfil(idUsuario, db = pool) {
  await db.execute(
    "INSERT INTO perfiles (id_usuario) VALUES (?)",
    [idUsuario]
  );
}

module.exports = {
  crearPerfil
};