// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import MatrixRainBackground from '../components/MatrixRainBackground';

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#181c24' }}>
      <MatrixRainBackground />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-10 rounded-2xl shadow-2xl border border-transparent bg-[#232b3a]/80 backdrop-blur-md transition-all duration-300 group hover:scale-105 hover:shadow-pink-500/30 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:z-[-1] before:bg-gradient-to-br before:from-purple-500 before:via-pink-400 before:to-blue-500 before:opacity-60 before:blur-md animated-glow-border overflow-hidden"
        style={{ fontFamily: 'Fira Mono, monospace', boxShadow: '0 0 32px 0 #7f5af0, 0 0 64px 0 #ff6ac1' }}
      >
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          &lt;/&gt; CodersToday
        </h1>
        <h2 className="text-2xl font-bold text-center mb-2 tracking-wide">Forgot Password</h2>
        <p className="text-center text-gray-400 mb-6 italic text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        <div>
          <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-base text-white placeholder-gray-500 shadow-inner"
          />
        </div>
        {message && (
          <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-3 rounded-md text-sm mt-2">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm mt-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-lg font-bold text-lg tracking-wide shadow-xl transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 border-0"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        <div className="text-center space-y-2 mt-6">
          <Link to="/login" className="text-purple-400 hover:underline font-extrabold text-base drop-shadow-md transition-colors duration-150">
            Back to Login
          </Link>
          <p className="text-gray-400 text-xs">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:underline font-extrabold text-base drop-shadow-md transition-colors duration-150">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
