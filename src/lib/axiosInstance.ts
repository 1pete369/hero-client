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
    // Log error for debugging
    console.log('API Error:', error.message);
    
    // Handle network errors specifically for iOS Safari
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.log('Network error detected, this might be iOS Safari related');
    }
    
    return Promise.reject(error);
  }
);


