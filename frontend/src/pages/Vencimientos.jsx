import { useState } from "react";

function Vencimientos() {
  const [productos] = useState([
    { id: 1, nombre: "Galleta Soda" },
    { id: 2, nombre: "Leche Gloria" },
    { id: 3, nombre: "Arroz Costeño" },
  ]);

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState("");

  const guardar = async () => {
    if (!productoSeleccionado || !cantidad || !fecha) {
      alert("Completa todos los campos");
      return;
    }

    const producto = productos.find(
      (p) => p.id == productoSeleccionado
    );

    try {
      const res = await fetch("/api/vencimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad,
          fecha_vencimiento: fecha,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Guardado correctamente");

        setProductoSeleccionado("");
        setCantidad("");
        setFecha("");
      }
    } catch (error) {
      alert("Error al conectar");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Registrar Vencimiento</h2>

        {/* SELECT PRODUCTOS */}
        <select
          value={productoSeleccionado}
          onChange={(e) =>
            setProductoSeleccionado(e.target.value)
          }
        >
          <option value="">Seleccionar producto</option>

          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <button onClick={guardar}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default Vencimientos;