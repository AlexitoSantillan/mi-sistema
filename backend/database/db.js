const sqlite3 = require("sqlite3").verbose();

// =========================
// CONEXION DB
// =========================
const db = new sqlite3.Database("albeyro.db", (err) => {

  if (err) {
    console.error("Error al conectar DB", err);
  } else {
    console.log("Base de datos conectada");
  }

});

// =========================
// CREAR TABLAS
// =========================
db.serialize(() => {

  // =========================
  // PRODUCTOS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      codigo TEXT PRIMARY KEY,
      descripcion TEXT,
      unidad_medida TEXT,
      cantidad_por_caja REAL,
      stock_en_cajas REAL,
      stock_en_unidades REAL
    )
  `);

  // =========================
  // VENCIMIENTOS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS vencimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_codigo TEXT,
      lote TEXT,
      cantidad REAL,
      fecha_vencimiento TEXT,
      estado TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS historial_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT,
      total_productos INTEGER,
      stock_total REAL
    );

  `)

});

module.exports = db;