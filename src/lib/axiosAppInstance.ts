import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getMainApiBaseURL = () => {
  // 1) Respect explicit env when provided (e.g., production)
  const rawFromEnv = process.env.NEXT_PUBLIC_MAIN_API_URL;
  if (rawFromEnv && rawFromEnv.trim()) {
    console.log('Using env API URL:', rawFromEnv);
    return normalizeApiBase(rawFromEnv);
  }

  // 2) For local development, use same-origin to leverage Next.js proxy
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host);
    if (isLocal) {
      console.log('Using local proxy: /api');
      return "/api";
    }
  }

  // 3) Final default
  console.log('Using default: /api');
  return "/api";
};

export const axiosAppInstance = axios.create({
  baseURL: getMainApiBaseURL(),
  withCredentials: true,
});


