import axios from "axios";

const BASE_URL = "/api";


export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // isse hum cookies ko send aur receive kr skte hai important
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-tokens`,
          {},
          { withCredentials: true }
        );

        
        const { accessToken: newAccessToken } = response.data; 

        
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        
        return api(originalRequest);
      } catch (refreshError) {
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
