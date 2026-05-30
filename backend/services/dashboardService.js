const db = require("../database/db");

const obtenerDashboard = () => {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT COUNT(*) as total
      FROM productos
      `,
      [],
      (err, totalProductos) => {

        if (err) {
          reject(err);
          return;
        }

        db.get(
          `
          SELECT
            SUM(stock_cajas) as cajas,
            SUM(stock_unidades) as unidades
          FROM productos
          `,
          [],
          (err, stockData) => {

            if (err) {
              reject(err);
              return;
            }

            resolve({
              totalProductos:
                totalProductos.total || 0,

              stockCajas:
                stockData.cajas || 0,

              stockUnidades:
                stockData.unidades || 0,

              porVencer: 15,
              vencidos: 4,
            });

          }
        );

      }
    );

  });

};

module.exports = {
  obtenerDashboard,
};