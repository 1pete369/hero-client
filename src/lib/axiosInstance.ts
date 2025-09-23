import axios from "axios";

const baseURL = (typeof window !== "undefined")
  ? "http://localhost:5002/api"
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002").replace(/\/$/, "") + "/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});


