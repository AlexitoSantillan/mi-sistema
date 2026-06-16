const db = require("../database/db");

const STOCK_TOTAL_SQL = `
  (COALESCE(p.stock_en_cajas, 0) * COALESCE(p.cantidad_por_caja, 0)) +
  COALESCE(p.stock_en_unidades, 0)
`;

const validarFecha = (fecha) => /^\d{4}-\d{2}-\d{2}$/.test(fecha || "");

const validarPayload = ({ producto_codigo, lote, cantidad, fecha_vencimiento }) => {
  const cantidadNumerica = Number(cantidad);

  if (!producto_codigo || !String(producto_codigo).trim()) {
    return { error: "Producto requerido" };
  }

  if (!lote || !String(lote).trim()) {
    return { error: "Lote requerido" };
  }

  if (!Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
    return { error: "La cantidad debe ser mayor a cero" };
  }

  if (!validarFecha(fecha_vencimiento)) {
    return { error: "Fecha de vencimiento invalida" };
  }

  return {
    data: {
      producto_codigo: String(producto_codigo).trim(),
      lote: String(lote).trim(),
      cantidad: cantidadNumerica,
      fecha_vencimiento,
    },
  };
};

const obtenerProducto = (codigo, callback) => {
  db.get(`
    SELECT
      stock_en_cajas,
      stock_en_unidades,
      cantidad_por_caja
    FROM productos
    WHERE codigo = ?
  `, [codigo], callback);
};

const calcularStockTotal = (producto) => {
  const cajas = Number(producto.stock_en_cajas || 0);
  const unidades = Number(producto.stock_en_unidades || 0);
  const porCaja = Number(producto.cantidad_por_caja || 0);
  return (cajas * porCaja) + unidades;
};

const getVencimientos = (req, res) => {
  db.all(`
    SELECT
      v.id,
      v.producto_codigo,
      p.descripcion AS nombre,
      v.lote,
      v.cantidad,
      v.fecha_vencimiento,
      ${STOCK_TOTAL_SQL} AS cantidad_real
    FROM vencimientos v
    LEFT JOIN productos p ON p.codigo = v.producto_codigo
    ORDER BY date(v.fecha_vencimiento) ASC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

const createVencimiento = (req, res) => {
  const validation = validarPayload(req.body);

  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const payload = validation.data;

  obtenerProducto(payload.producto_codigo, (err, producto) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (payload.cantidad > calcularStockTotal(producto)) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    db.run(`
      INSERT INTO vencimientos (
        producto_codigo,
        lote,
        cantidad,
        fecha_vencimiento,
        estado
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      payload.producto_codigo,
      payload.lote,
      payload.cantidad,
      payload.fecha_vencimiento,
      "OK",
    ], function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ success: true, id: this.lastID });
    });
  });
};

const updateVencimiento = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalido" });
  }

  const validation = validarPayload(req.body);

  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const payload = validation.data;

  obtenerProducto(payload.producto_codigo, (err, producto) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (payload.cantidad > calcularStockTotal(producto)) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    db.run(`
      UPDATE vencimientos
      SET
        producto_codigo = ?,
        lote = ?,
        cantidad = ?,
        fecha_vencimiento = ?
      WHERE id = ?
    `, [
      payload.producto_codigo,
      payload.lote,
      payload.cantidad,
      payload.fecha_vencimiento,
      id,
    ], function onUpdate(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Vencimiento no encontrado" });
      }

      res.json({ success: true });
    });
  });
};

const deleteVencimiento = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID invalido" });
  }

  db.run(`
    DELETE FROM vencimientos
    WHERE id = ?
  `, [id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Vencimiento no encontrado" });
    }

    res.json({ success: true });
  });
};

const getVencidos = (req, res) => {
  db.all(`
    SELECT
      v.id,
      v.producto_codigo,
      p.descripcion AS nombre,
      v.lote,
      v.cantidad,
      v.fecha_vencimiento,
      ${STOCK_TOTAL_SQL} AS cantidad_real
    FROM vencimientos v
    LEFT JOIN productos p ON p.codigo = v.producto_codigo
    WHERE date(v.fecha_vencimiento) < date('now')
    ORDER BY date(v.fecha_vencimiento) ASC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

module.exports = {
  getVencimientos,
  createVencimiento,
  updateVencimiento,
  deleteVencimiento,
  getVencidos,
};
