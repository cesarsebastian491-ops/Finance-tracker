import { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import styles from "./LogPage.module.css";
import "../../Components/staffTheme.css";

export default function StaffLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });

  const token = JSON.parse(localStorage.getItem("user"))?.access_token;

  useEffect(() => {
    fetch(`${API_URL}/logs/staff/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []));
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  let filtered = logs
    .filter((log) => log.message?.toLowerCase().includes(search.toLowerCase()))
    .filter((log) => actionFilter === "all" || log.action === actionFilter)
    .filter((log) => {
      if (!dateRange.from && !dateRange.to) return true;
      const ts = new Date(log.timestamp);
      if (dateRange.from && ts < new Date(dateRange.from)) return false;
      if (dateRange.to && ts > new Date(dateRange.to)) return false;
      return true;
    });

  filtered = [...filtered].sort((a, b) => {
    let x = a[sortConfig.key];
    let y = b[sortConfig.key];
    if (sortConfig.key === "timestamp") { x = new Date(x); y = new Date(y); }
    if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
    if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Logs</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search message..."
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
          <option value="ADD_INCOME">Add Income</option>
          <option value="EDIT_INCOME">Edit Income</option>
          <option value="DELETE_INCOME">Delete Income</option>
          <option value="ADD_EXPENSE">Add Expense</option>
          <option value="EDIT_EXPENSE">Edit Expense</option>
          <option value="DELETE_EXPENSE">Delete Expense</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="FAILED_LOGIN">Failed Login</option>
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

        <span className={styles.count}>{filtered.length} results</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>ID{sortIcon("id")}</th>
              <th onClick={() => handleSort("message")}>Message{sortIcon("message")}</th>
              <th onClick={() => handleSort("userId")}>User ID{sortIcon("userId")}</th>
              <th onClick={() => handleSort("action")}>Action{sortIcon("action")}</th>
              <th onClick={() => handleSort("timestamp")}>Timestamp{sortIcon("timestamp")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className={styles[`action_${log.action}`]}>
                <td>{log.id}</td>
                <td>{log.message}</td>
                <td>{log.userId ?? "—"}</td>
                <td>
                  <span className={`${styles.actionBadge} ${styles[`badge_${log.action}`]}`}>
                    {log.action}
                  </span>
                </td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
