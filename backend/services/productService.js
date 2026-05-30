const sqlite3 = require("sqlite3").verbose();

// =========================
// CONEXION SQLITE
// =========================
const db = new sqlite3.Database("./albeyro.db");

// =========================
// OBTENER PRODUCTOS
// =========================
const obtenerProductos = () => {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM productos
      ORDER BY nombre ASC
      `,
      [],
      (err, rows) => {

        if (err) {

          reject(err);

        } else {

          resolve(rows);

        }

      }
    );

  });

};

module.exports = {
  obtenerProductos,
};