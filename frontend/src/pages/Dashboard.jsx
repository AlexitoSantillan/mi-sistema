import { useEffect, useState } from "react";
import { testBackend } from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    testBackend().then((data) => {
      setMensaje(data.mensaje);
    });
  }, []);

  // GRAFICO TEMPORAL
  const data = [
    { fecha: "Lun", ventas: 10 },
    { fecha: "Mar", ventas: 25 },
    { fecha: "Mié", ventas: 15 },
    { fecha: "Jue", ventas: 30 },
    { fecha: "Vie", ventas: 18 },
    { fecha: "Sáb", ventas: 40 },
    { fecha: "Dom", ventas: 22 },
  ];

  // CIRCULOS KPI
  const dashboard = {
    vigentes: 120,
    porVencer: 15,
    vencidos: 4,
    total: 139,
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>

        <p>{mensaje}</p>

        <hr style={{ margin: "20px 0" }} />

        {/* GRAFICO */}
        <h3>Ventas Semanales</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="fecha" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <hr style={{ margin: "30px 0" }} />

        {/* CIRCULOS */}
        <h3>Resumen de Productos</h3>

        <div className="dashboard-grid">

          <div className="circle-card green">
            <h2>{dashboard.vigentes}</h2>
            <p>Vigentes</p>
          </div>

          <div className="circle-card yellow">
            <h2>{dashboard.porVencer}</h2>
            <p>Por vencer</p>
          </div>

          <div className="circle-card red">
            <h2>{dashboard.vencidos}</h2>
            <p>Vencidos</p>
          </div>

          <div className="circle-card blue">
            <h2>{dashboard.total}</h2>
            <p>Total</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;