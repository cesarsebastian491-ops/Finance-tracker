import { useState, useEffect } from "react";
import { API_URL } from "../../../../config";
import styles from "./SystemSettingsPage.module.css";

export default function SystemSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  fetch(`${API_URL}/sessions/${user.id}`, {
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log("SESSIONS:", data);
      setSessions(data);
    });
}, []); // <-- RUN ONLY ONCE

  // 2FA state
  const stored = JSON.parse(localStorage.getItem("user"));
  const userId = stored?.id;
  const token = stored?.access_token;

  const [qrCode, setQrCode] = useState(null);
  const [qrCodeSecret, setQrCodeSecret] = useState(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(stored?.user?.twoFactorEnabled);
  const [step, setStep] = useState("idle"); // idle | showQR | verify | confirmedDisable

  const [code, setCode] = useState("");

  // -------------------------
  // CHANGE PASSWORD
  // -------------------------
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/system-settings/security/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Password change failed");
      } else {
        alert("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setSaving(false);
  };

  // -------------------------
  // ENABLE 2FA
  // -------------------------
  const enable2FA = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/2fa/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }) // FIXED
      });

      const data = await res.json();

      setQrCode(data.qrCode);
      setQrCodeSecret(data.secret); // if needed
      setStep("showQR");

      console.log("2FA GENERATE USER:", stored.email); // FIXED
    } catch (err) {
      console.error("Enable 2FA error:", err);
    }
  };

  // -------------------------
  // VERIFY 2FA CODE
  // -------------------------
  const verify2FA = async () => {
    const res = await fetch(`${API_URL}/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code, secret: qrCodeSecret }) // <-- FIXED
    });

    const data = await res.json();

    if (data.success) {
      alert("2FA Enabled Successfully!");
      setTwoFAEnabled(true);

      const updated = {
        ...stored,
        user: { ...stored.user, twoFactorEnabled: true }
      };

      localStorage.setItem("user", JSON.stringify(updated));
      setStep("idle");
      setCode("");
    } else {
      alert("Invalid code");
    }
  };

  // -------------------------
  // DISABLE 2FA
  // -------------------------
  const disable2FA = async () => {
    const res = await fetch(`${API_URL}/auth/2fa/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();

    if (data.success) {
      alert("2FA Disabled");
      setTwoFAEnabled(false);

      const updated = {
        ...stored,
        user: { ...stored.user, twoFactorEnabled: false }
      };

      localStorage.setItem("user", JSON.stringify(updated));
      setStep("idle");
    }
  };

  return (
    <>
      <h2 className={styles.title}>System Security</h2>

      <div className={styles.container}>

        {/* CHANGE PASSWORD */}
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Change Admin Password</h3>

          <label className={styles.label}>Current Password</label>
          <input
            type="password"
            className={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label className={styles.label}>New Password</label>
          <input
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label className={styles.label}>Confirm New Password</label>
          <input
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className={styles.saveButton}
            onClick={changePassword}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Password"}
          </button>
        </div>

        {/* TWO FACTOR AUTH */}
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Two‑Factor Authentication (2FA)</h3>

          {twoFAEnabled ? (
            <>
              <p className={styles.successText}>2FA is currently enabled.</p>

              <button
                className={styles.dangerButton}
                onClick={() => setStep("confirmDisable")}
              >
                Disable 2FA
              </button>
            </>
          ) : (
            <button className={styles.saveButton} onClick={enable2FA}>
              Enable 2FA
            </button>
          )}

          {/* SHOW QR CODE MODAL */}
          {step === "showQR" && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalCard}>
                <h3 className={styles.modalTitle}>Enable Two‑Factor Authentication</h3>

                <img src={qrCode} alt="QR Code" className={styles.qrImage} />

                <p className={styles.modalText}>
                  Scan this QR code with Google Authenticator, then enter the 6‑digit code.
                </p>

                <input
                  type="text"
                  maxLength={6}
                  className={styles.codeInput}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                <button className={styles.saveButton} onClick={verify2FA}>
                  Verify Code
                </button>

                <button className={styles.cancelButton} onClick={() => setStep("idle")}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* DISABLE 2FA MODAL */}
          {step === "confirmDisable" && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalCard}>
                <h3 className={styles.modalTitle}>Disable Two‑Factor Authentication?</h3>

                <p className={styles.warningText}>
                  This will remove the extra security layer from your account.
                </p>

                <button className={styles.dangerButton} onClick={disable2FA}>
                  Yes, Disable 2FA
                </button>

                <button className={styles.cancelButton} onClick={() => setStep("idle")}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
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
    </>
  );
}