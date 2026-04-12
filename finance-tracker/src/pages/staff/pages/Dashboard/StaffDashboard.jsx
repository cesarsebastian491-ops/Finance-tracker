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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = JSON.parse(localStorage.getItem("user"))?.access_token;

  useEffect(() => {
    if (!token) {
      setError("No authentication token found");
      setIsLoading(false);
      return;
    }

    async function loadAll() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, transRes, logsRes, catRes] = await Promise.all([
          fetch(`${API_URL}/analytics/staff/summary`, { headers }),
          fetch(`${API_URL}/analytics/staff/recent-transactions`, { headers }),
          fetch(`${API_URL}/analytics/staff/recent-logs`, { headers }),
          fetch(`${API_URL}/analytics/staff/category-breakdown`, { headers }),
        ]);

        if (!summaryRes.ok || !transRes.ok || !logsRes.ok || !catRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [summaryJson, transJson, logsJson, catJson] = await Promise.all([
          summaryRes.json(),
          transRes.json(),
          logsRes.json(),
          catRes.json(),
        ]);

        setSummary(summaryJson);
        setRecentTransactions(Array.isArray(transJson) ? transJson : []);
        setRecentLogs(Array.isArray(logsJson) ? logsJson : []);
        // endpoint returns array directly (not wrapped in { categoryBreakdown: [] })
        setCategoryBreakdown(Array.isArray(catJson) ? catJson : []);
        setError(null);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, [token]);

  if (error) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Staff Dashboard</h1>
        <div style={{ color: "red", padding: "20px", backgroundColor: "#ffe6e6", borderRadius: "8px" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.title}>Staff Dashboard</h1>
        <p>Loading staff dashboard...</p>
      </div>
    );
  }

  const income = monthlyData?.income ?? 0;
  const expense = monthlyData?.expense ?? 0;
  const totalForRatio = (isNaN(income) ? 0 : income) + (isNaN(expense) ? 0 : expense);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Staff Dashboard</h1>

      {/* Summary Cards */}
      <div className={styles.cards}>
        <Card label="Total Transactions" value={summary.totalTransactions} />
        <Card label="Income This Month" value={`$${Number(summary.thisMonthIncome || 0).toLocaleString()}`} />
        <Card label="Expense This Month" value={`$${Number(summary.thisMonthExpense || 0).toLocaleString()}`} />
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
                    <p>Income: <strong>${isNaN(income) ? 0 : income.toLocaleString()}</strong></p>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.expenseDot}></span>
                    <p>Expense: <strong>${isNaN(expense) ? 0 : expense.toLocaleString()}</strong></p>
                  </div>

                  <p>
                    Net Balance:{" "}
                    <strong style={{ color: (income - expense) >= 0 ? "green" : "red" }}>
                      ${((isNaN(income) ? 0 : income) - (isNaN(expense) ? 0 : expense)).toLocaleString()}
                    </strong>
                  </p>

                  {totalForRatio > 0 && (
                    <>
                      <p>Income Ratio: <strong>{((income / totalForRatio) * 100).toFixed(1)}%</strong></p>
                      <p>Expense Ratio: <strong>{((expense / totalForRatio) * 100).toFixed(1)}%</strong></p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* BOX 2: Category Breakdown */}
        <div className={styles.chartBox}>
          <h3>Category Breakdown (This Month)</h3>

          {categoryBreakdown.length === 0 ? (
            <p>No category data found for this month.</p>
          ) : (
            categoryBreakdown.map((c) => {
              const amount = Number(c.amount) || 0;
              return (
                <div key={c.category} className={styles.catRow}>
                  <span>{c.category}</span>
                  <span>${isNaN(amount) ? 0 : amount.toLocaleString()}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tables */}
      <div className={styles.tables}>
        <div className={styles.tableBox}>
          <h3>Recent Transactions</h3>

          {recentTransactions.length === 0 ? (
            <p>No recent transactions found.</p>
          ) : (
            <>
              <div className={styles.tableHeader}>
                <span>User</span>
                <span>Type</span>
                <span>Amount</span>
                <span>Date</span>
              </div>
              {recentTransactions.map((t) => {
                const amount = Number(t.amount) || 0;
                return (
                  <div key={t.id} className={styles.row}>
                    <span>{t.user?.username || "—"}</span>
                    <span className={t.type === "income" ? styles.incomeType : styles.expenseType}>
                      {t.type}
                    </span>
                    <span>${isNaN(amount) ? 0 : amount.toLocaleString()}</span>
                    <span>{t.date ? new Date(t.date).toLocaleDateString() : "—"}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className={styles.tableBox}>
          <h3>Recent Logs</h3>

          {recentLogs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <>
              <div className={styles.tableHeader}>
                <span>User</span>
                <span>Action</span>
                <span>Message</span>
                <span>Time</span>
              </div>
              {recentLogs.map((log) => (
                <div key={log.id} className={styles.row}>
                  <span>{log.user?.username || `#${log.userId ?? "—"}`}</span>
                  <span>{log.action}</span>
                  <span className={styles.logMsg}>{log.message}</span>
                  {/* logs use `timestamp`, not `date` */}
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "—"}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className={styles.card}>
      <h4>{label}</h4>
      <p className={styles.number}>{value ?? 0}</p>
    </div>
  );
}