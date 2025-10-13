import axios from "axios";

const normalizeApiBase = (raw: string) => {
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return `${url}/api`;
};

const getBaseURL = () => {
  const isDev = process.env.NODE_ENV !== "production";
  const rawFromEnv = process.env.NEXT_PUBLIC_MAIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "";

  // In development, always use same-origin proxy to avoid CORS/cookie issues
  if (isDev) {
    return "/api";
  }

  // In production, honor explicit env if provided; otherwise same-origin
  return rawFromEnv ? normalizeApiBase(rawFromEnv) : "/api";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for iOS Safari compatibility
axiosInstance.interceptors.request.use(
  (config) => {
    // Add cache-busting for iOS Safari
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Avoid noisy logs for expected 4xx errors; only surface unexpected 5xx
    if (status && status >= 500) {
      console.error('API Error:', error.message);
    }
    // Minimal handling for iOS Safari network anomalies without logging
    return Promise.reject(error);
  }
);


