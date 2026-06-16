import { useState } from "react";

function Historial() {
  const [productos] = useState([
    { id: 1, nombre: "Galleta Soda" },
    { id: 2, nombre: "Leche Gloria" },
    { id: 3, nombre: "Arroz Costeno" },
  ]);

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [stock, setStock] = useState("");
  const [fecha, setFecha] = useState("");

  const guardarHistorial = async () => {
    if (!productoSeleccionado || !stock || !fecha) {
      alert("Completa todos los campos");
      return;
    }

    const producto = productos.find(
      (p) => p.id === Number(productoSeleccionado)
    );

    if (!producto) {
      alert("Producto invalido");
      return;
    }

    try {
      const res = await fetch("/api/historial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          producto_id: producto.id,
          nombre: producto.nombre,
          stock,
          fecha,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Historial guardado");

        setProductoSeleccionado("");
        setStock("");
        setFecha("");
      }
    } catch {
      alert("Error al guardar");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Registrar Historial Diario</h2>

        <select
          value={productoSeleccionado}
          onChange={(event) => setProductoSeleccionado(event.target.value)}
        >
          <option value="">
            Seleccionar producto
          </option>

          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre}
            </option>
          ))}
        </select>

        <br />
        <br />

        <input
          type="number"
          placeholder="Stock actual"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />

        <br />
        <br />

        <input
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />

        <br />
        <br />

        <button onClick={guardarHistorial}>
          Guardar Historial
        </button>
      </div>
    </div>
  );
}

export default Historial;
