export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5800/icodses";

export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL || window.location.origin;

export const apiUrl = (path = "") => {
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

