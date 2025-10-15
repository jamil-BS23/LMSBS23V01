// src/routes/RoleBasedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../Providers/AuthProvider";

export default function RoleBasedRoute({ 
  children, 
  allowedRoles = [], // Array of allowed roles: ['admin', 'user'] or ['admin'] etc.
  fallbackPath = "/unauthorized" // Where to redirect if role not allowed
}) {
  const { isAuthenticated, user } = useAuth();

  console.log("🛡️ RoleBasedRoute check:", {
    isAuthenticated,
    user,
    userRole: user?.role,
    allowedRoles,
    path: window.location.pathname,
    localStorage_user: localStorage.getItem("lms_user"),
    localStorage_auth: localStorage.getItem("lms_auth")
  });

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("🛡️ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    console.log("🛡️ No roles specified, allowing access");
    return children;
  }

  // If user role is not in allowed roles, redirect to fallback
  if (!allowedRoles.includes(user?.role)) {
    console.log(`🛡️ Role ${user?.role} not in allowed roles ${allowedRoles}, redirecting to ${fallbackPath}`);
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated and has the required role
  console.log(`🛡️ Access granted for role ${user?.role}`);
  return children;
}
