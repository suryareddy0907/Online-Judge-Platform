// client/src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // If neither user nor token exists, redirect to login
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
