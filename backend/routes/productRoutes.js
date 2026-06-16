const express = require("express");
const router = express.Router();

const {
  getProducts,
  importarProductosHandler
} = require("../controllers/productController");

router.post("/importar", importarProductosHandler);
router.get("/", getProducts);

module.exports = router;
