import { useEffect, useState } from "react";
import styles from "./SystemHealthPage.module.css";
import { API_URL } from "../../../../config";

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/system/health`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setHealth(data));
  }, []);

  if (!health) return <p>Loading system health...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Health</h2>

      <div className={styles.grid}>
        <HealthCard label="API Status" value={health.status} />
        <HealthCard label="Database" value={health.database} />
        <HealthCard label="Uptime" value={health.uptime} />
        <HealthCard label="CPU Load" value={health.cpu} />
        <HealthCard label="Memory (RSS)" value={health.memory.rss} />
        <HealthCard label="Memory (Heap Used)" value={health.memory.heapUsed} />
      </div>
    </div>
  );
}

function HealthCard({ label, value }) {
  const isGood =
    value === "ok" ||
    value === "online" ||
    value === "connected" ||
    typeof value === "string";

  return (
    <div className={styles.card}>
      <h3>{label}</h3>
      <p className={isGood ? styles.ok : styles.bad}>{value}</p>
    </div>
  );
}