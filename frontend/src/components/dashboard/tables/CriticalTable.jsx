import { useEffect, useState } from "react";
import { getCriticalProducts } from "../../../services/dashboardApi";

function CriticalTable() {

  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getCriticalProducts();
      setData(res);
    } catch (err) {
      console.error("Error loading critical products:", err);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Existencias</th>
          <th>Estado</th>
        </tr>
      </thead>

      <tbody>
        {data.map((p, i) => (
          <tr key={i}>
            <td>{p.name}</td>
            <td>{p.stock}</td>
            <td>{p.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CriticalTable;