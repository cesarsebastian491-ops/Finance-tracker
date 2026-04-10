// src/pages/admin/analytics/transactions.jsx
import { useEffect, useState } from "react";
import styles from "./transactionsAnalytics.module.css";
import { API_URL } from "../../../../config";

export default function AdminTransactionsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalTransactions, setModalTransactions] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_URL}/analytics/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load transactions analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [token]);

  function openModal(title, list) {
    setModalTitle(title);
    setModalTransactions(list || []);
    setShowModal(true);
  }

  if (loading || !data) {
    return <p className={styles.loading}>Loading transactions analytics...</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Transactions Analytics</h2>

      {/* Summary Cards */}
      <div className={styles.grid}>
        <Card
          label="Net Balance"
          value={formatCurrency(data.netBalance)}
          onClick={() =>
            openModal("All Transactions (Income & Expense)", data.allTransactionsList)
          }
        />
        <Card
          label="Total Transactions"
          value={data.totalTransactions}
          onClick={() =>
            openModal("All Transactions", data.allTransactionsList)
          }
        />
        <Card
          label="This Month Income"
          value={formatCurrency(data.thisMonthIncome)}
          onClick={() =>
            openModal(
              "This Month Income Transactions",
              data.thisMonthIncomeList
            )
          }
        />
        <Card
          label="This Month Expense"
          value={formatCurrency(data.thisMonthExpense)}
          onClick={() =>
            openModal(
              "This Month Expense Transactions",
              data.thisMonthExpenseList
            )
          }
        />
      </div>

      {/* Simple Analytics Blocks (no external chart lib, just structured info) */}
      <div className={styles.analyticsSection}>
        <div className={styles.block}>
          <h3 className={styles.subtitle}>Income vs Expense by Month</h3>
          <div className={styles.list}>
            {data.incomeVsExpense?.map((m) => (
              <div key={m.month} className={styles.row}>
                <span className={styles.month}>{m.month}</span>
                <span className={styles.income}>
                  Income: {formatCurrency(m.income)}
                </span>
                <span className={styles.expense}>
                  Expense: {formatCurrency(m.expense)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <h3 className={styles.subtitle}>Category Breakdown</h3>
          <div className={styles.list}>
            {data.categoryBreakdown?.map((c) => (
              <div key={c.category} className={styles.row}>
                <span>{c.category}</span>
                <span>{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className={styles.tableBlock}>
        <h3 className={styles.subtitle}>Recent Transactions</h3>
        <div className={styles.table}>
          <div className={`${styles.tableRow} ${styles.tableHeader}`}>
            <span>Date</span>
            <span>Type</span>
            <span>Category</span>
            <span>Amount</span>
            <span>User</span>
            <span>Notes</span>
          </div>
          {data.recentTransactions?.map((t) => (
            <div key={t.id} className={styles.tableRow}>
              <span>{formatDate(t.date)}</span>
              <span className={t.type === "income" ? styles.income : styles.expense}>
                {t.type}
              </span>
              <span>{t.category}</span>
              <span>{formatCurrency(t.amount)}</span>
              <span>
                {t.user
                  ? `${t.user.firstName} ${t.user.lastName}`
                  : "—"}
              </span>
              <span>{t.notes || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>{modalTitle}</h2>

            <div className={styles.modalList}>
              {modalTransactions.length === 0 && (
                <p>No transactions found.</p>
              )}

              {modalTransactions.map((t) => (
                <div key={t.id} className={styles.modalRow}>
                  <span>{formatDate(t.date)}</span>
                  <span>{t.category}</span>
                  <span className={t.type === "income" ? styles.income : styles.expense}>
                    {t.type}
                  </span>
                  <span>{formatCurrency(t.amount)}</span>
                  <span>
                    {t.user
                      ? `${t.user.firstName} ${t.user.lastName}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>

            <p className={styles.note}>
              For full control, visit the Transactions Management Page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  );
}

function formatCurrency(amount) {
  if (amount == null) return "₱0";
  return `₱${Number(amount).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}