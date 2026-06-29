require("dotenv").config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no esta definido. Configuralo en backend/.env antes de iniciar el servidor.");
}

const express = require("express");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const vencimientoRoutes = require("./routes/vencimientoRoutes");
const verificarToken = require("./middleware/authMiddleware");

const { importarProductos } = require("./services/importarProductos");
const { iniciarCron } = require("./cron/alertasCron");

const app = express();

const PORT = Number(process.env.PORT || 3001);
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error("Origen CORS no permitido"));
  },
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/test", (req, res) => {
  res.json({
    mensaje: "Backend conectado correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/productos", verificarToken, productRoutes);
app.use("/api/dashboard", verificarToken, dashboardRoutes);
app.use("/api/vencimientos", verificarToken, vencimientoRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  await importarProductos();
  iniciarCron();
});
