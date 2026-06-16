import { useEffect, useState } from "react";

import api from "../services/api";

import "../styles/dashboard.css";

import KpiCard from "../components/dashboard/cards/KpiCard";
import CriticalTable from "../components/dashboard/tables/CriticalTable";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [stockGeneral, setStockGeneral] = useState([]);
  const [controlStock, setControlStock] = useState([]);
  const [vencimientosEstado, setVencimientosEstado] = useState([]);

  const cargarDatos = async () => {

    try {

      // KPIS
      const dashboardRes = await api.get("/dashboard");
      setDashboard(dashboardRes.data);

      // TOP STOCK
      const stockRes = await api.get("/dashboard/stock-general");
      setStockGeneral(stockRes.data.slice(0, 5));

      // MENOS STOCK
      const controlRes = await api.get("/dashboard/control-stock");
      setControlStock(controlRes.data.slice(0, 5));

      // ESTADO VENCIMIENTOS
      const estadoRes = await api.get("/dashboard/vencimientos-estado");
      setVencimientosEstado(estadoRes.data);

    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
    }

  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================
  // LOADING
  // =========================
  if (!dashboard) {
    return (
      <div className="dashboard-loading">
        <h1>Cargando dashboard...</h1>
      </div>
    );
  }

  // =========================
  // PIE DATA
  // =========================
  const pieData = vencimientosEstado;

  const COLORS = {
    ROJO: "#dc2626",
    AMARILLO: "#facc15",
    VERDE: "#22c55e",
  };

  // =========================
  // AREA DATA
  // =========================
  const areaData = [
    { name: "Semana 1", productos: 120 },
    { name: "Semana 2", productos: 180 },
    { name: "Semana 3", productos: 240 },
    { name: "Semana 4", productos: 300 },
  ];

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">

        <div>
          <h1>Panel de Control Empresarial</h1>
          <p>Albeyro ERP</p>
        </div>

        <h2>Sistema de Inventario</h2>

      </div>

      {/* KPI */}
      <div className="kpi-grid">

        <KpiCard
          title="Total Productos"
          value={dashboard.totalProductos || 0}
          color="kpi-blue"
        />

        <KpiCard
          title="Stock Total"
          value={dashboard.existenciaTotal || 0}
          color="kpi-green"
        />

        <KpiCard
          title="Bajo Stock"
          value={dashboard.bajoStock || 0}
          color="kpi-yellow"
        />

        <KpiCard
          title="Vencidos"
          value={dashboard.vencidos || 0}
          color="kpi-red"
        />

      </div>

      {/* CHARTS */}
      <div className="chart-grid">

        {/* STOCK GENERAL */}
        <div className="chart-card">

          <h3>Top 5 Productos con Más Stock</h3>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={stockGeneral}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                interval={0}
                tick={{
                  fontSize: 10
                }}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="stock"
                fill="#1e293b"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* CONTROL STOCK */}
        <div className="chart-card">

          <h3>Top 5 Productos con Menor Stock</h3>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={controlStock}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                interval={0}
                tick={{
                  fontSize: 10
                }}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="stock"
                fill="#dc2626"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* PRODUCTOS REGISTRADOS */}
        <div className="chart-card">

          <h3>Movimiento de Productos</h3>

          <ResponsiveContainer width="100%" height={320}>

            <AreaChart data={areaData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="productos"
                stroke="#7c3aed"
                fill="#c4b5fd"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

        {/* PIE */}
        <div className="chart-card">

          <h3>Estados de Productos</h3>

          <ResponsiveContainer width="100%" height={320}>

          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[entry.name] || "#999"}
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

        <h3>Productos Críticos</h3>

        <CriticalTable />

      </div>

    </div>
  );
}

export default Dashboard;
