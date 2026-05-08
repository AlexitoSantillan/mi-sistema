const sqlite3 = require("sqlite3").verbose();

// crear o abrir base de datos
const db = new sqlite3.Database("albeyro.db", (err) => {
  if (err) {
    console.error("Error al conectar DB", err);
  } else {
    console.log("Base de datos conectada");
  }
});

module.exports = db;