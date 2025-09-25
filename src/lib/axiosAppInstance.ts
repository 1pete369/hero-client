import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getMainApiBaseURL = () => {
  // 1) Prefer same-origin in local dev to avoid CORS and SW issues
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host);
    if (isLocal) return "/api";
  }

  // 2) Respect explicit env when not local (e.g., production)
  const rawFromEnv = process.env.NEXT_PUBLIC_MAIN_API_URL;
  if (rawFromEnv && rawFromEnv.trim()) {
    return normalizeApiBase(rawFromEnv);
    
  }

  // 3) Final default
  return "/api";
};

export const axiosAppInstance = axios.create({
  baseURL: getMainApiBaseURL(),
  withCredentials: true,
});


