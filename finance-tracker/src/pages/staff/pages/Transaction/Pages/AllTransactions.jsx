import { useEffect, useState, useContext } from "react";
import styles from "./allTransactions.module.css";
import "../../../Components/staffTheme.css";
import { API_URL } from "../../../../../config";
import { CurrencyContext } from "../../../../../context/CurrencyContext";

export default function AllTransactions() {
    const { activeCurrency } = useContext(CurrencyContext);
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [categories, setCategories] = useState([]);

    const token = JSON.parse(localStorage.getItem("user"))?.access_token;

    // Fetch all staff transactions
    useEffect(() => {
        async function loadTransactions() {
            const res = await fetch(`${API_URL}/analytics/staff/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const json = await res.json();

            if (!Array.isArray(json)) {
                console.error("Unexpected response:", json);
                setTransactions([]);
                setFiltered([]);
                return;
            }

            setTransactions(json);
            setFiltered(json);

            const unique = [...new Set(json.map(t => t.category).filter(Boolean))];

            try {
                const categoryRes = await fetch(`${API_URL}/transactions/categories`);
                const categoryJson = await categoryRes.json();
                const sqlCategories = Array.isArray(categoryJson)
                    ? categoryJson.map((c) => c?.name).filter(Boolean)
                    : [];

                setCategories(sqlCategories.length > 0 ? sqlCategories : unique);
            } catch {
                setCategories(unique);
            }
        }

        loadTransactions();
    }, []);

    // Apply filters + search
    useEffect(() => {
        let list = Array.isArray(transactions) ? [...transactions] : [];

        // Type filter
        if (typeFilter !== "all") {
            list = list.filter(t => t.type?.toLowerCase() === typeFilter);
        }

        // Category filter
        if (categoryFilter !== "") {
            list = list.filter(t => t.category === categoryFilter);
        }

        // Search filter
        const term = searchTerm.trim().toLowerCase();
        if (term !== "") {
            list = list.filter((t) => {
                const username = t.user?.username ? t.user.username.toLowerCase() : "";
                const category = t.category ? t.category.toLowerCase() : "";
                const type = t.type ? t.type.toLowerCase() : "";
                const amount = t.amount != null ? String(t.amount) : "";
                const date = t.date ? new Date(t.date).toLocaleDateString().toLowerCase() : "";

                return (
                    username.includes(term) ||
                    category.includes(term) ||
                    type.includes(term) ||
                    amount.includes(term) ||
                    date.includes(term)
                );
            });
        }

        setFiltered(list);
    }, [typeFilter, categoryFilter, searchTerm, transactions]);
    return (
        <div className={styles.page}>

            {/* Sticky Header */}
            <div className={styles.stickyHeader}>
                <h1 className={styles.title}>All Transactions</h1>

                <div className={styles.filters}>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className={styles.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Type Filter Buttons */}
                    <div className={styles.typeButtons}>
                        {["all", "income", "expense"].map(type => (
                            <button
                                key={type}
                                className={`${styles.typeBtn} ${typeFilter === type ? styles.active : ""
                                    }`}
                                onClick={() => setTypeFilter(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Category Dropdown */}
                    <select
                        className={styles.dropdown}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                </div>
            </div>

            {/* Table */}
            <div className={styles.tableBox}>
                <h3>Transactions</h3>

                {/* Column Headers */}
                <div className={styles.headerRow}>
                    <span>ID</span>
                    <span>Username</span>
                    <span>Type</span>
                    <span>Category</span>
                    <span>Amount</span>
                    <span>Date</span>
                </div>

                {/* Rows */}
                {filtered.map((t) => (
                    <div key={t.id} className={styles.row}>
                        <span>{t.user?.id}</span>
                        <span>{t.user?.username}</span>
                        <span className={
                            t.type?.toLowerCase() === "income"
                                ? styles.income
                                : styles.expense
                        }>
                            {t.type}
                        </span>
                        <span>{t.category || "—"}</span>
                        <span>{activeCurrency?.symbol}{t.amount.toLocaleString()}</span>
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                ))}
                {filtered.length === 0 && <p>No transactions found.</p>}
            </div>
        </div>
    );
}