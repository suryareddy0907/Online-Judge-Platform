import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login: authLogin } = useAuth(); // update context method
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Matrix code rain background (move outside the form)
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
      ctx.fillStyle = "rgba(24,28,36,0.18)"; // dark blue-gray with alpha
      ctx.fillRect(0, 0, width, height);
      ctx.font = fontSize + "px Fira Mono, monospace";
      ctx.fillStyle = "#00ff00"; // green
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

  // Animated code typing effect
  const codeSnippets = [
    'for (int i = 0; i < n; ++i) {',
    '    cout << "Welcome, Coder!" << endl;',
    '    // Compete. Code. Conquer.',
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

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(formData);
      const { token, user } = res;

      authLogin(token, user); // set context user and save token, including isBanned
      navigate("/home");         // redirect to protected home

    } catch (err) {
      console.error("Login failed:", err);
      let message =
        err?.response?.data?.message || "Invalid credentials. Try again.";
      // Custom error for non-existent user
      if (message === "Invalid credentials") {
        message = "User does not exist.";
      }
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181c24] font-mono p-4 relative">
      <div className="relative z-10 w-full max-w-md bg-[#232b3a] p-8 rounded-xl border-2 border-[#00cfff] shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-[#00ff99] to-[#00cfff] text-transparent bg-clip-text mb-6 tracking-tight">
          Login to Your Account
        </h2>
        {/* Animated code typing effect */}
        <div className="mb-4 sm:mb-6 text-base sm:text-lg font-mono text-green-400 h-6 flex items-center">
          <span>{typed}</span><span className="animate-pulse">|</span>
        </div>
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-full p-1 sm:p-2 shadow-xl mb-2 animate-pulse border-4 border-white/10">
            <span className="text-2xl sm:text-3xl">&lt;/&gt;</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text tracking-tight">CodersToday</h1>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-center mb-1 sm:mb-2 tracking-wide">Sign in to your account</h2>
        <p className="text-center text-gray-400 mb-4 sm:mb-6 italic text-xs sm:text-sm">"Code. Compete. Conquer."</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Email or Username</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="Enter email or username"
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-sm sm:text-base text-white placeholder-gray-500 shadow-inner"
              autoComplete="username"
            />
          </div>
          <div className="relative mt-3 sm:mt-4">
            <label className="block text-xs font-semibold mb-1 tracking-widest uppercase text-gray-400">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-[#181c24] border border-[#2d3748] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm sm:text-base text-white placeholder-gray-500 shadow-inner"
              autoComplete="current-password"
            />
            <span
              onClick={togglePassword}
              className="absolute top-8 sm:top-9 right-3 cursor-pointer text-gray-400 hover:text-pink-400 text-lg select-none"
              tabIndex={0}
              role="button"
              aria-label="Toggle password visibility"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <div className="text-xs text-right mt-2">
            <Link to="/forgot-password" className="text-purple-400 hover:underline font-extrabold text-sm drop-shadow-md transition-colors duration-150">Forgot Password?</Link>
          </div>
          {error && <p className="text-red-500 text-xs sm:text-sm text-center mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-lg font-bold text-base sm:text-lg tracking-wide shadow-xl transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 border-0"
          >
            Login
          </button>
        </form>
        <p className="text-xs sm:text-sm text-center text-gray-400 mt-4 sm:mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:underline font-extrabold text-sm drop-shadow-md transition-colors duration-150">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
