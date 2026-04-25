import { useEffect, useState, useContext } from "react";
import UniversalFilterModal from "../../../components/universalfilter/universalFilterModal";
import { CurrencyContext } from "../../../context/CurrencyContext";
import styles from "./LogPage.module.css";
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


export default function LogsPage() {
    // 1️⃣ STATE
    const { activeCurrency } = useContext(CurrencyContext);
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [activeFilter, setActiveFilter] = useState({
        time: "monthly",
        type: "all",
        customStart: null,
        customEnd: null
    });

    // 2️⃣ FILTER HANDLER
    function handleFilter({ time, type, customStart, customEnd }) {
        setActiveFilter({ time, type, customStart, customEnd });
    }

    // 3️⃣ FILTER LOGIC
    const filteredLogs = logs.filter(log => {
        const d = new Date(log.timestamp);
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
        if (activeFilter.type === "income" && !log.action.includes("INCOME")) return false;
        if (activeFilter.type === "expense" && !log.action.includes("EXPENSE")) return false;

        return true;
    });

    const visibleLogs = filteredLogs.filter((log) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        return (
            log.action?.toLowerCase().includes(term) ||
            log.message?.toLowerCase().includes(term) ||
            formatDate(log.timestamp).toLowerCase().includes(term)
        );
    });

    // 4️⃣ LOAD USER
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            window.location.href = "/";
            return;
        }
        setUser(storedUser);
    }, []);

    // 5️⃣ FETCH LOGS
    useEffect(() => {
        if (!user) return;

        async function loadLogs() {
            const res = await fetch(`${API_URL}/logs/user/${user.id}`);
            const data = await res.json();
            setLogs(data);
        }

        loadLogs();
    }, [user]);

    if (!user) return null;

    // 6️⃣ CURRENCY FORMATTER
    function formatMoney(amount) {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: activeCurrency?.code || 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    }

    // 7️⃣ DATE FORMATTER
    function formatDate(dateString) {
        const date = new Date(dateString);

        const options = {
            month: "short",   // Jan, Feb, Mar
            day: "2-digit",
            year: "numeric"
        };

        return date
            .toLocaleDateString("en-US", options)
            .replace(",", "")     // remove comma
            .replace(" ", "/");   // turn "Feb 10 2026" → "Feb/10/2026"
    }

    function exportLogsCSV(filename, rows) {
        if (!rows || rows.length === 0) return;

        const headers = ["Action", "Message", "Date"];

        const readableAction = (action) => {
            if (action.includes("ADD_EXPENSE")) return "Added Expense";
            if (action.includes("ADD_INCOME")) return "Added Income";
            if (action.includes("EDIT_EXPENSE")) return "Updated Expense";
            if (action.includes("EDIT_INCOME")) return "Updated Income";
            if (action.includes("DELETE_EXPENSE")) return "Deleted Expense";
            if (action.includes("DELETE_INCOME")) return "Deleted Income";
            return action;
        };

        const values = rows.map(log => [
            readableAction(log.action),
            log.message,
            formatDate(log.timestamp)
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
            <main className="content">
                <div className="page-transition">
                    <div className={styles.title}>
                        <h3>Activity logs</h3>
                    </div>

                    {/* TOP ROW — optional search + currency */}
                    <div className="top-row">
                        <div className="search-wrap">
                            <input
                                className="search"
                                placeholder="Search logs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="actions">
                            <button className="button" onClick={() => setOpenFilter(true)}>Filter</button>
                            <button className="button" onClick={() => exportLogsCSV("logs.csv", visibleLogs)}>
                                Export CSV
                            </button>

                            <button className="button" onClick={printTable}>
                                Print
                            </button>
                        </div>
                    </div>

                    {/* LOGS TABLE */}
                    <div className={styles.logsPage}>
                        <div className={styles.tableWrapper}>
                            <div id="print-area">
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Message</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className={styles.empty}>
                                                    No activity found
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <span
                                                            className={
                                                                log.action.includes("ADD")
                                                                    ? styles.badgeGreen
                                                                    : log.action.includes("DELETE")
                                                                        ? styles.badgeRed
                                                                        : log.action.includes("EDIT")
                                                                            ? styles.badgeBlue
                                                                            : styles.badgeGray
                                                            }
                                                        >
                                                            {log.action}
                                                        </span>
                                                    </td>

                                                    <td>{log.message}</td>
                                                    <td>{formatDate(log.timestamp)}</td>
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