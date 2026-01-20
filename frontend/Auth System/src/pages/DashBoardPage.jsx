import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  User,
  Mail,
  CheckCircle,
  XCircle,
  LogOut,
  Camera,
  Save,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";

// iss wale component mai humne mimic kiya hai real world dashboard yeh ek protected route hai iska mtlb bina logged in kiye user yaha nhi pahuch skta isme update ka bhi feature isme abhi hum image updation ka feature all bhi chize krni hai 

const DashboardPage = () => {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [newName, setNewName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: newName });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
       
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4 gap-4">
              
              <div className="relative group">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                 
                  <span className="text-3xl font-bold text-gray-500">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <button
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  title="Change Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

             
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || "User Name"}
                </h1>
                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  {user?.role || "Member"}
                  <span className="text-gray-300">•</span>
                  Joined Dec 2025
                </p>
              </div>

             
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Personal Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Account Details
              </h3>

              <div className="space-y-4">
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {user?.email}
                    </p>
                  </div>
                </div>

                
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 p-2 rounded-lg ${
                      user?.isEmailVerified
                        ? "bg-green-50 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user?.isEmailVerified ? (
                        <>
                          <CheckCircle size={14} className="text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            Unverified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Profile Settings
                </h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This name will be displayed on your public profile.
                  </p>
                </div>

                
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                
                  <button
                    type="button"
                    onClick={() => setNewName(user?.name)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || newName === user?.name}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <span className="animate-spin">⌛</span>
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

          
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="text-blue-900 font-semibold mb-2">Pro Tip</h4>
              <p className="text-sm text-blue-700">
                Complete your profile setup to unlock all features of the
                dashboard. You are currently on the{" "}
                <span className="font-bold">Free Plan</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
