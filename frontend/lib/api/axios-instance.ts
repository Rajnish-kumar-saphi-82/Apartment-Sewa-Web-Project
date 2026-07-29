import axios from "axios";
const BASE_URL = "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.config) {
      console.error("API request failed", {
        method: error.config.method,
        url: error.config.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
