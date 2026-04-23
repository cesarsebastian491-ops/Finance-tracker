import { useEffect, useState, useContext } from "react";
import styles from "./staffDashboard.module.css";
import "../../Components/staffTheme.css";
import { API_URL } from "../../../../config";
import { CurrencyContext } from "../../../../context/CurrencyContext";
import StaffMonthlyPie from "../../Components/StaffMonthlyPie";

export default function StaffDashboard() {
  const { activeCurrency } = useContext(CurrencyContext);
  const [recentTransactions, setRecentTransactions] = useState([]);
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

        const [summaryRes, transRes] = await Promise.all([
          fetch(`${API_URL}/analytics/staff/summary`, { headers }),
          fetch(`${API_URL}/analytics/staff/recent-transactions`, { headers }),
        ]);

        if (!summaryRes.ok || !transRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [summaryJson, transJson] = await Promise.all([
          summaryRes.json(),
          transRes.json(),
        ]);

        setSummary(summaryJson);
        setRecentTransactions(Array.isArray(transJson) ? transJson : []);
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
        <Card label="Income This Month" value={`${activeCurrency?.symbol}${Number(summary.thisMonthIncome || 0).toLocaleString()}`} />
        <Card label="Expense This Month" value={`${activeCurrency?.symbol}${Number(summary.thisMonthExpense || 0).toLocaleString()}`} />
        <Card label="Active Users" value={summary.activeUsers} />
      </div>

      {/* Financial Totals (All Users) */}
      <div className={styles.cards}>
        <Card label="Total Income" value={<span style={{ color: "green" }}>{activeCurrency?.symbol}{Number(summary.income || 0).toLocaleString()}</span>} />
        <Card label="Total Expenses" value={<span style={{ color: "red" }}>{activeCurrency?.symbol}{Number(summary.expense || 0).toLocaleString()}</span>} />
        <Card label="Net Balance" value={<span style={{ color: (summary.income - summary.expense) >= 0 ? "green" : "red" }}>{activeCurrency?.symbol}{Number((summary.income || 0) - (summary.expense || 0)).toLocaleString()}</span>} />
      </div>

      {/* Analytics + Recent Transactions side by side */}
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
                    <p>Income: <strong>{activeCurrency?.symbol}{isNaN(income) ? 0 : income.toLocaleString()}</strong></p>
                  </div>

                  <div className={styles.detailRow}>
                    <span className={styles.expenseDot}></span>
                    <p>Expense: <strong>{activeCurrency?.symbol}{isNaN(expense) ? 0 : expense.toLocaleString()}</strong></p>
                  </div>

                  <p>
                    Net Balance:{" "}
                    <strong style={{ color: (income - expense) >= 0 ? "green" : "red" }}>
                      {activeCurrency?.symbol}{((isNaN(income) ? 0 : income) - (isNaN(expense) ? 0 : expense)).toLocaleString()}
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

        {/* BOX 2: Recent Transactions */}
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
                    <span>{activeCurrency?.symbol}{isNaN(amount) ? 0 : amount.toLocaleString()}</span>
                    <span>{t.date ? new Date(t.date).toLocaleDateString() : "—"}</span>
                  </div>
                );
              })}
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