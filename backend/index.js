const express = require("express");
const cors = require("cors");

const app = express();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const vencimientoRoutes = require("./routes/vencimientoRoutes");

const { importarProductos } = require("./services/importarProductos");
const { iniciarCron } = require("./cron/alertasCron"); // ✔ CORRECTO

app.use(cors());
app.use(express.json());

app.use("/api/productos", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vencimientos", vencimientoRoutes);

// TEST API
app.get("/api/test", (req, res) => {
  res.json({
    mensaje: "Backend conectado correctamente 🚀"
  });
});

const PORT = 3001;

// cargar productos
importarProductos();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  iniciarCron(); // ✔ ahora sí funciona
});