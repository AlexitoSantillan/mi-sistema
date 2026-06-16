const notifier = require("node-notifier");
const db = require("../database/db");

const ETAPAS_ALERTA = [90, 60, 30, 15, 10, 5, 4, 3, 2, 1, 0];

const ejecutarAlertas = () => {
  db.all(`
    SELECT
      v.id AS vencimiento_id,
      v.producto_codigo,
      COALESCE(p.descripcion, 'Producto sin descripcion') AS producto_nombre,
      v.lote,
      v.fecha_vencimiento,
      CAST((julianday(v.fecha_vencimiento) - julianday('now')) AS INTEGER) AS dias_restantes
    FROM vencimientos v
    LEFT JOIN productos p ON p.codigo = v.producto_codigo
    WHERE v.fecha_vencimiento IS NOT NULL
  `, [], (err, rows) => {
    if (err) {
      console.error("Error consultando vencimientos:", err);
      return;
    }

    rows.forEach((item) => {
      if (!ETAPAS_ALERTA.includes(item.dias_restantes)) return;

      registrarAlertaEnviada(item, (registrada) => {
        if (!registrada) return;

        const mensaje = `${item.producto_nombre} (Lote: ${item.lote}) vence en ${item.dias_restantes} dias`;

        registrarAlerta({
          vencimiento_id: item.vencimiento_id,
          producto_codigo: item.producto_codigo,
          producto_nombre: item.producto_nombre,
          lote: item.lote,
          dias_restantes: item.dias_restantes,
          mensaje,
        });

        notifier.notify({
          title: "Alerta Inteligente de Vencimiento",
          message: mensaje,
          sound: true,
          wait: false,
        });

        console.log("ALERTA ENVIADA:", mensaje);
      });
    });
  });
};

const registrarAlerta = (data) => {
  db.run(`
    INSERT INTO alertas (
      vencimiento_id,
      producto_codigo,
      producto_nombre,
      lote,
      dias_restantes,
      mensaje,
      nivel_alerta
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    data.vencimiento_id,
    data.producto_codigo,
    data.producto_nombre,
    data.lote,
    data.dias_restantes,
    data.mensaje,
    data.dias_restantes,
  ], (err) => {
    if (err) {
      console.error("Error registrando alerta:", err.message);
    }
  });
};

const registrarAlertaEnviada = (data, callback) => {
  db.run(`
    INSERT OR IGNORE INTO alertas_enviadas (
      vencimiento_id,
      dias_alerta,
      lote,
      fecha_vencimiento
    )
    VALUES (?, ?, ?, ?)
  `, [
    data.vencimiento_id,
    data.dias_restantes,
    data.lote,
    data.fecha_vencimiento,
  ], function onInsert(err) {
    if (err) {
      console.error("Error registrando control de alerta:", err.message);
      callback(false);
      return;
    }

    callback(this.changes > 0);
  });
};

module.exports = {
  ejecutarAlertas,
};
