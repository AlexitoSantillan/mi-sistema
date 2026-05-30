const fs = require("fs");

const db = require("../database/db");

// =========================
// IMPORTAR PRODUCTOS REALES
// =========================
const importarProductos = () => {

  console.log("=================================");
  console.log("IMPORTANDO PRODUCTOS...");
  console.log("=================================");

  try {

    // =========================
    // LEER ARCHIVO SQL
    // =========================
    const sql = fs.readFileSync(
      "./uploads/productos.sql",
      "utf8"
    );

    // =========================
    // REGEX PARA EXTRAER DATOS
    // =========================
    const regex =
      /VALUES\s*\('(.+?)',\s*'(.+?)',\s*'(.+?)',\s*([\d\.]+),\s*([\d\.]+),\s*([\d\.]+)\)/g;

    let match;

    let totalImportados = 0;

    // =========================
    // LIMPIAR TABLA
    // =========================
    db.run(
      `DELETE FROM productos`,
      (err) => {

        if (err) {

          console.log(
            "Error limpiando tabla:"
          );

          console.log(err);

        } else {

          console.log(
            "Tabla productos limpiada"
          );

        }

      }
    );

    // =========================
    // RECORRER SQL
    // =========================
    while ((match = regex.exec(sql)) !== null) {

      const codigo = match[1];

      const descripcion = match[2];

      const unidad_medida = match[3];

      const cantidad_por_caja =
        parseFloat(match[4]);

      const stock_en_cajas =
        parseFloat(match[5]);

      const stock_en_unidades =
        parseFloat(match[6]);

      // =========================
      // MOSTRAR EN TERMINAL
      // =========================
      console.log(
        `Importando: ${codigo} - ${descripcion}`
      );

      // =========================
      // INSERTAR EN SQLITE
      // =========================
      db.run(
        `
        INSERT INTO productos (

          codigo,
          descripcion,
          unidad_medida,
          cantidad_por_caja,
          stock_en_cajas,
          stock_en_unidades

        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          codigo,
          descripcion,
          unidad_medida,
          cantidad_por_caja,
          stock_en_cajas,
          stock_en_unidades
        ],
        (err) => {

          if (err) {

            console.log(
              "Error insertando producto:"
            );

            console.log(err);

          }

        }
      );

      totalImportados++;

    }

    // =========================
    // RESULTADO FINAL
    // =========================
    console.log("=================================");
    console.log(
      `TOTAL IMPORTADOS: ${totalImportados}`
    );
    console.log(
      "PRODUCTOS IMPORTADOS CORRECTAMENTE"
    );
    console.log("=================================");

    // =========================
    // MOSTRAR PRODUCTOS
    // =========================
    db.all(
      `
      SELECT *
      FROM productos
      LIMIT 5
      `,
      [],
      (err, rows) => {

        if (err) {

          console.log(err);

        } else {

          console.log(
            "================================="
          );

          console.log(
            "PRIMEROS PRODUCTOS:"
          );

          console.log(rows);

          console.log(
            "================================="
          );

        }

      }
    );

  } catch (error) {

    console.log(
      "ERROR IMPORTANDO PRODUCTOS:"
    );

    console.log(error);

  }

};

const guardarHistorialStock = () => {
  db.run(`
    INSERT INTO historial_stock (fecha, total_productos, stock_total)
    VALUES (
      datetime('now'),
      (SELECT COUNT(*) FROM productos),
      (SELECT SUM(stock_en_cajas + stock_en_unidades) FROM productos)
    )
  `);
};
module.exports = {
  importarProductos
};