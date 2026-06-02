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
    )
  `);

  // =========================
  // ALERTAS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vencimiento_id INTEGER,
      producto_codigo TEXT,
      producto_nombre TEXT,
      lote TEXT,
      dias_restantes INTEGER,
      nivel_alerta INTEGER,
      mensaje TEXT,
      fecha_generada DATETIME DEFAULT CURRENT_TIMESTAMP,
      leida INTEGER DEFAULT 0
    )
  `);

  // =========================
  // CONTROL ALERTAS ENVIADAS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS alertas_enviadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vencimiento_id INTEGER,
      lote TEXT,
      fecha_vencimiento TEXT,
      dias_alerta INTEGER,
      fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

});

module.exports = db;