const pool = require("../config/database");

async function buscarPorNombre(nombre, db = pool) {
  const [rows] = await db.execute(
    "SELECT * FROM roles WHERE nombre = ?",
    [nombre]
  );

  return rows[0];
}

module.exports = {
  buscarPorNombre
};