import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, Loader2, Mail, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom"; // Assuming you use react-router-dom

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error, message } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 animate-pulse">
              <LockKeyhole className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Forgot Password?
            </h2>
            {!message && (
              <p className="text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            )}
          </div>

          {!message ? (
            /* Form Section */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 outline-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-gray-300 mb-6">{message}</p>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <p className="text-sm text-gray-400">
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Back Link */}
        <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-700/50 flex justify-center">
          <Link
            to="/login"
            className="flex items-center text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
