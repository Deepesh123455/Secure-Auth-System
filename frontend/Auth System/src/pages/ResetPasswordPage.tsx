import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "react-toastify";

// yeh wala bahut important part isme jb bhi user reset password pe click krega hum reset password ko backend se call krenge aur user ko ek token denge jo ki uske email pe jayega aur usko hum yaha pe verify aur agar wo token correct hai then hum usko navigate krdenge login pe

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  const [error, setError] = useState("");

  const { resetPassword, isLoading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  
  const token = searchParams.get("token");

  
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = () => {
    if (!password) {
      setError("New password is required");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError(
        "Password must have 8+ chars, 1 uppercase, 1 number & 1 symbol."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError(""); 
    return true;
  };

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (!validateForm()) return;

    try {
      await resetPassword(token, password);

      
      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. Link may be expired.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
 
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
        
          <div className="mb-8 flex items-center gap-2 text-blue-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              MyBrand
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className={`block w-full rounded-lg border p-2.5 pl-10 pr-10 text-gray-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 sm:text-sm ${
                    error
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

           
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <KeyRound size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className={`block w-full rounded-lg border p-2.5 pl-10 pr-10 text-gray-900 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 sm:text-sm ${
                    error && password !== confirmPassword
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

            
              {error && (
                <p className="mt-2 flex items-start text-sm text-red-600 animate-pulse">
                  <AlertCircle size={16} className="mr-1 mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

           
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  Set New Password
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

           
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 hover:underline"
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Back to log in
              </Link>
            </div>
          </form>
        </div>
      </div>

    
      <div className="hidden h-screen w-1/2 bg-gray-50 lg:block relative">
        <img
          src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670&auto=format&fit=crop"
          alt="Security Lock"
          className="h-full w-full object-cover"
        />
       
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-3/4 text-center text-white">
            <h2 className="mb-4 text-4xl font-bold">
              "Security is not a product, but a process."
            </h2>
            <p className="text-lg text-gray-200">
              Your account security is our top priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
