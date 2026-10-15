import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("samvedna_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const setToken = (t) => localStorage.setItem("samvedna_token", t);
export const clearToken = () => localStorage.removeItem("samvedna_token");
export const getToken = () => localStorage.getItem("samvedna_token");

export const errMsg = (e, fb) => {
  const d = e?.response?.data?.detail;
  if (Array.isArray(d)) return d.map(x => `${(x.loc || []).slice(1).join(".")}: ${x.msg}`).join("; ");
  if (typeof d === "string") return d;
  return fb;
};
