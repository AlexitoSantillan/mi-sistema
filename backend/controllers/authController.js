const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "albeyro_secret_123";

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Usuario y contrasena son requeridos",
    });
  }

  if (username === "admin" && password === "admin") {
    const token = jwt.sign(
      { username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      success: true,
      token,
    });
  }

  return res.status(401).json({
    success: false,
    message: "Credenciales incorrectas",
  });
};

module.exports = { login };
