const db = require("../database/db");
const { importarProductos } = require("../services/importarProductos");

// =========================
// LISTAR PRODUCTOS
// =========================
const getProducts = (req, res) => {

  db.all(`
    SELECT
      codigo,
      descripcion,
      unidad_medida,
      cantidad_por_caja,
      stock_en_cajas,
      stock_en_unidades,

      (
        (COALESCE(stock_en_cajas,0) * COALESCE(cantidad_por_caja,0))
        +
        COALESCE(stock_en_unidades,0)
      ) AS stock_total

    FROM productos

    ORDER BY descripcion ASC
  `, [], (err, rows) => {

    if (err) {
      console.error("SQL ERROR:", err.message);

      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

};

const importarProductosHandler = async (req, res) => {
  try {
    const resultado = await importarProductos();

    if (resultado.success) {
      return res.json({
        success: true,
        totalImportados: resultado.totalImportados
      });
    }

    return res.status(500).json({
      success: false,
      error: "No se pudo importar"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = {
  getProducts,
  importarProductosHandler
};
