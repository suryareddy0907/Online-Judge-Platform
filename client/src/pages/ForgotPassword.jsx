// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      setEmail(""); // Clear email field
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E2530] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#2A2F3A] text-white p-8 rounded-xl shadow-md space-y-6">
        {/* Stylish Logo */}
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          &lt;/&gt; CodersToday
        </h1>

        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        
        <p className="text-gray-300 text-center text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-gray-700 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center space-y-2">
          <Link to="/login" className="text-blue-400 hover:underline text-sm">
            Back to Login
          </Link>
          
          <p className="text-gray-400 text-xs">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
