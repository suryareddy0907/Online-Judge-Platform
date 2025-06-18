import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, formData.newPassword);
      setMessage(response.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#1E2530] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#2A2F3A] text-white p-8 rounded-xl shadow-md space-y-6">
          <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            &lt;/&gt; CodersToday
          </h1>
          <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
          <Link to="/forgot-password" className="text-blue-400 hover:underline text-center block">
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2530] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#2A2F3A] text-white p-8 rounded-xl shadow-md space-y-6">
        {/* Stylish Logo */}
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          &lt;/&gt; CodersToday
        </h1>

        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        
        <p className="text-gray-300 text-center text-sm">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter new password"
              className="w-full px-4 py-2 bg-gray-700 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-9 right-3 cursor-pointer text-gray-300 hover:text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm new password"
              className="w-full px-4 py-2 bg-gray-700 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-9 right-3 cursor-pointer text-gray-300 hover:text-white"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {message && (
            <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-blue-400 hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 