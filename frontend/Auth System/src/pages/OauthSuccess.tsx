import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Zustand store se functions nikaalo
  const { googleOauthLogin, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Sabse pehle token set karo (Ye tera likha hua function hai)
      googleOauthLogin(token);

      // 2. Token set hone ke baad profile fetch karo, phir dashboard bhejo
      checkAuth().then(() => {
        navigate("/dashboard", { replace: true });
      });
    } else {
      // Agar kisi wajah se token nahi aaya, toh login pe wapas bhejo
      navigate("/login");
    }
  }, [searchParams, googleOauthLogin, checkAuth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-medium text-gray-700">
          Verifying your Google Login...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
