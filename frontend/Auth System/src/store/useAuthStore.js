import { create } from "zustand";
import { api } from "../apis/axios";



const savedUser = JSON.parse(localStorage.getItem("user")) || null;
const savedToken = localStorage.getItem("accessToken");


if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

export const useAuthStore = create((set,err) => ({
  user: savedUser,
  isAuthenticated: !!savedToken, 
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      
      const response = await api.get("/auth/profile");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
     
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      set({ user: null, isAuthenticated: false, isCheckingAuth: false,error:err });
    }
  },

 
  register: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        email,
        name,
        password,
      });

      const { user, accessToken } = response.data;

      
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      set({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

 
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });

      const { user, accessToken } = response.data;

      
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      set({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });

      return user; 
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },


  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/logout");

      
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Logout failed",
      });
    }
  },

 
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await api.post("/auth/forgot-password", { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error sending reset email",
      });
      throw error;
    }
  },

  
  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await api.post(`/auth/reset-password?token=${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error resetting password",
      });
      throw error;
    }
  },

  
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch("/auth/profile", data);

      
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      set({ user: updatedUser, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: "Error updating profile" });
      throw error;
    }
  },
}));
