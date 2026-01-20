import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../apis/axios"; 

// email verification jisme hum email ko verify krnege ki user ko jo token mila hai vo valid hai ya nahi isko hum aur refine krenge aage chlke isme 4 secenerio hai wo maine notes me likhe hai i will refer from there

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  
  const [status, setStatus] = useState(token ? "verifying" : "pending");

  
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || verificationAttempted.current) return;

      verificationAttempted.current = true; 
      setStatus("verifying");

      try {
       
        await api.post(`/auth/verify-email?token=${token}`);

        setStatus("success");
        toast.success("Email verified successfully!");

        
        setTimeout(() => {
          navigate("/login"); 
        }, 3000);
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
        toast.error(error.response?.data?.message || "Verification failed");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  

  const renderContent = () => {
   
    if (status === "success") {
      return (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Email Verified!
          </h2>
          <p className="mb-8 text-gray-600">
            Your email has been successfully verified. You will be redirected
            shortly.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            Continue to Login
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      );
    }

    
    if (status === "error") {
      return (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Verification Failed
          </h2>
          <p className="mb-8 text-gray-600">
            The verification link is invalid or has expired.
          </p>
          <Link
            to="/login" 
            className="inline-flex items-center justify-center rounded-lg bg-gray-800 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-gray-900"
          >
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to Login
          </Link>
        </div>
      );
    }

    
    if (status === "verifying") {
      return (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Verifying your email...
          </h2>
          <p className="text-gray-600">
            Please wait while we secure your account.
          </p>
        </div>
      );
    }

    
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Check your email
        </h2>
        <p className="mb-6 text-gray-600">
          We've sent a verification link to your email address. Please click the
          link to activate your account.
        </p>
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{" "}
            <button className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
              Click to resend
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
