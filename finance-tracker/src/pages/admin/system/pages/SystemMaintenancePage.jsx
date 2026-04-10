import styles from "./SystemMaintenancePage.module.css";
import { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import { Navigate } from "react-router-dom";

export default function SystemMaintenancePage() {
  const user = JSON.parse(localStorage.getItem("user"));

  // FRONTEND ADMIN-ONLY GUARD
  if (!user || user.role !== "admin") {
    return <Navigate to="/not-authorized" />;
  }

  const [modal, setModal] = useState(null);

  const token = user?.access_token;

  async function handleBackup() {
    const first = confirm("Create a full system backup?");
    if (!first) return;

    const second = confirm("Proceed with backup?");
    if (!second) return;

    const res = await fetch(`${API_URL}/maintenance/backup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();

    window.URL.revokeObjectURL(url);
    setModal(null);
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
    if (!first) return;

    const second = confirm("FINAL WARNING: Restoring will overwrite ALL current data. Continue?");
    if (!second) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/maintenance/restore`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    alert(data.message);
    setModal(null);
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
          <button className={styles.primaryButton} onClick={handleBackup}>
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
          <button className={styles.dangerButton} onClick={handleClearLogs}>
            Clear Logs
          </button>
        </div>

        {/* CLEAR TRANSACTIONS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Clear Transactions</h3>
          <p className={styles.cardDescription}>
            Delete all financial transactions. This cannot be undone.
          </p>
          <button className={styles.dangerButton} onClick={handleClearTransactions}>
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

            <button className={styles.primaryButton}>Start Backup</button>
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
              type="file"
              accept=".json"
              onChange={handleRestore}
              className={styles.fileInput}
            />

            <button
              className={styles.cancelButton}
              onClick={() => setModal(null)}
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

            <button className={styles.dangerButton}>Clear Logs</button>
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

            <button className={styles.dangerButton}>Clear Transactions</button>
            <button className={styles.cancelButton} onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}