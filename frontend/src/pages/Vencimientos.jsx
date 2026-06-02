import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import { exportarPDF } from "../utils/exportarPDF";
import { exportarExcel } from "../utils/exportarExcel";

function Vencimientos() {

  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [lote, setLote] = useState("");
  const [fecha, setFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [editId, setEditId] = useState(null);
  const [cantidad, setCantidad] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 150;

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
    setCantidad("");
    setFecha("");
    setEditId(null);
  };

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {
    if (!productoSeleccionado || !lote || !cantidad || !fecha) {
      alert("Completa todos los campos");
      return;
    }

    const payload = {
      producto_codigo: productoSeleccionado.value,
      lote,
      cantidad,
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
      console.error("Error al guardar vencimiento:", err);
      alert(err.response?.data?.error || "Error al guardar");
    }
  };

  // =========================
  // EDITAR
  // =========================
  const editar = (item) => {
    const producto = productos.find((p) => p.value === item.producto_codigo);
    setProductoSeleccionado(producto);
    setLote(item.lote || "");
    setCantidad(item.cantidad || "");
    // FIX: normalizar fecha para el input type="date"
    setFecha(item.fecha_vencimiento ? item.fecha_vencimiento.substring(0, 10) : "");
    setEditId(item.id);
  };

  // =========================
  // ELIMINAR
  // =========================
  const eliminar = async (id) => {
    // FIX: confirmación antes de eliminar
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await api.delete(`/vencimientos/${id}`);
      cargarHistorial();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // FORMATEAR FECHA
  // =========================
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "-";
    return new Date(fechaStr + "T00:00:00").toLocaleDateString("es-PE");
  };

  // =========================
  // FILTRAR
  // =========================
  const filtrados = historial.filter((item) => {
    const coincideBusqueda = (item.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const vencido = new Date(item.fecha_vencimiento) < new Date();
    const stockBajo = Number(item.cantidad_real) < 20;

    if (filtroEstado === "VENCIDOS") return coincideBusqueda && vencido;
    if (filtroEstado === "STOCK_BAJO") return coincideBusqueda && stockBajo && !vencido;
    if (filtroEstado === "OK") return coincideBusqueda && !vencido && !stockBajo;

    return coincideBusqueda;
  });

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const datosPagina = filtrados.slice(primerRegistro, ultimoRegistro);

  // =========================
  // STOCK ACTUAL
  // =========================
  const stockActual = productoSeleccionado?.stock || 0;

  // =========================
  // UI
  // =========================
  return (
    <div className="container">

      <h2>Registro de Vencimientos</h2>

      {/* SELECT PRODUCTO */}
      <div style={{ marginBottom: "10px" }}>
        <Select
          options={productos}
          value={productoSeleccionado}
          placeholder="Buscar producto por nombre..."
          isSearchable
          noOptionsMessage={() => "No se encontraron productos"}
          onChange={setProductoSeleccionado}
        />
      </div>

      {/* FIX: existencias FUERA de la tabla, debajo del Select */}
      {productoSeleccionado && (
        <div
          style={{
            marginBottom: "15px",
            fontWeight: "bold",
            color: "#2563eb"
          }}
        >
          Existencias actuales: {stockActual}
        </div>
      )}

      {/* INPUTS */}
      <input
        placeholder="Lote"
        value={lote}
        onChange={(e) => setLote(e.target.value)}
      />

      <input
        type="number"
        placeholder="Cantidad del lote"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
      />

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
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

        <button onClick={() => exportarPDF(filtrados)}>
          Exportar PDF
        </button>

        <button onClick={() => exportarExcel(filtrados)}>
          Exportar Excel
        </button>
      </div>

      <hr />

      {/* BUSCADOR */}
      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setPaginaActual(1); // FIX: reiniciar paginación al buscar
        }}
      />

      <select
        value={filtroEstado}
        onChange={(e) => {
          setFiltroEstado(e.target.value);
          setPaginaActual(1); // FIX: reiniciar paginación al cambiar filtro
        }}
        style={{ marginLeft: "10px", padding: "8px" }}
      >
        <option value="TODOS">Todos</option>
        <option value="VENCIDOS">Vencidos</option>
        <option value="STOCK_BAJO">Stock Bajo</option>
        <option value="OK">OK</option>
      </select>

      {/* TABLA */}
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Lote</th>
            <th>Cantidad Lote</th>
            <th>Existencias</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {datosPagina.map((item) => {
            const vencido = new Date(item.fecha_vencimiento) < new Date();
            const stockBajo = Number(item.cantidad_real) < 20;

            return (
              <tr key={item.id}>
                <td>{item.nombre}</td>

                <td>{item.lote}</td>

                {/* FIX: ahora item.cantidad viene del backend */}
                <td>{item.cantidad}</td>

                <td>{item.cantidad_real}</td>

                {/* FIX: fecha formateada */}
                <td>{formatearFecha(item.fecha_vencimiento)}</td>

                <td>
                  {vencido ? (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        fontWeight: "bold"
                      }}
                    >
                      VENCIDO
                    </span>
                  ) : stockBajo ? (
                    <span
                      style={{
                        background: "#fef3c7",
                        color: "#d97706",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        fontWeight: "bold"
                      }}
                    >
                      STOCK BAJO
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#16a34a",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        fontWeight: "bold"
                      }}
                    >
                      OK
                    </span>
                  )}
                </td>

                <td>
                  <button onClick={() => editar(item)}>Editar</button>
                  <button onClick={() => eliminar(item.id)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >
          Anterior
        </button>

        <span>Página {paginaActual}</span>

        <button
          disabled={ultimoRegistro >= filtrados.length}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>

    </div>
  );
}

export default Vencimientos;
