const db = require("../database/db");

const STOCK_TOTAL_SQL = `
  (COALESCE(stock_en_cajas, 0) * COALESCE(cantidad_por_caja, 0)) +
  COALESCE(stock_en_unidades, 0)
`;

const getDashboard = (req, res) => {
  db.get(`
    SELECT
      COUNT(*) AS totalProductos,
      COALESCE(SUM(${STOCK_TOTAL_SQL}), 0) AS existenciaTotal,
      SUM(CASE WHEN ${STOCK_TOTAL_SQL} <= 5 THEN 1 ELSE 0 END) AS bajoStock
    FROM productos
  `, [], (err, productos) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(`
      SELECT COUNT(*) AS vencidos
      FROM vencimientos
      WHERE date(fecha_vencimiento) < date('now')
    `, [], (err, vencimientos) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        totalProductos: productos.totalProductos || 0,
        existenciaTotal: productos.existenciaTotal || 0,
        bajoStock: productos.bajoStock || 0,
        vencidos: vencimientos.vencidos || 0,
      });
    });
  });
};

const getStockGeneral = (req, res) => {
  db.all(`
    SELECT
      descripcion AS name,
      ${STOCK_TOTAL_SQL} AS stock
    FROM productos
    ORDER BY stock DESC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

const getControlStock = (req, res) => {
  db.all(`
    SELECT
      descripcion AS name,
      ${STOCK_TOTAL_SQL} AS stock
    FROM productos
    ORDER BY stock ASC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

const getDistribucionStock = (req, res) => {
  db.all(`
    SELECT
      CASE
        WHEN stock_total = 0 THEN 'Stock 0'
        WHEN stock_total BETWEEN 1 AND 10 THEN '1-10'
        WHEN stock_total BETWEEN 11 AND 50 THEN '11-50'
        WHEN stock_total BETWEEN 51 AND 100 THEN '51-100'
        ELSE '100+'
      END AS rango,
      COUNT(*) AS total
    FROM (
      SELECT ${STOCK_TOTAL_SQL} AS stock_total
      FROM productos
    )
    GROUP BY rango
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

const getVencimientosEstado = (req, res) => {
  db.all(`
    SELECT
      CASE
        WHEN date(fecha_vencimiento) < date('now') THEN 'ROJO'
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

    const fixed = [
      { name: "ROJO", value: 0 },
      { name: "AMARILLO", value: 0 },
      { name: "VERDE", value: 0 },
    ];

    rows.forEach((row) => {
      const item = fixed.find((fixedItem) => fixedItem.name === row.name);
      if (item) item.value = row.value;
    });

    res.json(fixed);
  });
};

const getCriticalProducts = (req, res) => {
  db.all(`
    SELECT
      descripcion AS name,
      ${STOCK_TOTAL_SQL} AS stock,
      CASE
        WHEN ${STOCK_TOTAL_SQL} = 0 THEN 'SIN STOCK'
        WHEN ${STOCK_TOTAL_SQL} <= 5 THEN 'STOCK BAJO'
        ELSE 'OK'
      END AS estado
    FROM productos
    WHERE ${STOCK_TOTAL_SQL} <= 5
    ORDER BY stock ASC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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
  getCriticalProducts,
};
