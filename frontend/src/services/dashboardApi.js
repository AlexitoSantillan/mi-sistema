import api from "./api";

export const getDashboard = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getStockGeneral = async () => {
  const res = await api.get("/dashboard/stock-general");
  return res.data;
};

export const getControlStock = async () => {
  const res = await api.get("/dashboard/control-stock");
  return res.data;
};

export const getVencimientosEstado = async () => {
  const res = await api.get("/dashboard/vencimientos-estado");
  return res.data;
};

export const getHistorialStock = async () => {
  const res = await api.get("/dashboard/historial");
  return res.data;
};

export const getCriticalProducts = async () => {
  const res = await api.get("/dashboard/criticos");
  return res.data;
};

export const actualizarProductos = async () => {
  const res = await api.post("/productos/importar");
  return res.data;
};
