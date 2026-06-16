const db = require("../database/db");

const obtenerProductos = () =>
  new Promise((resolve, reject) => {
    db.all(
      `
      SELECT
        codigo,
        descripcion,
        unidad_medida,
        cantidad_por_caja,
        stock_en_cajas,
        stock_en_unidades,
        (
          (COALESCE(stock_en_cajas, 0) * COALESCE(cantidad_por_caja, 0)) +
          COALESCE(stock_en_unidades, 0)
        ) AS stock_total
      FROM productos
      ORDER BY descripcion ASC
      `,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      }
    );
  });

module.exports = {
  obtenerProductos,
};
