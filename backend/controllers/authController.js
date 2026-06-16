const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../database/db");

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Usuario y contrasena son requeridos",
    });
  }

  db.get(
    "SELECT id, username, password_hash FROM usuarios WHERE username = ?",
    [String(username).trim()],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error consultando usuario",
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        });
      }

      const passwordOk = await bcrypt.compare(password, user.password_hash);

      if (!passwordOk) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        success: true,
        token,
      });
    }
  );
};

module.exports = { login };
