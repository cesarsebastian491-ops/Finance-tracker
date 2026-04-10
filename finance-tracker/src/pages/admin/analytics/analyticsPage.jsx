import { NavLink, Routes, Route } from "react-router-dom";

import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import UsersAnalytics from "./pages/users";
import TransactionsAnalytics from "./pages/transactions";
import SecurityAnalytics from "./pages/security";
import SystemAnalytics from "./pages/system";

import styles from "./analytics.module.css";

export default function AnalyticsPage() {
  return (
    <div className={styles.adminPage}>
      <h1>Analytics</h1>

      <div className={styles.managementTabs}>
        <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? styles.active : "")}
          end>Dashboard</NavLink>
        <NavLink
          to="/admin/analytics/users"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/analytics/transactions"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Transactions
        </NavLink>

        <NavLink
          to="/admin/analytics/security"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          Security
        </NavLink>

        <NavLink
          to="/admin/analytics/system"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          System
        </NavLink>
      </div>

      <div className={styles.managementContent}>
        <Routes>
          <Route index element={<AnalyticsDashboard />} />

          <Route path="users" element={<UsersAnalytics />} />
          <Route path="transactions" element={<TransactionsAnalytics />} />
          <Route path="security" element={<SecurityAnalytics />} />
          <Route path="system" element={<SystemAnalytics />} />
        </Routes>
      </div>
    </div>
  );
}