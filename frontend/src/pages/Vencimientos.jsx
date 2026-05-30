import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import { exportarPDF } from "../utils/exportarPDF";

function Vencimientos() {

  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [editId, setEditId] = useState(null);

  // =========================
  // CARGAR PRODUCTOS
  // =========================
  const cargarProductos = async () => {

    try {

      const res = await api.get("/productos");

      const lista = res.data.map((p) => {

      const stockTotal =
        (Number(p.stock_en_cajas || 0) * Number(p.cantidad_por_caja || 0)) +
        Number(p.stock_en_unidades || 0);

      return {
        value: p.codigo,
        label: p.descripcion,
        stock: stockTotal
      };

      });

      setProductos(lista);

    } catch (err) {

      console.error(err);

    }

  };

  // =========================
  // CARGAR HISTORIAL
  // =========================
  const cargarHistorial = async () => {

    try {
      const res = await api.get("/vencimientos");
      setHistorial(res.data);
    } catch (err) {
      console.error(err);

    }

  };

  // =========================
  // LOAD
  // =========================
  useEffect(() => {

    cargarProductos();
    cargarHistorial();

  }, []);

  // =========================
  // LIMPIAR
  // =========================
  const limpiar = () => {

    setProductoSeleccionado(null);
    setLote("");
    setFecha("");
    setEditId(null);

  };

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {

    if (!productoSeleccionado || !lote || !fecha) {

      alert("Completa todos los campos");

      return;

    }

    const payload = {
      producto_codigo: productoSeleccionado.value,
      lote,
      fecha_vencimiento: fecha
    };

    try {
      if (editId) {
        await api.put(`/vencimientos/${editId}`, payload);
      } else {
        await api.post("/vencimientos", payload);
      }

      limpiar();
      cargarHistorial();
      cargarProductos();

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.error ||
        "Error al guardar"
      );

    }

  };

  // =========================
  // EDITAR
  // =========================
  const editar = (item) => {

    const producto =
      productos.find(
        (p) => p.value === item.producto_codigo
      );

    setProductoSeleccionado(producto);

    setLote(item.lote || "");

    setFecha(item.fecha_vencimiento || "");

    setEditId(item.id);

  };

  // =========================
  // ELIMINAR
  // =========================
  const eliminar = async (id) => {

    try {

      await api.delete(`/vencimientos/${id}`);

      cargarHistorial();

    } catch (err) {

      console.error(err);

    }

  };

  // =========================
  // FILTRAR
  // =========================
  const filtrados = historial.filter((item) =>
    (item.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // =========================
  // STOCK ACTUAL
  // =========================
  const stockActual =
    productoSeleccionado?.stock || 0;

  // =========================
  // UI
  // =========================
  return (

    <div className="container">

      <h2>Registro de Vencimientos</h2>

      {/* SELECT PRODUCTO */}
      <div style={{ marginBottom: "15px" }}>

        <Select
          options={productos}
          value={productoSeleccionado}
          placeholder="Buscar producto por nombre..."
          isSearchable
          noOptionsMessage={() =>
            "No se encontraron productos"
          }
          onChange={setProductoSeleccionado}
        />

      </div>


      {/* INPUTS */}
      <input
        placeholder="Lote"
        value={lote}
        onChange={(e) =>
          setLote(e.target.value)
        }
      />

      <input
        type="date"
        value={fecha}
        onChange={(e) =>
          setFecha(e.target.value)
        }
      />

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
          marginBottom: "20px"
        }}
      >

        <button onClick={guardar}>
          {editId ? "Actualizar" : "Guardar"}
        </button>

        <button onClick={limpiar}>
          Cancelar
        </button>

        <button
          onClick={() =>
            exportarPDF(filtrados)
          }
        >
          Exportar PDF
        </button>

      </div>

      <hr />

      {/* BUSCADOR */}
      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
      />

      {/* TABLA */}
      <table>

        <thead>

          <tr>
            <th>Producto</th>
            <th>Lote</th>
            <th>Existencias</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>

        </thead>

        <tbody>

          {filtrados.map((item) => (

            <tr key={item.id}>

              <td>{item.nombre}</td>

              <td>{item.lote}</td>

              <td>{item.cantidad_real}</td>

              <td>{item.fecha_vencimiento}</td>

              <td>

                <button
                  onClick={() =>
                    editar(item)
                  }
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    eliminar(item.id)
                  }
                >
                  Eliminar
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default Vencimientos;