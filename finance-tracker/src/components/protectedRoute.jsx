import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    user = stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Corrupted user data in localStorage", e);
    localStorage.removeItem("user");
    user = null;
  }

  // Not logged in → go to login page
  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  // Logged in but role not allowed → send to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "staff") return <Navigate to="/staff" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  // Allowed → show the page
  return children;
}