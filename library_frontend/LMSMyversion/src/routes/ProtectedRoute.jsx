// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Providers/AuthProvider";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Prevent role mismatch access
  if (role && user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
