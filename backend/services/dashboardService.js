const db = require("../database/db");

const STOCK_TOTAL_SQL = `
  (COALESCE(stock_en_cajas, 0) * COALESCE(cantidad_por_caja, 0)) +
  COALESCE(stock_en_unidades, 0)
`;

const obtenerDashboard = () =>
  new Promise((resolve, reject) => {
    db.get(
      `
      SELECT
        COUNT(*) AS totalProductos,
        COALESCE(SUM(${STOCK_TOTAL_SQL}), 0) AS existenciaTotal,
        SUM(CASE WHEN ${STOCK_TOTAL_SQL} <= 5 THEN 1 ELSE 0 END) AS bajoStock
      FROM productos
      `,
      [],
      (err, productos) => {
        if (err) {
          reject(err);
          return;
        }

        db.get(
          `
          SELECT COUNT(*) AS vencidos
          FROM vencimientos
          WHERE date(fecha_vencimiento) < date('now')
          `,
          [],
          (err, vencimientos) => {
            if (err) {
              reject(err);
              return;
            }

            resolve({
              totalProductos: productos.totalProductos || 0,
              existenciaTotal: productos.existenciaTotal || 0,
              bajoStock: productos.bajoStock || 0,
              vencidos: vencimientos.vencidos || 0,
            });
          }
        );
      }
    );
  });

module.exports = {
  obtenerDashboard,
};
