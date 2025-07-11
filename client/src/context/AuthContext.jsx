import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserProfile } from '../services/authService';

const AuthContext = createContext();

// Banned Modal
function BannedModal() {
  const { logout } = useAuth();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#181c24]/95 pointer-events-auto select-none">
      <div className="bg-[#232b3a] border-4 border-[#ff0055] rounded-2xl shadow-2xl p-10 max-w-md w-full text-center animate-pulse" style={{ boxShadow: '0 0 32px #ff0055, 0 0 64px #00cfff' }}>
        <h2 className="text-3xl font-extrabold text-[#ff0055] mb-4">You are banned</h2>
        <p className="text-lg text-[#baffea] font-mono mb-8">You are not allowed to use this platform.</p>
        <button
          onClick={logout}
          className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff0055] to-[#00cfff] text-white font-extrabold text-lg shadow-lg border-2 border-[#ff0055] hover:from-[#00cfff] hover:to-[#ff0055] transition-all font-mono tracking-widest animate-glow"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function refreshUser() {
      if (token) {
        try {
          // Try to fetch the latest user profile from backend
          const data = await getUserProfile();
          if (data && data.user) {
            setUser({
              ...data.user,
              userId: data.user._id,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          // If fetch fails, fallback to token decode
        }
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.warn("Token expired");
            localStorage.removeItem("token");
          } else {
            setUser(decoded);
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    }
    refreshUser();
  }, []);

  // Accepts token and optionally user fields (e.g., isBanned)
  const login = (token, userFields = {}) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      // Merge backend user fields (like isBanned) into decoded token
      setUser({ ...decoded, ...userFields });
      navigate("/home");
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && (
        <>
          {user && user.isBanned && <BannedModal />}
          {children}
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
