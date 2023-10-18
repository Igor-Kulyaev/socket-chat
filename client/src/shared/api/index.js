import axios from "axios";
export const URL = "http://localhost:5000";
const PROHIBITED_REFRESH_PATHS = ['verify-token', 'refresh'];

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (localStorage.getItem("token")) {
    config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }
  return config;
});

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
        localStorage.setItem("token", response.data.token);
        return api.request(originalRequest);
      } catch (e) {
        localStorage.removeItem("token");
      }
  }

  return Promise.reject(error);
});

export default api;
