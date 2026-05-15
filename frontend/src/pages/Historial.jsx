import { useState, useEffect } from "react";

function Historial() {

  const [productos] = useState([
    { id: 1, nombre: "Galleta Soda" },
    { id: 2, nombre: "Leche Gloria" },
    { id: 3, nombre: "Arroz Costeño" },
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
      (p) => p.id == productoSeleccionado
    );

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

    } catch (error) {

      alert("Error al guardar");
    }
  };

  return (
    <div className="container">

      <div className="card">

        <h2>Registrar Historial Diario</h2>

        {/* PRODUCTO */}
        <select
          value={productoSeleccionado}
          onChange={(e) =>
            setProductoSeleccionado(e.target.value)
          }
        >
          <option value="">
            Seleccionar producto
          </option>

          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        {/* STOCK */}
        <input
          type="number"
          placeholder="Stock actual"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value)
          }
        />

        <br /><br />

        {/* FECHA */}
        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(e.target.value)
          }
        />

        <br /><br />

        <button onClick={guardarHistorial}>
          Guardar Historial
        </button>

      </div>

    </div>
  );
}

export default Historial;