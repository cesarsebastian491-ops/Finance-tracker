import { useEffect, useState } from "react";
import styles from "./staffDashboard.module.css";
import "../../Components/staffTheme.css";
import { API_URL } from "../../../../config";
import StaffMonthlyPie from "../../Components/StaffMonthlyPie";

export default function StaffDashboard() {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [summary, setSummary] = useState(null);
  const token = JSON.parse(localStorage.getItem("user"))?.access_token;

  useEffect(() => {
    async function loadSummary() {
      const res = await fetch(`${API_URL}/analytics/staff/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setSummary(json);
    }
    loadSummary();
  }, []);

  useEffect(() => {
    async function loadRecent() {
      const res = await fetch(`${API_URL}/analytics/staff/recent-transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRecentTransactions(json);

    }
    loadRecent();
  }, []);


  useEffect(() => {
    async function loadLogs() {
      const res = await fetch(`${API_URL}/analytics/staff/recent-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRecentLogs(json);
    }
    loadLogs();
  }, []);

  useEffect(() => {
    async function loadCategoryBreakdown() {
      const res = await fetch(`${API_URL}/analytics/staff/category-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setCategoryBreakdown(json.categoryBreakdown || []);

    }
    loadCategoryBreakdown();
  }, []);
  if (!summary) return <p>Loading staff dashboard...</p>;


  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Staff Dashboard</h1>

      {/* Summary Cards */}
      <div className={styles.cards}>
        <Card label="Total Transactions" value={summary.totalTransactions} />
        <Card label="Income This Month" value={summary.thisMonthIncome} />
        <Card label="Expense This Month" value={summary.thisMonthExpense} />
        <Card label="Active Users" value={summary.activeUsers} />
      </div>

      {/* Analytics Section */}
      <div className={styles.analytics}>
        {/* BOX 1: Pie + Summary */}
        <div className={styles.chartBox}>
          <div className={styles.pieAndSummary}>
            <div className={styles.pieSection}>
              <StaffMonthlyPie onDataLoaded={setMonthlyData} />
            </div>

            <div className={styles.detailsSection}>
              {!monthlyData ? (
                <p>Loading details...</p>
              ) : (
                <>
                  <h3>Monthly Summary</h3>

                  <div className={styles.detailRow}>
                    <span className={styles.incomeDot}></span>
                    <p>Income: <strong>${monthlyData.income.toLocaleString()}</strong></p>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.expenseDot}></span>
                    <p>Expense: <strong>${monthlyData.expense.toLocaleString()}</strong></p>
                  </div>

                  <p>
                    Net Balance:{" "}
                    <strong style={{ color: monthlyData.income - monthlyData.expense >= 0 ? "green" : "red" }}>
                      ${(monthlyData.income - monthlyData.expense).toLocaleString()}
                    </strong>
                  </p>

                  <p>
                    Income Ratio:{" "}
                    <strong>
                      {((monthlyData.income / (monthlyData.income + monthlyData.expense)) * 100).toFixed(1)}%
                    </strong>
                  </p>

                  <p>
                    Expense Ratio:{" "}
                    <strong>
                      {((monthlyData.expense / (monthlyData.income + monthlyData.expense)) * 100).toFixed(1)}%
                    </strong>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BOX 2: Category Breakdown */}
        <div className={styles.chartBox}>
          <h3>Category Breakdown (This Month)</h3>

          {categoryBreakdown.length === 0 && (
            <p>No category data found for this month.</p>
          )}

          {categoryBreakdown.map((c) => {
            console.log("RAW CATEGORY AMOUNT:", c.amount, typeof c.amount);

            return (
              <div key={c.category} className={styles.row}>
                <span>{c.category}</span>
                <span>${Number(c.amount).toLocaleString()}</span>
              </div>
            );
          })}
        </div>



      </div>

      {/* Tables */}
      <div className={styles.tables}>
        <div className={styles.tableBox}>
          <h3>Recent Transactions</h3>

          {recentTransactions.length === 0 && (
            <p>No recent transactions found.</p>
          )}

          {recentTransactions.map((t) => (
            <div key={t.id} className={styles.row}>
              <span>{t.user?.username}</span>
              <span>{t.type}</span>
              <span>${t.amount}</span>
              <span>{new Date(t.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        <div className={styles.tableBox}>
          <h3>Recent Logs</h3>

          {recentLogs.length === 0 && <p>No logs found.</p>}

          {recentLogs.map((log) => (
            <div key={log.id} className={styles.row}>
              <span>{log.user?.username}</span>
              <span>{log.action}</span>
              <span>{new Date(log.date).toLocaleDateString()}</span>
              <span>{log.details || "—"}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function Card({ label, value }) {
  const num = Number(value) || 0;

  return (
    <div className={styles.card}>
      <h4>{label}</h4>
      <p className={styles.number}>{num.toLocaleString()}</p>
    </div>
  );
}