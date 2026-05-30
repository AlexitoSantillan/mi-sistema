const express = require("express");
const router = express.Router();

const {
  getVencimientos,
  createVencimiento,
  updateVencimiento,
  deleteVencimiento,
  getVencidos
} = require("../controllers/vencimientoController");

router.get("/", getVencimientos);
router.post("/", createVencimiento);
router.put("/:id", updateVencimiento);
router.delete("/:id", deleteVencimiento);

router.get("/vencidos", getVencidos);

module.exports = router;