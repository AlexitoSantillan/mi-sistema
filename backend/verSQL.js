const fs = require("fs");

const sql = fs.readFileSync(
  "./uploads/productos.sql",
  "utf8"
);

console.log(
  sql.substring(0, 3000)
);