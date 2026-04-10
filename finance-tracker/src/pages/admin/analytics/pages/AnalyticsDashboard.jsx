import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./AnalyticsDashboard.module.css";

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${API_URL}/analytics/summary`);
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) return <p className={styles.loading}>Loading analytics...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Analytics Overview</h2>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h4>Total Users</h4>
          <p>{summary.totalUsers}</p>
        </div>

        <div className={styles.summaryCard}>
          <h4>New Users (7 days)</h4>
          <p>{summary.newUsers}</p>
        </div>

        <div className={styles.summaryCard}>
          <h4>Total Transactions</h4>
          <p>{summary.totalTransactions}</p>
        </div>

        <div className={styles.summaryCard}>
          <h4>Failed Logins</h4>
          <p>{summary.failedLogins}</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className={styles.cardGrid}>
        <NavLink to="/admin/analytics/users" className={styles.card}>
          <h3>Users Analytics</h3>
          <p>Growth, activity, new users</p>
        </NavLink>

        <NavLink to="/admin/analytics/transactions" className={styles.card}>
          <h3>Transactions Analytics</h3>
          <p>Income, expenses, categories</p>
        </NavLink>

        <NavLink to="/admin/analytics/security" className={styles.card}>
          <h3>Security Analytics</h3>
          <p>Logins, failed attempts, sessions</p>
        </NavLink>

        <NavLink to="/admin/analytics/system" className={styles.card}>
          <h3>System Analytics</h3>
          <p>API usage, errors, uptime</p>
        </NavLink>
      </div>
    </div>
  );
}