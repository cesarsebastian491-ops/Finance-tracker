import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin</h2>

        <NavLink to="/admin/dashboard" className="admin-link">Dashboard</NavLink>
        <NavLink to="/admin/management" className="admin-link">Management</NavLink>
        <NavLink to="/admin/system" className="admin-link">System</NavLink>
        <NavLink to="/admin/analytics" className="admin-link">Analytics</NavLink>

        <button
          className="admin-logout"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}