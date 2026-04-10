import { useEffect, useState } from "react";
import styles from "./securityAnalytics.module.css";
import { API_URL } from "../../../../config";

export default function AdminSecurityAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        async function fetchSecurity() {
            try {
                const res = await fetch(`${API_URL}/analytics/security`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Failed to load security analytics", err);
            } finally {
                setLoading(false);
            }
        }

        fetchSecurity();
    }, [token]);

    if (loading || !data) {
        return <p className={styles.loading}>Loading security analytics...</p>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Security Analytics</h2>

            {/* Summary Cards */}
            <div className={styles.grid}>
                <Card label="Total Logins" value={data.totalLogins} />
                <Card label="Failed Logins" value={data.failedLogins} />
                <Card label="Active Sessions" value={data.activeSessions} />
            </div>

            {/* Recent Security Logs */}
            <div className={styles.tableBlock}>
                <h3 className={styles.subtitle}>Recent Security Logs</h3>

                <div className={styles.table}>
                    <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                        <span>Date</span>
                        <span>Action</span>
                        <span>User</span>
                        <span>IP</span>
                    </div>

                    {data.recentSecurityLogs?.map((log) => (
                        <div key={log.id} className={styles.tableRow}>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <span>{log.action}</span>
                            <span>
                                {log.user
                                    ? `${log.user.firstName} ${log.user.lastName}`
                                    : "—"}
                            </span>
                            <span>{log.ip || "—"}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Card({ label, value }) {
    return (
        <div className={styles.card}>
            <h4>{label}</h4>
            <p>{value}</p>
        </div>
    );
}