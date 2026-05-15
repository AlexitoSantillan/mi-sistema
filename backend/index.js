const express = require("express");
const cors = require("cors");
const db = require("./database/db");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   CONFIGURAR BASE DE DATOS
========================= */
db.serialize(() => {
  // crear tabla usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // crear usuario admin si no existe
  db.get(
    "SELECT * FROM usuarios WHERE username = ?",
    ["admin"],
    (err, row) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
      } else if (!row) {
        db.run(
          "INSERT INTO usuarios (username, password) VALUES (?, ?)",
          ["admin", "1234"],
          (err) => {
            if (err) {
              console.error("Error al insertar usuario:", err);
            } else {
              console.log("Usuario admin creado");
            }
          }
        );
      } else {
        console.log("Usuario admin ya existe");
      }
    }
  );

  /* =========================
     NUEVAS TABLAS (NO TOCA LO ANTERIOR)
  ========================= */

  // vencimientos
  db.run(`
    CREATE TABLE IF NOT EXISTS vencimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      nombre TEXT,
      lote TEXT,
      cantidad INTEGER,
      fecha_vencimiento TEXT,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // historial de stock (para dashboard)
  db.run(`
    CREATE TABLE IF NOT EXISTS historial_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      nombre TEXT,
      stock INTEGER,
      fecha TEXT
    )
  `);
});

/* =========================
   RUTAS
========================= */

// prueba
app.get("/", (req, res) => {
  res.send("Servidor activo");
});

app.get("/api/test", (req, res) => {
  res.json({ mensaje: "Backend funcionando" });
});

/* =========================
   LOGIN REAL
========================= */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error en servidor" });
      }

      if (row) {
        res.json({ success: true, usuario: row.username });
      } else {
        res.json({ success: false });
      }
    }
  );
});

/* =========================
   VENCIMIENTOS
========================= */

// guardar vencimiento
app.post("/api/vencimientos", (req, res) => {
  const { producto_id, nombre, lote, cantidad, fecha_vencimiento } = req.body;

  db.run(
    `INSERT INTO vencimientos (producto_id, nombre, lote, cantidad, fecha_vencimiento)
     VALUES (?, ?, ?, ?, ?)`,
    [producto_id, nombre, lote, cantidad, fecha_vencimiento],
    function (err) {
      if (err) {
        return res.json({ success: false, error: err.message });
      }

      res.json({ success: true });
    }
  );
});

// listar vencimientos
app.get("/api/vencimientos", (req, res) => {
  db.all("SELECT * FROM vencimientos", [], (err, rows) => {
    if (err) {
      return res.json({ success: false });
    }

    res.json(rows);
  });
});

/* =========================
   HISTORIAL STOCK (DASHBOARD)
========================= */

// guardar stock diario
app.post("/api/historial", (req, res) => {
  const { producto_id, nombre, lote, stock, fecha } = req.body;

  db.run(
    `INSERT INTO historial_stock (producto_id, nombre, stock, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [producto_id, nombre, lote, stock, fecha],
    function (err) {
      if (err) {
        return res.json({ success: false, error: err.message });
      }

      res.json({ success: true });
    }
  );
});

// obtener historial
app.get("/api/historial", (req, res) => {
  db.all("SELECT * FROM historial_stock", [], (err, rows) => {
    if (err) {
      return res.json({ success: false });
    }

    res.json(rows);
  });
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(3001, () => {
  console.log("Servidor en http://localhost:3001");
});