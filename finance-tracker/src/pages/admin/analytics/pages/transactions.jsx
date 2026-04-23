// src/pages/admin/analytics/transactions.jsx
import { useEffect, useState, useContext } from "react";
import styles from "./transactionsAnalytics.module.css";
import { API_URL } from "../../../../config";
import { CurrencyContext } from "../../../../context/CurrencyContext";

export default function AdminTransactionsAnalyticsPage() {
  const { activeCurrency } = useContext(CurrencyContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalTransactions, setModalTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const stored = JSON.parse(localStorage.getItem("user"));
  const token = stored?.access_token;

  useEffect(() => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_URL}/analytics/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error("Failed to load transactions analytics:", err);
        setError(`Failed to load analytics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [token]);

  useEffect(() => {
    const filtered = modalTransactions.filter(t => {
      const searchLower = searchTerm.toLowerCase();
      return `${t.category} ${t.notes || ""} ${t.user?.firstName || ""} ${t.user?.lastName || ""}`.toLowerCase().includes(searchLower);
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, modalTransactions]);

  function openModal(title, list) {
    setModalTitle(title);
    setModalTransactions(list || []);
    setSearchTerm("");
    setShowModal(true);
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading transactions analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <p>⚠️ No data available</p>
        </div>
      </div>
    );
  }

  const fc = (amount) => formatCurrency(amount, activeCurrency?.symbol);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Transactions Analytics</h2>

      {/* Summary Cards */}
      <div className={styles.grid}>
        <Card
          label="Net Balance"
          value={fc(data.netBalance)}
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
          value={fc(data.thisMonthIncome)}
          onClick={() =>
            openModal(
              "This Month Income Transactions",
              data.thisMonthIncomeList
            )
          }
        />
        <Card
          label="This Month Expense"
          value={fc(data.thisMonthExpense)}
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
                  Income: {fc(m.income)}
                </span>
                <span className={styles.expense}>
                  Expense: {fc(m.expense)}
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
                <span>{fc(c.amount)}</span>
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
              <span>{fc(t.amount)}</span>
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
          onClick={() => {
            setShowModal(false);
            setSearchTerm("");
          }}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{modalTitle}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowModal(false);
                  setSearchTerm("");
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by category, user, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.modalList}>
              {filteredTransactions.length === 0 && (
                <p className={styles.emptyState}>No transactions found.</p>
              )}

              {filteredTransactions.map((t) => (
                <div key={t.id} className={styles.modalRow}>
                  <div className={styles.rowContent}>
                    <div className={styles.mainInfo}>
                      <span className={styles.date}>{formatDate(t.date)}</span>
                      <span className={styles.category}>{t.category}</span>
                    </div>
                    <div className={styles.secondaryInfo}>
                      <span className={t.type === "income" ? styles.income : styles.expense}>
                        {t.type.toUpperCase()}
                      </span>
                      <span className={styles.user}>
                        {t.user ? `${t.user.firstName} ${t.user.lastName}` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.amount} ${t.type === "income" ? styles.income : styles.expense}`}>
                    {fc(t.amount)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <p className={styles.note}>
                Showing {filteredTransactions.length} of {modalTransactions.length} transactions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, onClick }) {
  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ""}`} onClick={onClick}>
      <h4>{label}</h4>
      <p className={styles.cardValue}>{value}</p>
    </div>
  );
}

function formatCurrency(amount, symbol = "₱") {
  if (amount == null) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}