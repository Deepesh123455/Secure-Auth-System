import { create } from "zustand";
import { api } from "../apis/axios";
import { AxiosError } from "axios";

// 1. Define the User Shape (Gold Standard)
// Don't just use 'any' or 'JSON'. Define what a user actually is.
interface User {
  id: string;
  email: string;
  name: string;
  // add other fields your backend returns
}

// 2. Define the Store Interface
// Separate State (data) from Actions (functions)
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;
}

interface AuthActions {
  checkAuth: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<any>;
}

// Combine them
type AuthStore = AuthState & AuthActions;

// 3. Safer LocalStorage Parsing Helper
const getUserFromStorage = (): User | null => {
  try {
    const item = localStorage.getItem("user");
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const savedToken = localStorage.getItem("accessToken");
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

// 4. Create the Store with the Interface
export const useAuthStore = create<AuthStore>((set) => ({
  // Initial State
  user: getUserFromStorage(),
  isAuthenticated: !!savedToken,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  // Actions
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await api.get<{ user: User }>("/auth/profile");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      // Cleanup on fail
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        error: null,
      });
    }
  },

  register: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ user: User; accessToken: string }>(
        "/auth/register",
        {
          email,
          name,
          password,
        },
      );

      const { user, accessToken } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Registration failed"
          : "An unexpected error occurred";

      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ user: User; accessToken: string }>(
        "/auth/login",
        {
          email,
          password,
        },
      );

      const { user, accessToken } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Login failed"
          : "An unexpected error occurred";

      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      // Always clean up local state, even if API fails
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common["Authorization"];

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await api.post("/auth/forgot-password", { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Error sending reset email";
      set({ isLoading: false, error: message });
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
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Error resetting password";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<{ user: User }>("/auth/profile", data);
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
