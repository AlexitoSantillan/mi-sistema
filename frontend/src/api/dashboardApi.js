import api from "./api";

export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getStockChart = async () => {
  const res = await api.get("/dashboard/chart/stock");
  return res.data;
};