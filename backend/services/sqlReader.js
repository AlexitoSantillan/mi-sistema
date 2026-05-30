const fs = require("fs");

const ruta = "./sql/productos.sql";

fs.readFile(ruta, "utf8", (err, data) => {
  if (err) {
    console.log("Error leyendo archivo:", err);
    return;
  }

  console.log("ARCHIVO LEIDO CORRECTAMENTE");
  console.log(data);
});