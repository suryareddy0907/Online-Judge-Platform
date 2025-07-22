import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProblems from "./pages/AdminProblems";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminContests from "./pages/AdminContests";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import BrowseProblems from "./pages/BrowseProblems";
import ProblemDetails from "./pages/ProblemDetails";
import MySubmissions from "./pages/MySubmissions";
import Contests from "./pages/Contests";
import ContestDetails from "./pages/ContestDetails";
import UserProfile from "./components/UserProfile";
import Compiler from "./pages/Compiler";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/problems"
        element={
          <AdminRoute>
            <AdminProblems />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/submissions"
        element={
          <AdminRoute>
            <AdminSubmissions />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/contests"
        element={
          <AdminRoute>
            <AdminContests />
          </AdminRoute>
        }
      />

      <Route path="/problems" element={<BrowseProblems />} />
      <Route path="/problems/:id" element={<ProblemDetails />} />
      <Route path="/contests" element={<Contests />} />
      <Route
        path="/contests/:id"
        element={
          <ContestDetails />
        }
      />

      <Route
        path="/my-submissions"
        element={
          <PrivateRoute>
            <MySubmissions />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        }
      />

      <Route path="/compiler" element={<Compiler />} />

      {/* Redirect all unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
