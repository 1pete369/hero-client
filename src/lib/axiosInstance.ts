import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host);
    if (isLocal) return "http://localhost:5002/api";
  }
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
  return normalizeApiBase(raw);
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});


