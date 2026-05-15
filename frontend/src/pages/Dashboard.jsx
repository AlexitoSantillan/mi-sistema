import { useEffect, useState } from "react";
import { testBackend } from "../services/api";

import "../styles/dashboard.css";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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

  // DATOS
  const data = [
    { fecha: "Ene", ventas: 40 },
    { fecha: "Feb", ventas: 65 },
    { fecha: "Mar", ventas: 30 },
    { fecha: "Abr", ventas: 90 },
    { fecha: "May", ventas: 75 },
    { fecha: "Jun", ventas: 120 },
    { fecha: "Jul", ventas: 100 },
  ];

  // PIE
  const pieData = [
    { name: "Vigentes", value: 120 },
    { name: "Por vencer", value: 15 },
    { name: "Vencidos", value: 4 },
  ];

  const COLORS = [
    "#0f766e",
    "#ca8a04",
    "#dc2626",
  ];

  // KPI
  const dashboard = {
    ventas: 1250,
    ganancia: "S/ 15,800",
    vencidos: 4,
    total: 139,
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Empresarial</h1>
          <p>{mensaje}</p>
        </div>

        <h2>
          Sistema de Vencimientos
        </h2>
      </div>

      {/* KPI */}
      <div className="kpi-grid">

        <div className="kpi-card kpi-blue">
          <p>Ventas Totales</p>
          <h2>{dashboard.ventas}</h2>
        </div>

        <div className="kpi-card kpi-green">
          <p>Ganancia</p>
          <h2>{dashboard.ganancia}</h2>
        </div>

        <div className="kpi-card kpi-yellow">
          <p>Por Vencer</p>
          <h2>15</h2>
        </div>

        <div className="kpi-card kpi-red">
          <p>Vencidos</p>
          <h2>{dashboard.vencidos}</h2>
        </div>

      </div>

      {/* GRAFICOS */}
      <div className="chart-grid">

        {/* GRAFICO 1 */}
        <div className="chart-card">
          <h3>Ventas Mensuales</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="fecha" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="ventas"
                fill="#1e293b"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GRAFICO 2 */}
        <div className="chart-card">
          <h3>Ventas Semanales</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="fecha" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#0f766e"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GRAFICO 3 */}
        <div className="chart-card">
          <h3>Ventas Anuales</h3>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="fecha" />

              <YAxis />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="ventas"
                stroke="#7c3aed"
                fill="#c4b5fd"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* GRAFICO 4 */}
        <div className="chart-card">
          <h3>Estado Productos</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>

              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >

                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TABLA */}
      <div className="table-card">

        <h3>
          Productos Más Vendidos
        </h3>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Ventas</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Leche Gloria</td>
              <td>120</td>
              <td>Activo</td>
            </tr>

            <tr>
              <td>Arroz Costeño</td>
              <td>95</td>
              <td>Activo</td>
            </tr>

            <tr>
              <td>Galleta Soda</td>
              <td>80</td>
              <td>Por vencer</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>
  );
}

export default Dashboard;