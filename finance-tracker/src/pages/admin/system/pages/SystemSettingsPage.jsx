import { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import styles from "./SystemSettingsPage.module.css";

export default function SystemSettingsPage() {
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);


  // Load current app name
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    fetch(`${API_URL}/system-settings/app-name`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAppName(data.value);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading app name:", err);
        console.log("API_URL =", API_URL);
        setLoading(false);
      });
  }, []);

  // Load system info
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    fetch(`${API_URL}/system-settings/system-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSystemInfo(data))
      .catch((err) => console.error("Error loading system info:", err));
  }, []);

  // Save new app name
  const save = async () => {
    setSaving(true);

    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    await fetch(`${API_URL}/system-settings/app-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ value: appName }),
    });

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
    <h2 className={styles.title}>System Settings</h2>
    <div className={styles.container}>
      

      <div className={styles.section}>
        <label className={styles.label}>App Name</label>
        <input
          className={styles.input}
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />

        <button className={styles.saveButton} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {/* SYSTEM INFO PANEL */}
      <div className={styles.section}>
        <h3 className={styles.subTitle}>System Information</h3>

        {!systemInfo ? (
          <p>Loading system info...</p>
        ) : (
          <>
            <div className={styles.infoRow}>
              <label>App Version</label>
              <p>{systemInfo.version}</p>
            </div>

            <div className={styles.infoRow}>
              <label>Server Uptime</label>
              <p>{Math.floor(systemInfo.uptime)} seconds</p>
            </div>

            <div className={styles.infoRow}>
              <label>Database Status</label>
              <p>{systemInfo.database}</p>
            </div>

            <div className={styles.infoRow}>
              <label>Environment</label>
              <p>{systemInfo.environment}</p>
            </div>
          </>
        )}
      </div>
      {/* BACKUP & RESTORE SECTION */}
      <div className={styles.section}>
        <h3 className={styles.subTitle}>Backup & Restore</h3>

        {/* BACKUP BUTTON */}
        <button
          className={styles.saveButton}
          onClick={async () => {
            try {
              const stored = JSON.parse(localStorage.getItem("user"));
              const token = stored?.access_token;

              const res = await fetch(`${API_URL}/system-settings/backup/export`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = "backup.json";
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Backup failed:", err);
              alert("Backup failed");
            }
          }}
        >
          Download Backup
        </button>

        {/* RESTORE BUTTON + HIDDEN INPUT */}
        <input
          type="file"
          id="restoreFile"
          accept=".json"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const stored = JSON.parse(localStorage.getItem("user"));
            const token = stored?.access_token;

            const formData = new FormData();
            formData.append("file", file);

            try {
              const res = await fetch(`${API_URL}/system-settings/backup/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              });

              const data = await res.json();
              alert(data.message || "Restore complete");
            } catch (err) {
              console.error("Restore failed:", err);
              alert("Restore failed");
            }
          }}
        />

        <button
          className={styles.saveButton}
          onClick={() => document.getElementById("restoreFile").click()}
        >
          Upload Backup
        </button>
      </div>
    </div>

    </>
    

  );
}