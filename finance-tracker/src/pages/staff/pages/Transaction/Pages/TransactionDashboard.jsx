import { useEffect, useState } from "react";
import styles from "./transactionDashboard.module.css";
import StaffMonthlyPie from "../../../Components/StaffMonthlyPie";
import { API_URL } from "../../../../../config";

export default function TransactionDashboard() {
    const [summary, setSummary] = useState(null);
    const [recent, setRecent] = useState([]);
    const [categories, setCategories] = useState([]);
    const token = localStorage.getItem("token");
    const [monthlyData, setMonthlyData] = useState(null);

    // 1. Summary (total income, total expense, net balance)
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

    // 2. Recent transactions
    useEffect(() => {
        async function loadRecent() {
            const res = await fetch(`${API_URL}/analytics/staff/recent-transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            setRecent(json);
        }
        loadRecent();
    }, []);

    // 3. Category breakdown
    useEffect(() => {
        async function loadCategories() {
            const res = await fetch(`${API_URL}/analytics/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            setCategories(json.categoryBreakdown || []);
        }
        loadCategories();
    }, []);

    if (!summary) return <p>Loading transaction dashboard...</p>;

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Transactions Dashboard</h1>

            {/* Summary Cards */}
            <div className={styles.cardGrid}>
                <Card label="Total Income" value={summary.totalIncome} />
                <Card label="Total Expense" value={summary.totalExpense} />
                <Card label="Net Balance" value={summary.netBalance} />
                <Card label="Total Transactions" value={summary.totalTransactions} />
            </div>

            {/* Charts */}
            <div className={styles.chartGrid}>
                <div className={styles.chartBox}>
                    <h3>Monthly Income vs Expense</h3>

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
                                        <p>
                                            Income: <strong>${monthlyData.income.toLocaleString()}</strong>
                                        </p>
                                    </div>

                                    <div className={styles.detailRow}>
                                        <span className={styles.expenseDot}></span>
                                        <p>
                                            Expense: <strong>${monthlyData.expense.toLocaleString()}</strong>
                                        </p>
                                    </div>

                                    <p>
                                        Net Balance:{" "}
                                        <strong
                                            style={{
                                                color:
                                                    monthlyData.income - monthlyData.expense >= 0
                                                        ? "green"
                                                        : "red",
                                            }}
                                        >
                                            ${(monthlyData.income - monthlyData.expense).toLocaleString()}
                                        </strong>
                                    </p>

                                    <p>
                                        Income Ratio:{" "}
                                        <strong>
                                            {(
                                                (monthlyData.income /
                                                    (monthlyData.income + monthlyData.expense)) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </strong>
                                    </p>

                                    <p>
                                        Expense Ratio:{" "}
                                        <strong>
                                            {(
                                                (monthlyData.expense /
                                                    (monthlyData.income + monthlyData.expense)) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </strong>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.chartBox}>
                    <h3>Category Breakdown</h3>
                    {categories.length === 0 && <p>No category data found.</p>}
                    {categories.map((c) => (
                        <div key={c.category} className={styles.row}>
                            <span>{c.category}</span>
                            <span>${c.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className={styles.tableBox}>
                <h3>Recent Transactions</h3>
                {recent.length === 0 && <p>No recent transactions found.</p>}
                {recent.map((t) => (
                    <div key={t.id} className={styles.row}>
                        <span>{t.user?.username}</span>
                        <span>{t.type}</span>
                        <span>${t.amount}</span>
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Card({ label, value }) {
    const safeValue = Number(value) || 0;

    return (
        <div className={styles.card}>
            <h4>{label}</h4>
            <p className={styles.cardValue}>{safeValue.toLocaleString()}</p>
        </div>
    );
}