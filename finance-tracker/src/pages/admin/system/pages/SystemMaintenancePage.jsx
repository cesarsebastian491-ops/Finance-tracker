import styles from "./SystemMaintenancePage.module.css";
import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../../../config";
import { Navigate } from "react-router-dom";

export default function SystemMaintenancePage() {
  let user = null;
  try {
    const storedData = localStorage.getItem("user");
    user = storedData ? JSON.parse(storedData) : null;
  } catch (err) {
    console.error("Failed to parse user data from localStorage", err);
    localStorage.removeItem("user");
    user = null;
  }

  const [modal, setModal] = useState(null);
  const fileInputRef = useRef(null);

  const token = user?.access_token;

  // FRONTEND ADMIN-ONLY GUARD
  if (!user || user.role !== "admin") {
    return <Navigate to="/not-authorized" />;
  }

  async function handleBackup() {
    const first = confirm("Create a full system backup?");
    if (!first) return;

    const second = confirm("Proceed with backup?");
    if (!second) return;

    try {
      const res = await fetch(`${API_URL}/maintenance/backup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backup failed: ${errorText || res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.json";
      a.click();

      window.URL.revokeObjectURL(url);
      setModal(null);
      alert("Backup downloaded successfully!");
    } catch (err) {
      alert(err.message || "Failed to create backup");
    }
  }

  async function handleClearLogs() {
    const first = confirm("Are you sure you want to clear all logs?");
    if (!first) return;

    const second = confirm("FINAL WARNING: This will permanently delete ALL logs. Continue?");
    if (!second) return;

    const res = await fetch(`${API_URL}/maintenance/logs`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    setModal(null);
  }

  async function handleClearTransactions() {
    const first = confirm("Are you sure you want to clear ALL transactions?");
    if (!first) return;

    const second = confirm("FINAL WARNING: This will permanently delete ALL financial records. Continue?");
    if (!second) return;

    const res = await fetch(`${API_URL}/maintenance/transactions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    setModal(null);
  }

  async function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;

    const first = confirm("Are you sure you want to restore this backup?");
    if (!first) {
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const second = confirm("FINAL WARNING: Restoring will overwrite ALL current data. Continue?");
    if (!second) {
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/maintenance/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        // Not JSON (e.g. 500 error with HTML response)
        throw new Error("Restore failed: Invalid server response.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Restore failed: Internal server error.");
      }

      alert(data.message || "System restored from backup.");
      setModal(null);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err.message || "Restore failed: Unknown error.");
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Maintenance</h2>
      <p className={styles.subtitle}>
        Tools for backing up, restoring, and cleaning system data.
      </p>

      <div className={styles.grid}>
        {/* BACKUP */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Backup Database</h3>
          <p className={styles.cardDescription}>
            Create a full backup of all system data.
          </p>
          <button className={styles.primaryButton} onClick={() => setModal("backup")}>
            Start Backup
          </button>
        </div>

        {/* RESTORE */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Restore Backup</h3>
          <p className={styles.cardDescription}>
            Restore the system from a backup file.
          </p>
          <button
            className={styles.dangerButton}
            onClick={() => setModal("restore")}
          >
            Restore Backup
          </button>
        </div>

        {/* CLEAR LOGS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Clear Logs</h3>
          <p className={styles.cardDescription}>
            Permanently delete all system activity logs.
          </p>
          <button className={styles.dangerButton} onClick={() => setModal("clearLogs")}> 
            Clear Logs
          </button>
        </div>

        {/* CLEAR TRANSACTIONS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Clear Transactions</h3>
          <p className={styles.cardDescription}>
            Delete all financial transactions. This cannot be undone.
          </p>
          <button className={styles.dangerButton} onClick={() => setModal("clearTransactions")}> 
            Clear Transactions
          </button>
        </div>
      </div>

      {/* MODALS */}
      {modal === "backup" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Backup Database?</h3>
            <p className={styles.warningText}>
              This will generate a full system backup.
            </p>

            <button className={styles.primaryButton} onClick={handleBackup}>Start Backup</button>
            <button className={styles.cancelButton} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {modal === "restore" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Restore Backup?</h3>
            <p className={styles.warningText}>
              Restoring a backup will overwrite all current data.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestore}
              className={styles.fileInput}
              style={{ display: 'none' }}
            />

            <button
              className={styles.primaryButton}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Backup File
            </button>

            <button
              className={styles.cancelButton}
              onClick={() => {
                setModal(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {modal === "clearLogs" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Clear All Logs?</h3>
            <p className={styles.warningText}>
              This action cannot be undone.
            </p>

            <button className={styles.dangerButton} onClick={handleClearLogs}>Clear Logs</button>
            <button className={styles.cancelButton} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {modal === "clearTransactions" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Clear All Transactions?</h3>
            <p className={styles.warningText}>
              This will permanently delete all financial records.
            </p>

            <button className={styles.dangerButton} onClick={handleClearTransactions}>Clear Transactions</button>
            <button className={styles.cancelButton} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}