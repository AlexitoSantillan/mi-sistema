const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "albeyro_secret_123";

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};

module.exports = verificarToken;
