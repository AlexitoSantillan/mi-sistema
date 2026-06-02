const db = require("../database/db");

// =========================
// KPIs
// =========================
const getDashboard = (req, res) => {

  const dashboard = {};

  db.get(`
    SELECT COUNT(*) AS totalProductos
    FROM productos
  `, [], (err, row) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    dashboard.totalProductos = row.totalProductos || 0;

    db.get(`
      SELECT
        SUM(stock_en_cajas + stock_en_unidades) AS existenciaTotal
      FROM productos
    `, [], (err, row) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      dashboard.existenciaTotal = row.existenciaTotal || 0;

      db.get(`
        SELECT COUNT(*) AS bajoStock
        FROM productos
        WHERE (stock_en_cajas + stock_en_unidades) <= 5
      `, [], (err, row) => {

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        dashboard.bajoStock = row.bajoStock || 0;

        db.get(`
          SELECT COUNT(*) AS vencidos
          FROM vencimientos
          WHERE fecha_vencimiento < date('now')
        `, [], (err, row) => {

          if (err) {
            return res.status(500).json({ error: err.message });
          }

          dashboard.vencidos = row.vencidos || 0;

          res.json(dashboard);

        });

      });

    });

  });

};

// =========================
// GRAFICO 1
// TOP 10 MAYOR STOCK
// =========================
const getStockGeneral = (req, res) => {

  db.all(`
    SELECT
      descripcion AS name,
      (stock_en_cajas + stock_en_unidades) AS stock
    FROM productos
    ORDER BY stock DESC
    LIMIT 10
  `, [], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

};

// =========================
// GRAFICO 2
// MENOR STOCK
// =========================
const getControlStock = (req, res) => {

  db.all(`
    SELECT
      descripcion AS name,
      (stock_en_cajas + stock_en_unidades) AS stock
    FROM productos
    ORDER BY stock ASC
    LIMIT 10
  `, [], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

};

// =========================
// DISTRIBUCIÓN INVENTARIO
// =========================
const getDistribucionStock = (req, res) => {

  db.all(`
    SELECT 
      CASE
        WHEN (stock_en_cajas + stock_en_unidades) = 0 THEN 'Stock 0'
        WHEN (stock_en_cajas + stock_en_unidades) BETWEEN 1 AND 10 THEN '1-10'
        WHEN (stock_en_cajas + stock_en_unidades) BETWEEN 11 AND 50 THEN '11-50'
        WHEN (stock_en_cajas + stock_en_unidades) BETWEEN 51 AND 100 THEN '51-100'
        ELSE '100+'
      END AS rango,
      COUNT(*) AS total
    FROM productos
    GROUP BY rango
  `, [], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

};

// =========================
// GRAFICO 4
// VENCIMIENTOS
// =========================

const getVencimientosEstado = (req, res) => {

  db.all(`
    SELECT
      CASE
        WHEN (julianday(fecha_vencimiento) - julianday('now')) <= 90 THEN 'ROJO'
        WHEN (julianday(fecha_vencimiento) - julianday('now')) <= 180 THEN 'AMARILLO'
        ELSE 'VERDE'
      END AS name,
      COUNT(*) AS value
    FROM vencimientos
    GROUP BY name
  `, [], (err, rows) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 🔥 IMPORTANTE: asegurar siempre los 3 colores
    const fixed = [
      { name: "ROJO", value: 0 },
      { name: "AMARILLO", value: 0 },
      { name: "VERDE", value: 0 },
    ];

    rows.forEach(r => {
      const item = fixed.find(f => f.name === r.name);
      if (item) item.value = r.value;
    });

    res.json(fixed);
  });
};

// =========================
// PRODUCTOS CRITICOS
// =========================
const getCriticalProducts = (req, res) => {

  db.all(`
    SELECT
      descripcion AS name,

      (stock_en_cajas + stock_en_unidades) AS stock,

      CASE
        WHEN (stock_en_cajas + stock_en_unidades) = 0
          THEN 'SIN STOCK'

        WHEN (stock_en_cajas + stock_en_unidades) <= 5
          THEN 'STOCK BAJO'

        ELSE 'OK'
      END AS estado

    FROM productos

    WHERE
      (stock_en_cajas + stock_en_unidades) <= 5

    ORDER BY stock ASC

    LIMIT 10
  `, [], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

};

module.exports = {
  getDashboard,
  getStockGeneral,
  getControlStock,
  getDistribucionStock,
  getVencimientosEstado,
  getCriticalProducts
};