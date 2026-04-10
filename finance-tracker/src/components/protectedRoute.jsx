import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but role not allowed → send to user dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Allowed → show the page
  return children;
}