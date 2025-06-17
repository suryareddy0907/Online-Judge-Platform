import React from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <p className="text-lg font-medium">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            &lt;/&gt; CodersToday
          </span>
        </h1>

        <div className="text-right">
          <p className="text-sm sm:text-base font-medium">
            Hi, {user.username}!
          </p>
          <p
            onClick={handleLogout}
            className="text-xs sm:text-sm text-red-500 hover:underline cursor-pointer"
          >
            Logout
          </p>
        </div>
      </nav>
    </div>
  );
};

export default Home;
