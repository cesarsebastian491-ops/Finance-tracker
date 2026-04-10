import { NavLink } from "react-router-dom";
import styles from "./SystemDashboard.module.css";

export default function SystemDashboard() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Dashboard</h2>

      <div className={styles.cards}>
        <NavLink to="/admin/system/settings" className={styles.card}>
          <h3>System Settings</h3>
          <p>Manage app name, currency, timezone, and global configuration.</p>
        </NavLink>

        <NavLink to="/admin/system/security" className={styles.card}>
          <h3>Security</h3>
          <p>Control password rules, sessions, and access restrictions.</p>
        </NavLink>

        <NavLink to="/admin/system/maintenance" className={styles.card}>
          <h3>Maintenance</h3>
          <p>Clear logs, reset data, and perform system maintenance.</p>
        </NavLink>

        <NavLink to="/admin/system/health" className={styles.card}>
          <h3>System Health</h3>
          <p>View server status, uptime, and diagnostics.</p>
        </NavLink>

        {/* <NavLink to="/admin/system/account" className={styles.card}>
          <h3>Admin Account</h3>
          <p>Update your admin profile and credentials.</p>
        </NavLink> */}
      </div>
    </div>
  );
}