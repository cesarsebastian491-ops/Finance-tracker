import { NavLink, Routes, Route } from "react-router-dom";

import SystemDashboard from "./pages/SystemDashboard";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import SystemSecurityPage from "./pages/SystemSecurityPage";
import SystemMaintenancePage from "./pages/SystemMaintenancePage";
import SystemHealthPage from "./pages/SystemHealthPage";


export default function SystemPage() {
  return (
    <div className="admin-page">
      <h1>System</h1>

      <div className="management-tabs">
        <NavLink to="/admin/system" end>Dashboard</NavLink>
        <NavLink to="/admin/system/settings">Settings</NavLink>
        <NavLink to="/admin/system/security">Security</NavLink>
        <NavLink to="/admin/system/maintenance">Maintenance</NavLink>
        <NavLink to="/admin/system/health">Health</NavLink>
        {/* <NavLink to="/admin/system/account">Account</NavLink> */}
      </div>

      <div className="management-content">
        <Routes>
          <Route index element={<SystemDashboard />} />

          <Route path="settings" element={<SystemSettingsPage />} />
          <Route path="security" element={<SystemSecurityPage />} />
          <Route path="maintenance" element={<SystemMaintenancePage />} />
          <Route path="health" element={<SystemHealthPage />} />
          {/* <Route path="account" element={<SystemAccountPage />} /> */}
        </Routes>
      </div>
    </div>
  );
}