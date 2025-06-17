import React, { useState } from "react";
import "./../styles.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "user", // Force 'user' role
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ Registration successful!");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Something went wrong."));
    }
  };

  return (
    <div className={`register-container ${darkMode ? "dark" : "light"}`}>
      <div className="theme-toggle">
        <label>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </label>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <h2>Register</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <input type="hidden" name="role" value="user" />

        <button type="submit">Register</button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
