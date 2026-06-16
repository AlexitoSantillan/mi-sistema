const fs = require("fs");
const path = require("path");

const db = require("../database/db");

const PRODUCTOS_SQL_PATH =
  process.env.PRODUCTOS_SQL_PATH ||
  "D:\\generar_sql\\productos.sql";

const FALLBACK_PRODUCTOS_SQL_PATH = path.join(__dirname, "..", "uploads", "productos.sql");

const INSERT_PRODUCTOS_REGEX =
  /INSERT\s+INTO\s+productos\s*\(\s*codigo\s*,\s*descripcion\s*,\s*unidad_medida\s*,\s*cantidad_por_caja\s*,\s*stock_en_cajas\s*,\s*stock_en_unidades\s*\)\s*VALUES\s*\(\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*'((?:''|[^'])*)'\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*;/gi;

const desescaparSql = (value) => value.replace(/''/g, "'");

const ejecutar = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function resolver(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });

const obtenerRutaSqlDisponible = () => {
  if (fs.existsSync(PRODUCTOS_SQL_PATH)) {
    return PRODUCTOS_SQL_PATH;
  }

  if (fs.existsSync(FALLBACK_PRODUCTOS_SQL_PATH)) {
    return FALLBACK_PRODUCTOS_SQL_PATH;
  }

  return null;
};

const parsearProductos = (sql) => {
  const productos = [];
  let match;

  while ((match = INSERT_PRODUCTOS_REGEX.exec(sql)) !== null) {
    productos.push({
      codigo: desescaparSql(match[1]).trim(),
      descripcion: desescaparSql(match[2]).trim(),
      unidad_medida: desescaparSql(match[3]).trim(),
      cantidad_por_caja: Number(match[4]),
      stock_en_cajas: Number(match[5]),
      stock_en_unidades: Number(match[6]),
    });
  }

  return productos;
};

const importarProductos = async () => {
  console.log("=================================");
  console.log("IMPORTANDO PRODUCTOS...");
  console.log("=================================");

  const rutaSql = obtenerRutaSqlDisponible();

  if (!rutaSql) {
    console.warn(
      `No se encontro productos.sql. Rutas revisadas: ${PRODUCTOS_SQL_PATH} y ${FALLBACK_PRODUCTOS_SQL_PATH}`
    );
    return { success: false, totalImportados: 0 };
  }

  try {
    const sql = fs.readFileSync(rutaSql, "utf8");
    const productos = parsearProductos(sql);

    if (productos.length === 0) {
      console.warn(`No se encontraron INSERT validos en ${rutaSql}. No se modifico la tabla productos.`);
      return { success: false, totalImportados: 0 };
    }

    await ejecutar("BEGIN IMMEDIATE TRANSACTION");

    try {
      await ejecutar("DELETE FROM productos");

      for (const producto of productos) {
        await ejecutar(
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
          ON CONFLICT(codigo) DO UPDATE SET
            descripcion = excluded.descripcion,
            unidad_medida = excluded.unidad_medida,
            cantidad_por_caja = excluded.cantidad_por_caja,
            stock_en_cajas = excluded.stock_en_cajas,
            stock_en_unidades = excluded.stock_en_unidades
          `,
          [
            producto.codigo,
            producto.descripcion,
            producto.unidad_medida,
            producto.cantidad_por_caja,
            producto.stock_en_cajas,
            producto.stock_en_unidades,
          ]
        );
      }

      await guardarHistorialStock();
      await ejecutar("COMMIT");

      console.log(`TOTAL IMPORTADOS: ${productos.length}`);
      console.log(`Archivo procesado: ${rutaSql}`);
      console.log("PRODUCTOS IMPORTADOS CORRECTAMENTE");

      return { success: true, totalImportados: productos.length };
    } catch (error) {
      await ejecutar("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("ERROR IMPORTANDO PRODUCTOS:", error);
    return { success: false, totalImportados: 0, error };
  }
};

const guardarHistorialStock = () =>
  ejecutar(`
    INSERT INTO historial_stock (fecha, total_productos, stock_total)
    VALUES (
      datetime('now'),
      (SELECT COUNT(*) FROM productos),
      (
        SELECT COALESCE(SUM(
          (COALESCE(stock_en_cajas, 0) * COALESCE(cantidad_por_caja, 0)) +
          COALESCE(stock_en_unidades, 0)
        ), 0)
        FROM productos
      )
    )
  `);

module.exports = {
  importarProductos,
  parsearProductos,
};
