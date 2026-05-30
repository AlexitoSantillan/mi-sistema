const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getStockGeneral,
  getControlStock,
  getDistribucionStock,
  getVencimientosEstado,
  getCriticalProducts
} = require("../controllers/dashboardController");

// =========================
// KPIs
// =========================
router.get("/", getDashboard);

// =========================
// GRAFICOS
// =========================
router.get("/stock-general", getStockGeneral);

router.get("/control-stock", getControlStock);

router.get("/distribucion-stock", getDistribucionStock);

router.get("/vencimientos-estado", getVencimientosEstado);

// =========================
// PRODUCTOS CRITICOS
// =========================
router.get("/criticos", getCriticalProducts);

module.exports = router;