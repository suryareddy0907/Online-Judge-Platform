import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium">
        {darkMode ? "Dark Mode" : "Light Mode"}
      </span>
      <div
        onClick={() => setDarkMode(!darkMode)}
        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          darkMode ? "bg-yellow-400" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out flex items-center justify-center text-white ${
            darkMode ? "translate-x-6 bg-blue-800" : "translate-x-0 bg-yellow-500"
          }`}
        >
          {darkMode ? <FaMoon size={12} /> : <FaSun size={12} />}
        </div>
      </div>
    </div>
  );
}

export default ThemeToggle;
