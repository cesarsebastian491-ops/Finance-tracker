import { useEffect, useState } from "react";
import styles from "./LogsPage.module.css";
import { API_URL } from "../../../../config";



export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [userFilter, setUserFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });

    const token = JSON.parse(localStorage.getItem("user"))?.access_token;

    const fetchLogs = async () => {
        const res = await fetch(`${API_URL}/logs/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLogs(data);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // FILTERING
    let filtered = logs
        .filter((log) => {
            const term = search.toLowerCase();
            return (
                log.message.toLowerCase().includes(term) ||
                (log.user?.username || '').toLowerCase().includes(term)
            );
        })
        .filter((log) => (actionFilter === "all" ? true : log.action === actionFilter))
        .filter((log) => (userFilter === "all" ? true : log.userId === Number(userFilter)))
        .filter((log) => {
            if (!dateRange.from && !dateRange.to) return true;
            const ts = new Date(log.timestamp);
            const from = dateRange.from ? new Date(dateRange.from) : null;
            const to = dateRange.to ? new Date(dateRange.to) : null;

            if (from && ts < from) return false;
            if (to && ts > to) return false;
            return true;
        });

    // SORTING
    filtered = [...filtered].sort((a, b) => {
        let x = a[sortConfig.key];
        let y = b[sortConfig.key];

        if (sortConfig.key === "timestamp") {
            x = new Date(x);
            y = new Date(y);
        }

        if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
        if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <div className={styles.container}>
            {/* FILTER BAR */}
            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />

                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className={styles.select}
                >
                    <option value="all">All Actions</option>
                    <option value="ADD_EXPENSE">Add Expense</option>
                    <option value="EDIT_EXPENSE">Edit Expense</option>
                    <option value="DELETE_EXPENSE">Delete Expense</option>
                    <option value="ADD_INCOME">Add Income</option>
                    <option value="EDIT_INCOME">Edit Income</option>
                    <option value="DELETE_INCOME">Delete Income</option>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                </select>

                <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className={styles.select}
                >
                    <option value="all">All Users</option>
                    {[...new Map(logs.map((l) => [l.userId, l.user?.username || `User ${l.userId}`])).entries()].map(([id, name]) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className={styles.dateInput}
                />

                <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className={styles.dateInput}
                />
            </div>

            {/* TABLE */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("id")}>ID</th>
                            <th onClick={() => handleSort("message")}>Message</th>
                            <th>Username</th>
                            <th onClick={() => handleSort("userId")}>User ID</th>
                            <th onClick={() => handleSort("action")}>Action</th>
                            <th onClick={() => handleSort("timestamp")}>Timestamp</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((log) => (
                            <tr key={log.id} className={styles[`action_${log.action}`]}>
                                <td>{log.id}</td>
                                <td>{log.message}</td>
                                <td>{log.user?.username || '—'}</td>
                                <td>{log.userId}</td>
                                <td>{log.action}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}