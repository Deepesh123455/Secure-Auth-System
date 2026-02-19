import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashBoardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OAuthCallback from "./pages/OauthSuccess"; // Naya Component Import kiya

// Protect Routes Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Redirect Authenticated Users
interface Props {
  children: React.ReactNode;
}
const RedirectAuthenticatedUser = ({ children }: Props) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <div>Loading...</div>;
  if (isAuthenticated && user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Agar hum oauth success wale page par hain, toh global checkAuth mat chalao.
    // OAuthCallback component khud token set karne ke baad checkAuth call karega.
    if (!window.location.pathname.includes("/oauth/success")) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectAuthenticatedUser>
            <RegisterPage />
          </RedirectAuthenticatedUser>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RedirectAuthenticatedUser>
            <ForgotPasswordPage />
          </RedirectAuthenticatedUser>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RedirectAuthenticatedUser>
            <ResetPasswordPage />
          </RedirectAuthenticatedUser>
        }
      />

      {/* NAYA ROUTE YAHAN HAI */}
      {/* Note: Isko kisi wrapper mein nahi daala kyunki ye sirf processing route hai */}
      <Route 
        path="/oauth/success" 
        element={<OAuthCallback />} 
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;