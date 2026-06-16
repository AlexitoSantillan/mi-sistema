const express = require("express");
const router = express.Router();

const {
  getVencimientos,
  createVencimiento,
  updateVencimiento,
  deleteVencimiento,
  getVencidos
} = require("../controllers/vencimientoController");

router.get("/vencidos", getVencidos);
router.get("/", getVencimientos);
router.post("/", createVencimiento);
router.put("/:id", updateVencimiento);
router.delete("/:id", deleteVencimiento);

module.exports = router;
