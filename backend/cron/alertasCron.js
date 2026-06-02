const cron = require("node-cron");
const { ejecutarAlertas } = require("../services/notificacionService");

const iniciarCron = () => {

  // 🔄 cada hora
  cron.schedule("0 * * * *", () => {
    console.log("🔄 Ejecutando revisión de vencimientos...");
    ejecutarAlertas();
  });

  // 🚀 ejecución al iniciar sistema
  ejecutarAlertas();
};

module.exports = { iniciarCron };