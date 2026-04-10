import { useEffect, useState } from "react";
import styles from "./systemAnalytics.module.css";
import { API_URL } from "../../../../config";

export default function SystemAnalyticsPage() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/analytics/system`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    }
    load();
  }, []);

  if (!data) return <p>Loading system analytics...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Analytics</h2>

      <div className={styles.grid}>
        <Card label="API Requests Today" value={data.requestsToday} />
        <Card label="Errors Today" value={data.errors} />
      </div>

      <div className={styles.block}>
        <h3>Most Used Endpoints</h3>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.header}`}>
            <span>Endpoint</span>
            <span>Count</span>
          </div>

          {data.mostUsed.map((e, i) => (
            <div key={i} className={styles.row}>
              <span>{e.endpoint}</span>
              <span>{e.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <h3>Slow Endpoints</h3>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.header}`}>
            <span>Message</span>
            <span>Time</span>
          </div>

          {data.slowEndpoints.map((s, i) => (
            <div key={i} className={styles.row}>
              <span>{s.message}</span>
              <span>{s.timestamp}</span>
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