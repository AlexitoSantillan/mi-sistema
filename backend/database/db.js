const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// =========================
// CONEXION DB
// =========================
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "albeyro.db");

const db = new sqlite3.Database(dbPath, (err) => {

  if (err) {
    console.error("Error al conectar DB", err);
  } else {
    console.log(`Base de datos conectada: ${dbPath}`);
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

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_productos_descripcion
    ON productos (descripcion)
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
    CREATE INDEX IF NOT EXISTS idx_vencimientos_producto
    ON vencimientos (producto_codigo)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_vencimientos_fecha
    ON vencimientos (fecha_vencimiento)
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

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_alertas_enviadas_unica
    ON alertas_enviadas (vencimiento_id, lote, fecha_vencimiento, dias_alerta)
  `);

});

module.exports = db;
