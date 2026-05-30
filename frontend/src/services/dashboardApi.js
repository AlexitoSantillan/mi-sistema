import api from "./api";

// KPI principal
export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

// Top 10 stock
export const getStockChart = async () => {
  const res = await api.get("/dashboard/stock-chart");
  return res.data;
};

// críticos
export const getCriticalProducts = async () => {
  const res = await api.get("/dashboard/criticos");
  return res.data;
};