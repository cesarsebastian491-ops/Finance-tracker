import { useEffect, useState, useContext } from "react";
import styles from "./transactionDashboard.module.css";
import StaffMonthlyPie from "../../../Components/StaffMonthlyPie";
import { API_URL } from "../../../../../config";
import { CurrencyContext } from "../../../../../context/CurrencyContext";
import "../../../Components/staffTheme.css";

export default function TransactionDashboard() {
    const { activeCurrency } = useContext(CurrencyContext);
    const [summary, setSummary] = useState(null);
    const [recent, setRecent] = useState([]);
    const [categories, setCategories] = useState([]);
    const [monthlyData, setMonthlyData] = useState(null);
    const token = JSON.parse(localStorage.getItem("user"))?.access_token;

    useEffect(() => {
        async function loadAll() {
            const headers = { Authorization: `Bearer ${token}` };

            const [summaryRes, recentRes, catRes] = await Promise.all([
                fetch(`${API_URL}/analytics/staff/summary`, { headers }),
                fetch(`${API_URL}/analytics/staff/recent-transactions`, { headers }),
                fetch(`${API_URL}/analytics/staff/category-breakdown`, { headers }),
            ]);

            const [summaryJson, recentJson, catJson] = await Promise.all([
                summaryRes.json(),
                recentRes.json(),
                catRes.json(),
            ]);

            setSummary(summaryJson);
            setRecent(Array.isArray(recentJson) ? recentJson : []);
            setCategories(Array.isArray(catJson) ? catJson : []);
        }
        loadAll();
    }, []);

    if (!summary) return <p>Loading transaction dashboard...</p>;

    const totalForRatio = (monthlyData?.income || 0) + (monthlyData?.expense || 0);

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Transactions Dashboard</h1>

            {/* Summary Cards — use staff summary fields */}
            <div className={styles.cardGrid}>
                <Card label="Total Transactions" value={summary.totalTransactions} prefix="" />
                <Card label="Income This Month" value={summary.thisMonthIncome} prefix={activeCurrency?.symbol} />
                <Card label="Expense This Month" value={summary.thisMonthExpense} prefix={activeCurrency?.symbol} />
                <Card label="Active Users" value={summary.activeUsers} prefix="" />
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
                                        <p>Income: <strong>{activeCurrency?.symbol}{monthlyData.income.toLocaleString()}</strong></p>
                                    </div>

                                    <div className={styles.detailRow}>
                                        <span className={styles.expenseDot}></span>
                                        <p>Expense: <strong>{activeCurrency?.symbol}{monthlyData.expense.toLocaleString()}</strong></p>
                                    </div>

                                    <p>
                                        Net Balance:{" "}
                                        <strong style={{ color: monthlyData.income - monthlyData.expense >= 0 ? "green" : "red" }}>
                                            {activeCurrency?.symbol}{(monthlyData.income - monthlyData.expense).toLocaleString()}
                                        </strong>
                                    </p>

                                    {totalForRatio > 0 && (
                                        <>
                                            <p>Income Ratio: <strong>{((monthlyData.income / totalForRatio) * 100).toFixed(1)}%</strong></p>
                                            <p>Expense Ratio: <strong>{((monthlyData.expense / totalForRatio) * 100).toFixed(1)}%</strong></p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.chartBox}>
                    <h3>Category Breakdown (This Month)</h3>
                    {categories.length === 0 ? (
                        <p>No category data found.</p>
                    ) : (
                        categories.map((c) => (
                            <div key={c.category} className={styles.catRow}>
                                <span>{c.category}</span>
                                <span>{activeCurrency?.symbol}{Number(c.amount).toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className={styles.tableBox}>
                <h3>Recent Transactions</h3>
                <div className={styles.tableHeader}>
                    <span>User</span>
                    <span>Type</span>
                    <span>Category</span>
                    <span>Amount</span>
                    <span>Date</span>
                </div>
                {recent.length === 0 ? (
                    <p>No recent transactions found.</p>
                ) : (
                    recent.map((t) => (
                        <div key={t.id} className={styles.row}>
                            <span>{t.user?.username || "—"}</span>
                            <span className={t.type === "income" ? styles.income : styles.expense}>{t.type}</span>
                            <span>{t.category || "—"}</span>
                            <span>{activeCurrency?.symbol}{Number(t.amount).toLocaleString()}</span>
                            <span>{t.date ? new Date(t.date).toLocaleDateString() : "—"}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Card({ label, value, prefix = "" }) {
    const num = Number(value) || 0;
    return (
        <div className={styles.card}>
            <h4>{label}</h4>
            <p className={styles.cardValue}>{prefix}{num.toLocaleString()}</p>
        </div>
    );
}