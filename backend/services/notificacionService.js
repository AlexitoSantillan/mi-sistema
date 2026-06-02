const notifier = require("node-notifier");
const db = require("../database/db");

// 🔥 niveles inteligentes de alerta
const ETAPAS_ALERTA = [90, 60, 30, 15, 10, 5, 4, 3, 2, 1, 0];

/**
 * =========================
 * 🔔 EJECUTAR ALERTAS
 * =========================
 */
const ejecutarAlertas = () => {

  db.all(`
    SELECT
      v.id AS vencimiento_id,
      v.producto_codigo,
      p.descripcion AS producto_nombre,
      v.lote,
      v.fecha_vencimiento,
      CAST((julianday(v.fecha_vencimiento) - julianday('now')) AS INTEGER) AS dias_restantes
    FROM vencimientos v
    LEFT JOIN productos p ON p.codigo = v.producto_codigo
  `, (err, rows) => {

    if (err) {
      console.error("Error consultando vencimientos:", err);
      return;
    }

    rows.forEach((item) => {

      const {
        vencimiento_id,
        producto_codigo,
        producto_nombre,
        lote,
        fecha_vencimiento,
        dias_restantes
      } = item;

      // ❌ ignorar si no es etapa válida
      if (!ETAPAS_ALERTA.includes(dias_restantes)) return;

      verificarSiYaFueNotificada(
        vencimiento_id,
        dias_restantes,
        lote,
        fecha_vencimiento,
        (existe) => {

          if (existe) return;

          const mensaje = `${producto_nombre} (Lote: ${lote}) vence en ${dias_restantes} días`;

          // 💾 guardar en historial
          registrarAlerta({
            vencimiento_id,
            producto_codigo,
            producto_nombre,
            lote,
            dias_restantes,
            mensaje
          });

          // 💾 guardar control anti-duplicados
          registrarAlertaEnviada({
            vencimiento_id,
            dias_restantes,
            lote,
            fecha_vencimiento
          });

          // 🔔 notificación Windows
          notifier.notify({
            title: "⚠️ Alerta Inteligente de Vencimiento",
            message: mensaje,
            sound: true,
            wait: false
          });

          console.log("🔔 ALERTA ENVIADA:", mensaje);
        }
      );

    });

  });

};

/**
 * =========================
 * 🔍 VERIFICAR DUPLICADO
 * =========================
 */
const verificarSiYaFueNotificada = (
  vencimiento_id,
  dias_restantes,
  lote,
  fecha_vencimiento,
  callback
) => {

  db.get(`
    SELECT id FROM alertas_enviadas
    WHERE vencimiento_id = ?
      AND dias_alerta = ?
      AND lote = ?
      AND fecha_vencimiento = ?
  `, [
    vencimiento_id,
    dias_restantes,
    lote,
    fecha_vencimiento
  ], (err, row) => {

    if (err) {
      console.error(err);
      return callback(true);
    }

    callback(!!row);
  });

};

/**
 * =========================
 * 💾 GUARDAR HISTORIAL ALERTA
 * =========================
 */
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
    data.dias_restantes
  ]);

};

/**
 * =========================
 * 💾 GUARDAR CONTROL ENVÍOS
 * =========================
 */
const registrarAlertaEnviada = (data) => {

  db.run(`
    INSERT INTO alertas_enviadas (
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
    data.fecha_vencimiento
  ]);

};

module.exports = {
  ejecutarAlertas
};