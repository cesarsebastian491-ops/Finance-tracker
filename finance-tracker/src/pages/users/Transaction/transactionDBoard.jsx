import { useEffect, useState, useRef } from "react";
import UniversalFilterModal from "../../../components/universalfilter/universalFilterModal";
import styles from "./transaction.module.css";
import { API_URL } from "../../../config";


function toLocalDateKey(value) {
    if (!value) return "";

    if (typeof value === "string") {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}



export default function RunningBalancePage() {

    // ============================
    // STATE
    // ============================
    const [sortOrder, setSortOrder] = useState("desc");
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const tableRef = useRef();

    // ⭐ FILTER STATE
    const [activeFilter, setActiveFilter] = useState({
        time: "monthly",
        type: "all",
        customStart: null,
        customEnd: null
    });

    // ============================
    // FILTER HANDLER
    // ============================
    function handleFilter({ time, type, customStart, customEnd }) {
        setActiveFilter({ time, type, customStart, customEnd });
    }

    // ============================
    // FILTER LOGIC
    // ============================
    const filteredRunningList = transactions.filter(tx => {
        const d = new Date(tx.date);
        const now = new Date();

        // TIME FILTER
        if (activeFilter.time === "7days") {
            const cutoff = new Date(now);
            cutoff.setDate(cutoff.getDate() - 7);
            if (d < cutoff) return false;
        }

        if (activeFilter.time === "1month") {
            const cutoff = new Date(now);
            cutoff.setMonth(cutoff.getMonth() - 1);
            if (d < cutoff) return false;
        }

        if (activeFilter.time === "1year") {
            const cutoff = new Date(now);
            cutoff.setFullYear(cutoff.getFullYear() - 1);
            if (d < cutoff) return false;
        }

        if (activeFilter.time === "custom") {
            if (!activeFilter.customStart || !activeFilter.customEnd) return false;

            const start = new Date(activeFilter.customStart);
            start.setHours(0, 0, 0, 0);

            const end = new Date(activeFilter.customEnd);
            end.setHours(23, 59, 59, 999);

            if (d < start || d > end) {
                return false;
            }
        }

        if (activeFilter.time === "specific") {
            if (!activeFilter.customStart) return false;

            if (toLocalDateKey(d) !== toLocalDateKey(activeFilter.customStart)) {
                return false;
            }
        }

        // TYPE FILTER
        if (activeFilter.type === "income" && tx.type !== "income") return false;
        if (activeFilter.type === "expense" && tx.type !== "expense") return false;

        return true;
    });

    const sortedAsc = [...filteredRunningList].sort((a, b) => {
        return new Date(a.date) - new Date(b.date); // oldest → newest
    });


    // ============================
    // RUNNING BALANCE CALCULATION
    // ============================
    function calculateRunningBalance(list) {
        let balance = 0;

        return list.map(tx => {
            if (tx.type === "income") {
                balance += Number(tx.amount);
            } else {
                balance -= Number(tx.amount);
            }
            return { ...tx, runningBalance: balance };
        });
    }

    const runningAsc = calculateRunningBalance(sortedAsc);

    const runningList =
        sortOrder === "desc"
            ? [...runningAsc].reverse()
            : runningAsc;

    const visibleRunningList = runningList.filter((tx) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        return (
            (tx.type === "income" ? tx.source : tx.category)?.toLowerCase().includes(term) ||
            tx.type?.toLowerCase().includes(term) ||
            formatDate(tx.date).toLowerCase().includes(term) ||
            formatMoney(tx.amount).toLowerCase().includes(term) ||
            formatMoney(tx.runningBalance).toLowerCase().includes(term)
        );
    });


    useEffect(() => {
        if (sortOrder === "asc" && tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    }, [sortOrder, runningList]);
    // ============================
    // LOAD USER
    // ============================
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            window.location.href = "/";
            return;
        }
        setUser(storedUser);
    }, []);

    // ============================
    // FETCH USER TRANSACTIONS
    // ============================
    useEffect(() => {
        if (!user) return;

        async function loadData() {
            const res = await fetch(`${API_URL}/transactions/user/${user.id}`);
            const data = await res.json();
            setTransactions(data);
        }

        loadData();
    }, [user]);

    if (!user) return null;

    // ============================
    // FORMATTERS
    // ============================
    function formatMoney(amount) {
        return Number(amount).toLocaleString("en-US", {
            style: "currency",
            currency: "php"
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            month: "short",
            day: "2-digit",
            year: "numeric"
        };
        return date
            .toLocaleDateString("en-US", options)
            .replace(",", "")
            .replace(" ", "/");
    }

    function exportToCSV(filename, rows) {
        if (!rows || rows.length === 0) return;

        const headers = [
            "Date",
            "Category / Source",
            "Expense",
            "Income",
            "Running Balance"
        ];

        const values = rows.map(tx => [
            formatDate(tx.date),
            tx.type === "income" ? tx.source : tx.category,
            tx.type === "expense" ? formatMoney(tx.amount) : "",
            tx.type === "income" ? formatMoney(tx.amount) : "",
            formatMoney(tx.runningBalance)
        ]);

        const csvContent =
            headers.join(",") +
            "\n" +
            values.map(row => row.map(v => `"${v}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    function printTable() {
        window.print();
    }
    return (
        <>

            {/* MAIN CONTENT */}
            <main className="content">
                <div className="page-transition">
                    <div className={styles.title}>
                        <h3>Running Balance</h3>
                    </div>

                    <div className="top-row">
                        <div className="search-wrap">
                            <input
                                className="search"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="actions">
                            <button className="button" onClick={() => setOpenFilter(true)}>Filter</button>

                            <button
                                className="button"
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            >
                                Sort: {sortOrder === "desc" ? "Newest ↓" : "Oldest ↑"}
                            </button>

                            {/* <CurrencyPopup /> */}

                            <button className="button" onClick={() => exportToCSV("running_balance.csv", visibleRunningList)}>
                                Export CSV
                            </button>

                            <button className="button" onClick={printTable}>
                                Print
                            </button>
                        </div>
                    </div>

                    {/* RUNNING BALANCE TABLE */}


                    <div className={styles.runningPage}>
                        <div className={styles.runningTableWrapper} ref={tableRef}>
                            <div id="print-area">
                                <table className={styles.runningTable}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Category / Source</th>
                                            <th>Expense</th>
                                            <th>Income</th>
                                            <th>Running Balance</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleRunningList.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className={styles.txEmpty}>
                                                    No transactions found
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleRunningList.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td>{formatDate(tx.date)}</td>
                                                    <td>{tx.type === "income" ? tx.source : tx.category}</td>

                                                    <td className={styles.expenseAmount}>
                                                        {tx.type === "expense" ? formatMoney(tx.amount) : ""}
                                                    </td>

                                                    <td className={styles.revenueAmount}>
                                                        {tx.type === "income" ? formatMoney(tx.amount) : ""}
                                                    </td>

                                                    <td className={tx.runningBalance >= 0 ? styles.revenueAmount : styles.expenseAmount}>
                                                        {formatMoney(tx.runningBalance)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <UniversalFilterModal
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                onApply={handleFilter}
            />
        </>
    );
}