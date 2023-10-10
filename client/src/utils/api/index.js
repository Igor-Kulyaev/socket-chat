import axios from "axios";
export const URL = "http://localhost:5000";

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (localStorage.getItem("token")) {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
      "token"
    )}`;
  }
  return config;
});

const PROHIBITTED_REFRESH_PATHS = ['verify-token', 'refresh'];

api.interceptors.response.use(
  (config) => config,
  async (error) => {
  const originalRequest = error.config;
  console.log('error', error);
  const originalPathBelongsToProhibittedArray = PROHIBITTED_REFRESH_PATHS.includes(error.config.url);
  if (
    error.response.status === 401 && !originalPathBelongsToProhibittedArray &&
    originalRequest &&
    !originalRequest._isRetry
  ) {
      originalRequest._isRetry = true;
      try {
        console.log('refresh interceptor');
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
