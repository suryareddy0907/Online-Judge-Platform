// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: Send a request to backend to initiate password reset
    console.log("Password reset requested for:", email);

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#1E2530] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#2A2F3A] text-white p-8 rounded-xl shadow-md space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          &lt;/&gt; CodersToday
        </h1>

        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

        {!submitted ? (
          <>
            <label className="block text-sm font-medium mb-1">
              Enter your registered email
            </label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
            >
              Send Reset Link
            </button>
          </>
        ) : (
          <p className="text-center text-green-400 text-md font-medium">
            ✅ If an account exists, a reset link will be sent to your email.
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
