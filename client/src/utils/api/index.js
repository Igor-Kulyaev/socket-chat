import axios from "axios";
import {decryptToken, encryptToken, USER_IP} from "@/utils/encryption";
export const URL = "http://localhost:5000";

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (localStorage.getItem("token")) {
    // const decryptedToken = decryptToken(localStorage.getItem("token"), USER_IP.IP_ADDRESS);
    config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return config;
});

const PROHIBITED_REFRESH_PATHS = ['verify-token', 'refresh'];

api.interceptors.response.use(
  (config) => config,
  async (error) => {
  const originalRequest = error.config;
  const originalPathBelongsToProhibitedArray = PROHIBITED_REFRESH_PATHS.includes(error.config.url);
  if (
    error.response.status === 401 && !originalPathBelongsToProhibitedArray &&
    originalRequest &&
    !originalRequest._isRetry
  ) {
      originalRequest._isRetry = true;
      try {
        const response = await api.get(`refresh`);
        // const encryptedToken = encryptToken(response.data.token, USER_IP.IP_ADDRESS);
        localStorage.setItem("token", response.data.token);
        return api.request(originalRequest);
      } catch (e) {
        localStorage.removeItem("token");
      }
  }

  return Promise.reject(error);
});

export default api;
