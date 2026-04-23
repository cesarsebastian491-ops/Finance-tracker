import { NavLink, Routes, Route } from "react-router-dom";

import SystemDashboard from "./pages/SystemDashboard";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import SystemSecurityPage from "./pages/SystemSecurityPage";
import SystemMaintenancePage from "./pages/SystemMaintenancePage";
import SystemHealthPage from "./pages/SystemHealthPage";
import SystemAccountPage from "./pages/SystemAccountPage";


export default function SystemPage() {
  return (
    <div className="admin-page">
      <h1>System</h1>

      <div className="management-tabs">
        <NavLink to="/admin/system" end>Dashboard</NavLink>
        <NavLink to="/admin/system/settings">Settings</NavLink>
        <NavLink to="/admin/system/security">Security</NavLink>
        <NavLink to="/admin/system/profile">Profile</NavLink>
        <NavLink to="/admin/system/maintenance">Maintenance</NavLink>
        <NavLink to="/admin/system/health">Health</NavLink>
      </div>

      <div className="management-content">
        <Routes>
          <Route index element={<SystemDashboard />} />

          <Route path="settings" element={<SystemSettingsPage />} />
          <Route path="security" element={<SystemSecurityPage />} />
          <Route path="profile" element={<SystemAccountPage />} />
          <Route path="maintenance" element={<SystemMaintenancePage />} />
          <Route path="health" element={<SystemHealthPage />} />
        </Routes>
      </div>
    </div>
  );
}