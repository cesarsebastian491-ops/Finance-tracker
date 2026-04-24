import { useState, useEffect } from "react";
import styles from "./SystemSettingsPage.module.css";
import { API_URL } from "../../../../config";

export default function SystemSecurityPage() {
  const [sessions, setSessions] = useState([]);
  let user = null;
  try {
    const storedData = localStorage.getItem("user");
    user = storedData ? JSON.parse(storedData) : null;
  } catch (err) {
    console.error("Failed to parse user data from localStorage", err);
    localStorage.removeItem("user");
    user = null;
  }
  const token = user?.access_token;

  async function loadSessions() {
    if (!user?.id || !token) return;

    try {
      const res = await fetch(`${API_URL}/sessions/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setSessions([]);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function revokeSession(sessionId) {
    if (!confirm("Revoke this session?")) return;

    try {
      await fetch(`${API_URL}/sessions/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      await loadSessions();
    } catch (err) {
      console.error("Failed to revoke session:", err);
      alert("Failed to revoke session");
    }
  }

  async function revokeAllOtherSessions() {
    if (!confirm("Revoke all other sessions?")) return;

    try {
      await fetch(`${API_URL}/sessions/revoke-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          currentSessionId: user.sessionId,
        }),
      });

      await loadSessions();
    } catch (err) {
      console.error("Failed to revoke sessions:", err);
      alert("Failed to revoke sessions");
    }
  }

  return (
    <>
      <h2 className={styles.title}>System Security</h2>

      <div className={styles.container}>

        <div className={styles.section}>
          <h3 className={styles.subTitle}>Active Sessions</h3>
          <p className={styles.infoText}>Manage where this admin account is currently signed in.</p>

          <button className={styles.saveButton} onClick={revokeAllOtherSessions}>
            Revoke All Other Sessions
          </button>

          <div className={styles.sessionTableWrapper}>
            <table className={styles.sessionTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Device</th>
                  <th className={styles.th}>IP</th>
                  <th className={styles.th}>Login Time</th>
                  <th className={styles.th}>Last Active</th>
                  <th className={styles.th}></th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => {
                  const isCurrent = session.id === user.sessionId;

                  return (
                    <tr
                      key={session.id}
                      className={`${styles.sessionRow} ${isCurrent ? styles.currentSession : ""}`}
                    >
                      <td className={styles.td}>{session.userAgent}</td>
                      <td className={styles.td}>{session.ip}</td>
                      <td className={styles.td}>{new Date(session.createdAt).toLocaleString()}</td>
                      <td className={styles.td}>{new Date(session.lastActive).toLocaleString()}</td>

                      <td className={styles.td}>
                        {!isCurrent && (
                          <button
                            className={styles.revokeButton}
                            onClick={() => revokeSession(session.id)}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}