import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    try {
      const res = await registerUser(payload);
      const { token } = res;
      authLogin(token); // Automatically log in after registration
      // No need to navigate manually, authLogin does it
    } catch (err) {
      console.error("Registration failed:", err);
      let message =
        err?.response?.data?.message || "Registration failed. Try again.";
      // Custom error for already existing user
      if (
        message === "An account already exists with this email" ||
        message === "Username is already taken"
      ) {
        message = "User already exists.";
      }
      setError(message);
    }
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
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <FormInput
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
        />

        <FormInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />

        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-[45px] right-3 cursor-pointer text-sm text-gray-300 hover:text-white"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="relative">
          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />
          <span
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute top-[45px] right-3 cursor-pointer text-sm text-gray-300 hover:text-white"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
