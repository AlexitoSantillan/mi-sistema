import api from "./api";

export const getVencimientos = () =>
  api.get("/vencimientos");

export const createVencimiento = (data) =>
  api.post("/vencimientos", data);

export const updateVencimiento = (id, data) =>
  api.put(`/vencimientos/${id}`, data);

export const deleteVencimiento = (id) =>
  api.delete(`/vencimientos/${id}`);