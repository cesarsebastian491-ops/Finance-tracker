import { useEffect, useState, useRef, useContext } from "react";
import UniversalFilterModal from "../../../components/universalfilter/universalFilterModal";
import TransactionInfoModal from "../../../components/TransactionInfoModal";
import styles from "./transaction.module.css";
import { API_URL } from "../../../config";
import { CurrencyContext } from "../../../context/CurrencyContext";


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



export default function RunningBalancePage({ role } = {}) {

    const isStaff = role === "staff";
    const { activeCurrency } = useContext(CurrencyContext);

    // ============================
    // STATE
    // ============================
    const [sortOrder, setSortOrder] = useState("asc");
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
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
    function getTotalWithCharges(tx) {
        const base = Number(tx.amount) || 0;
        const tax = Number(tx.tax) || 0;
        const serviceFee = Number(tx.serviceFee) || 0;
        const otherCharge = Number(tx.otherCharge) || 0;
        const discount = Number(tx.discount) || 0;
        return base + tax + serviceFee + otherCharge - discount;
    }

    function calculateRunningBalance(list) {
        let balance = 0;

        return list.map(tx => {
            const total = getTotalWithCharges(tx);
            if (tx.type === "income") {
                balance += total;
            } else {
                balance -= total;
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
            (tx.type === "income" ? tx.source : tx.expense)?.toLowerCase().includes(term) ||
            tx.category?.toLowerCase().includes(term) ||
            tx.type?.toLowerCase().includes(term) ||
            formatDate(tx.date).toLowerCase().includes(term) ||
            formatMoney(tx.amount).toLowerCase().includes(term) ||
            formatMoney(tx.runningBalance).toLowerCase().includes(term) ||
            (isStaff && tx.user?.username?.toLowerCase().includes(term))
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
        if (!storedUser && !isStaff) {
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
            const url = isStaff
                ? `${API_URL}/analytics/staff/transactions`
                : `${API_URL}/transactions/user/${user.id}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${user.access_token}` }
            });
            
            if (!res.ok) {
                console.error("Failed to load transactions:", res.status);
                setTransactions([]);
                return;
            }
            
            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : []);
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
            currency: activeCurrency?.code || "PHP"
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
            "Title",
            "Category",
            "Date",
            "Amount",
            "Tax",
            "Service Fee",
            "Discount",
            "Other Charge",
            "Total",
            "Type",
            "Running Balance",
            "Recurring",
            "Recurring Start",
            "Recurring End"
        ];

        const values = rows.map(tx => [
            tx.type === "income" ? (tx.source || "—") : (tx.expense || "—"),
            tx.category || "—",
            formatDate(tx.date),
            formatMoney(Number(tx.amount) || 0),
            formatMoney(Number(tx.tax) || 0),
            formatMoney(Number(tx.serviceFee) || 0),
            formatMoney(Number(tx.discount) || 0),
            formatMoney(Number(tx.otherCharge) || 0),
            formatMoney(getTotalWithCharges(tx)),
            tx.type === "income" ? "Income" : "Expense",
            formatMoney(tx.runningBalance),
            tx.isRecurring ? "Yes" : "",
            tx.isRecurring ? formatDate(tx.date) : "",
            tx.isRecurring ? (tx.recurringEndDate ? formatDate(tx.recurringEndDate) : "No end date") : ""
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
                                            {isStaff && <th>Username</th>}
                                            <th>Title</th>
                                            <th>Date</th>
                                            <th>Category</th>
                                            <th className={styles.screenOnly}>Expense</th>
                                            <th className={styles.screenOnly}>Income</th>
                                            <th className={styles.hideOnPrint}>Amount</th>
                                            <th className={styles.hideOnPrint}>Tax</th>
                                            <th className={styles.hideOnPrint}>Service Fee</th>
                                            <th className={styles.hideOnPrint}>Discount</th>
                                            <th className={styles.hideOnPrint}>Other Charge</th>
                                            <th className={styles.hideOnPrint}>Total</th>
                                            <th className={styles.hideOnPrint}>Type</th>
                                            <th>Running Balance</th>
                                            <th className={styles.hideOnPrint}>Recurring</th>
                                            <th className={styles.hideOnPrint}>Recurring Start</th>
                                            <th className={styles.hideOnPrint}>Recurring End</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleRunningList.length === 0 ? (
                                            <tr>
                                                <td colSpan={isStaff ? 7 : 6} className={styles.txEmpty}>
                                                    No transactions found
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleRunningList.map((tx) => (
                                                <tr
                                                    key={tx.id}
                                                    className={tx.type === "income" ? styles.incomeRow : styles.expenseRow}
                                                    onClick={() => setSelectedTransaction(tx)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {isStaff && <td>{tx.user?.username || '—'}</td>}
                                                    <td>{tx.type === "income" ? (tx.source || "—") : (tx.expense || "—")}</td>
                                                    <td>{formatDate(tx.date)}</td>
                                                    <td>{tx.category || "—"}</td>

                                                    <td className={`${styles.expenseAmount} ${styles.screenOnly}`}>
                                                        {tx.type === "expense" ? formatMoney(getTotalWithCharges(tx)) : ""}
                                                    </td>

                                                    <td className={`${styles.revenueAmount} ${styles.screenOnly}`}>
                                                        {tx.type === "income" ? formatMoney(getTotalWithCharges(tx)) : ""}
                                                    </td>

                                                    <td className={styles.hideOnPrint}>{formatMoney(Number(tx.amount) || 0)}</td>
                                                    <td className={styles.hideOnPrint}>{formatMoney(Number(tx.tax) || 0)}</td>
                                                    <td className={styles.hideOnPrint}>{formatMoney(Number(tx.serviceFee) || 0)}</td>
                                                    <td className={styles.hideOnPrint}>{formatMoney(Number(tx.discount) || 0)}</td>
                                                    <td className={styles.hideOnPrint}>{formatMoney(Number(tx.otherCharge) || 0)}</td>
                                                    <td className={styles.hideOnPrint}>{formatMoney(getTotalWithCharges(tx))}</td>
                                                    <td className={styles.hideOnPrint}>{tx.type === "income" ? "Income" : "Expense"}</td>

                                                    <td className={tx.runningBalance >= 0 ? styles.revenueAmount : styles.expenseAmount}>
                                                        {formatMoney(tx.runningBalance)}
                                                    </td>

                                                    <td className={styles.hideOnPrint}>{tx.isRecurring ? "Yes" : ""}</td>
                                                    <td className={styles.hideOnPrint}>{tx.isRecurring ? formatDate(tx.date) : ""}</td>
                                                    <td className={styles.hideOnPrint}>{tx.isRecurring ? (tx.recurringEndDate ? formatDate(tx.recurringEndDate) : "No end date") : ""}</td>
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

            {selectedTransaction && (
                <TransactionInfoModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    formatMoney={formatMoney}
                    formatDate={formatDate}
                />
            )}

            <UniversalFilterModal
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                onApply={handleFilter}
            />
        </>
    );
}