import React, { useState, useRef, useEffect } from "react";
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
  const matrixCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]();<>+-=*/";
    function draw() {
      ctx.fillStyle = "rgba(24,28,36,0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + "px Fira Mono, monospace";
      ctx.fillStyle = "#00ff00";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  // Animated code typing effect
  const codeSnippets = [
    '#include <bits/stdc++.h>',
    'int main() {',
    '    // Welcome to CodersToday!',
    '}',
  ];
  const [typed, setTyped] = useState('');
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  useEffect(() => {
    const current = codeSnippets[snippetIdx];
    if (charIdx < current.length) {
      const timeout = setTimeout(() => {
        setTyped(current.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 60);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCharIdx(0);
        setTyped('');
        setSnippetIdx((snippetIdx + 1) % codeSnippets.length);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [charIdx, snippetIdx]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{
      background: '#181c24',
    }}>
      {/* Matrix Code Rain Canvas (background) */}
      <canvas ref={matrixCanvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ borderRadius: 0 }} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-10 rounded-2xl shadow-2xl border border-transparent bg-[#232b3a]/80 backdrop-blur-md transition-all duration-300 group hover:scale-105 hover:shadow-pink-500/30 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:z-[-1] before:bg-gradient-to-br before:from-purple-500 before:via-pink-400 before:to-blue-500 before:opacity-60 before:blur-md animated-glow-border overflow-hidden"
        style={{ fontFamily: 'Fira Mono, monospace', boxShadow: '0 0 32px 0 #7f5af0, 0 0 64px 0 #ff6ac1' }}
      >
        {/* Animated code typing effect */}
        <div className="mb-6 text-lg font-mono text-green-400 h-6 flex items-center">
          <span>{typed}</span><span className="animate-pulse">|</span>
        </div>
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-full p-2 shadow-xl mb-2 animate-pulse border-4 border-white/10">
            <span className="text-3xl">&lt;/&gt;</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text tracking-tight">CodersToday</h1>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 tracking-wide">Create your account</h2>
        <p className="text-center text-gray-400 mb-6 italic text-sm">"Join. Code. Rise."</p>
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
        <div className="relative mt-4">
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
            className="absolute top-[45px] right-3 cursor-pointer text-lg text-gray-400 hover:text-pink-400 select-none"
            tabIndex={0}
            role="button"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <div className="relative mt-4">
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
            className="absolute top-[45px] right-3 cursor-pointer text-lg text-gray-400 hover:text-pink-400 select-none"
            tabIndex={0}
            role="button"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-lg font-bold text-lg tracking-wide shadow-xl transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 border-0"
        >
          Register
        </button>
        <p className="text-sm text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-extrabold text-base drop-shadow-md transition-colors duration-150">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
