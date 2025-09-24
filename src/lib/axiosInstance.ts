import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getBaseURL = () => {
  const rawFromEnv = process.env.NEXT_PUBLIC_MAIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "";

  // Browser: honor explicit env if provided; otherwise same-origin for dev
  if (typeof window !== "undefined") {
    return rawFromEnv ? normalizeApiBase(rawFromEnv) : "/api";
  }

  // SSR: same logic
  return rawFromEnv ? normalizeApiBase(rawFromEnv) : "/api";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});


