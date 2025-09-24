import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getBaseURL = () => {
  // Prefer same-origin for local dev to avoid CORS and SW problems
  if (typeof window !== "undefined") {
    return "/api";
  }
  // Default to same-origin in SSR as well
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  return raw ? normalizeApiBase(raw) : "/api";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});


