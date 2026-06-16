import api from "./api";

export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getStockChart = async () => {
  const res = await api.get("/dashboard/stock-general");
  return res.data;
};

export const getCriticalProducts = async () => {
  const res = await api.get("/dashboard/criticos");
  return res.data;
};
