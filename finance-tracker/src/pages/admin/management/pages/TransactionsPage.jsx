import { useEffect, useState, useContext } from "react";
import styles from "./TransactionsPage.module.css";
import { API_URL } from "../../../../config";
import { CurrencyContext } from "../../../../context/CurrencyContext";
import "../../../../theme.css";
import AddExpenseModal from "../../../../components/AddExpenseModal.jsx";
import AddIncomeModal from "../../../../components/AddIncomeModal.jsx";
import TransactionInfoModal from "../../../../components/TransactionInfoModal.jsx";

export default function TransactionsPage() {
    const { activeCurrency } = useContext(CurrencyContext);
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [infoTransaction, setInfoTransaction] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
    const [typeFilter, setTypeFilter] = useState("all");

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString(undefined, {
            style: "currency",
            currency: activeCurrency?.code || "PHP",
        });
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (err) {
            return dateString;
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch(`${API_URL}/transactions/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAdminUpdate = async (updatedData) => {
        try {
            const res = await fetch(`${API_URL}/transactions/admin/update/${updatedData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error("Failed to update");

            await fetchTransactions();

            // ⭐ Close the correct modal based on transaction type
            if (updatedData.type === "expense") {
                setShowExpenseModal(false);
            } else {
                setShowIncomeModal(false);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const deleteTransaction = async (id) => {
        if (!confirm("Delete this transaction?")) return;

        try {
            const res = await fetch(`${API_URL}/transactions/admin/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete");

            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };
    let filtered = transactions
        .filter((t) => {
            const searchTerm = search.toLowerCase();
            const expense = (t.expense || t.source || "").toLowerCase();
            const category = (t.category || "").toLowerCase();
            const username = (t.user?.username || "").toLowerCase();
            const date = (t.date || "").toLowerCase();
            const amount = (t.amount || "").toString().toLowerCase();
            
            return (
                expense.includes(searchTerm) ||
                category.includes(searchTerm) ||
                username.includes(searchTerm) ||
                date.includes(searchTerm) ||
                amount.includes(searchTerm)
            );
        })
        .filter((t) => {
            if (typeFilter === "all") return true;
            return t.type === typeFilter;
        });

    const handleSort = (key) => {
        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({ key, direction });
    };

    // Apply sorting
    if (sortConfig.key) {
        filtered = [...filtered].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Fix numeric sorting for amount
            if (sortConfig.key === "amount") {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            // Handle date sorting with proper date parsing
            if (sortConfig.key === "date") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }
    return (
        <>
            <div className={styles.page}>
                <h2>Transactions</h2>

                <div className={styles.searchRow}>
                    <input
                        type="text"
                        placeholder="Search by name, category, date, or amount..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <button
                        className={styles.sortBtn}
                        onClick={() =>
                            setSortConfig({
                                key: "date",
                                direction: sortConfig.direction === "desc" ? "asc" : "desc",
                            })
                        }
                    >
                        📅 {sortConfig.direction === "desc" ? "New to Old" : "Old to New"}
                    </button>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("expense")}>
                                    Expense/Income {sortConfig.key === "expense" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                                </th>

                                <th onClick={() => handleSort("category")}>
                                    Category {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                                </th>

                                <th onClick={() => handleSort("amount")}>
                                    Amount {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                                </th>

                                <th onClick={() => handleSort("date")}>
                                    Date {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                                </th>

                                <th onClick={() => handleSort("userId")}>
                                    Username / UserID {sortConfig.key === "userId" && (sortConfig.direction === "asc" ? "▲" : "▼")}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((t) => (
                                <tr
                                    key={t.id}
                                    style={{
                                        backgroundColor: t.type === "income" ? "#e8f5e9" : "#ffebee",
                                        color: t.type === "income" ? "#1b5e20" : "#b71c1c",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => setInfoTransaction(t)}
                                >
                                    <td>{t.type === "expense" ? "Expense" : "Income"}</td>

                                    <td>{t.type === "expense" ? t.expense : t.source}</td>

                                    <td>{activeCurrency.symbol}{Number(t.amount || 0).toFixed(2)}</td>

                                    <td>{formatDate(t.date)}</td>

                                    <td>
                                        {t.user?.username} <span style={{ opacity: 0.6 }}>({t.userId})</span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.editBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelected(t);

                                                if (t.type === "expense") {
                                                    setShowExpenseModal(true);
                                                } else {
                                                    setShowIncomeModal(true);
                                                }
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTransaction(t.id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {infoTransaction && (
                <TransactionInfoModal
                    transaction={infoTransaction}
                    onClose={() => setInfoTransaction(null)}
                    onEdit={(tx) => {
                        setSelected(tx);
                        if (tx.type === "expense") {
                            setShowExpenseModal(true);
                        } else {
                            setShowIncomeModal(true);
                        }
                    }}
                    onDelete={(tx) => deleteTransaction(tx.id)}
                    formatMoney={formatMoney}
                    formatDate={formatDate}
                />
            )}

            {showExpenseModal && (
                <AddExpenseModal
                    open={showExpenseModal}
                    onClose={() => setShowExpenseModal(false)}
                    editData={selected}
                    onSubmit={handleAdminUpdate}
                />
            )}

            {showIncomeModal && (
                <AddIncomeModal
                    open={showIncomeModal}
                    onClose={() => setShowIncomeModal(false)}
                    editData={selected}
                    onSubmit={handleAdminUpdate}
                />
            )}

        </>

    );
}