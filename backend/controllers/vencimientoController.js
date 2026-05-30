const db = require("../database/db");

// =========================
// LISTAR VENCIMIENTOS
// =========================
const getVencimientos = (req, res) => {

  db.all(`
    SELECT
      v.id,
      v.producto_codigo,
      p.descripcion AS nombre,
      v.lote,
      v.fecha_vencimiento,

      (
        (COALESCE(p.stock_en_cajas,0) *
        COALESCE(p.cantidad_por_caja,0))

        +

        COALESCE(p.stock_en_unidades,0)

      ) AS cantidad_real

    FROM vencimientos v

    LEFT JOIN productos p
      ON p.codigo = v.producto_codigo

    ORDER BY v.fecha_vencimiento ASC
  `, [], (err, rows) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        error: err.message
      });

    }

    res.json(rows);

  });

};

// =========================
// CREAR VENCIMIENTO
// =========================
const createVencimiento = (req, res) => {

  const {
    producto_codigo,
    lote,
    cantidad,
    fecha_vencimiento
  } = req.body;

  db.get(`
    SELECT
      stock_en_cajas,
      stock_en_unidades,
      cantidad_por_caja
    FROM productos
    WHERE codigo = ?
  `, [producto_codigo], (err, producto) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        error: err.message
      });

    }

    if (!producto) {

      return res.status(404).json({
        error: "Producto no encontrado"
      });

    }

    // =========================
    // STOCK REAL
    // =========================
    const cajas =
      Number(producto.stock_en_cajas || 0);

    const unidades =
      Number(producto.stock_en_unidades || 0);

    const porCaja =
      Number(producto.cantidad_por_caja || 0);

    const stockTotal =
      (cajas * porCaja) + unidades;

    // =========================
    // VALIDAR STOCK
    // =========================
    if (Number(cantidad) > stockTotal) {

      return res.status(400).json({
        error: "Stock insuficiente"
      });

    }

    // =========================
    // INSERTAR
    // =========================
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

      producto_codigo,
      lote,
      cantidad,
      fecha_vencimiento,
      "OK"

    ], function (err) {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: err.message
        });

      }

      res.json({
        success: true,
        id: this.lastID
      });

    });

  });

};

// =========================
// EDITAR VENCIMIENTO
// =========================
const updateVencimiento = (req, res) => {

  const { id } = req.params;

  const {
    lote,
    cantidad,
    fecha_vencimiento
  } = req.body;

  db.run(`
    UPDATE vencimientos
    SET
      lote = ?,
      cantidad = ?,
      fecha_vencimiento = ?
    WHERE id = ?
  `, [

    lote,
    cantidad,
    fecha_vencimiento,
    id

  ], (err) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        error: err.message
      });

    }

    res.json({
      success: true
    });

  });

};

// =========================
// ELIMINAR
// =========================
const deleteVencimiento = (req, res) => {

  const { id } = req.params;

  db.run(`
    DELETE FROM vencimientos
    WHERE id = ?
  `, [id], (err) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        error: err.message
      });

    }

    res.json({
      success: true
    });

  });

};

// =========================
// PRODUCTOS VENCIDOS
// =========================
const getVencidos = (req, res) => {

  db.all(`
    SELECT
      v.id,
      v.producto_codigo,
      p.descripcion AS nombre,
      v.lote,
      v.fecha_vencimiento,

      (
        (COALESCE(p.stock_en_cajas,0) *
        COALESCE(p.cantidad_por_caja,0))

        +

        COALESCE(p.stock_en_unidades,0)

      ) AS cantidad_real

    FROM vencimientos v

    LEFT JOIN productos p
      ON p.codigo = v.producto_codigo

    WHERE date(v.fecha_vencimiento) < date('now')

    ORDER BY v.fecha_vencimiento ASC
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
  getVencimientos,
  createVencimiento,
  updateVencimiento,
  deleteVencimiento,
  getVencidos
};