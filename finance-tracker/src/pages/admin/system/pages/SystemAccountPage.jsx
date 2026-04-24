import { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import "../../../../theme.css";
import styles from "./SystemAccountPage.module.css";

export default function SystemAccountPage() {
  let stored = null;
  try {
    const storedData = localStorage.getItem("user");
    stored = storedData ? JSON.parse(storedData) : null;
  } catch (err) {
    console.error("Failed to parse user data from localStorage", err);
    localStorage.removeItem("user");
    stored = null;
  }
  const token = stored?.access_token;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [qrCode, setQrCode] = useState(null);
  const [qrCodeSecret, setQrCodeSecret] = useState(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(stored?.user?.twoFactorEnabled);
  const [step, setStep] = useState("idle");
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Admin profile data:", data);

        setForm({
          username: data?.username || "",
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function saveProfile() {
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to save admin profile:", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setSavingPassword(true);

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

    setSavingPassword(false);
  }

  async function enable2FA() {
    if (!stored?.id) {
      alert("Error: User ID not found. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/2fa/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: stored.id }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to generate 2FA: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log("2FA response:", data);

      if (!data.qrCode || !data.secret) {
        throw new Error("Invalid response: missing qrCode or secret");
      }

      setQrCode(data.qrCode);
      setQrCodeSecret(data.secret);
      setStep("showQR");
    } catch (err) {
      console.error("Enable 2FA error:", err);
      alert(err.message || "Failed to enable 2FA");
    }
  }

  async function verify2FA() {
    if (!code) {
      alert("Please enter the 6-digit code");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: stored?.id, code, secret: qrCodeSecret }),
      });

      if (!res.ok) {
        throw new Error(`Verification failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        alert("2FA Enabled Successfully!");
        setTwoFAEnabled(true);

        const updated = {
          ...stored,
          user: { ...stored.user, twoFactorEnabled: true },
        };

        localStorage.setItem("user", JSON.stringify(updated));
        setStep("idle");
        setCode("");
      } else {
        alert(data.message || "Invalid code. Please try again.");
        setCode("");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      alert(err.message || "Failed to verify 2FA code");
      setCode("");
    }
  }

  async function disable2FA() {
    try {
      const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: stored?.id }),
      });

      if (!res.ok) {
        throw new Error(`Failed to disable 2FA: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        alert("2FA Disabled");
        setTwoFAEnabled(false);

        const updated = {
          ...stored,
          user: { ...stored.user, twoFactorEnabled: false },
        };

        localStorage.setItem("user", JSON.stringify(updated));
        setStep("idle");
      } else {
        alert(data.message || "Failed to disable 2FA");
      }
    } catch (err) {
      console.error("Disable 2FA error:", err);
      alert(err.message || "Failed to disable 2FA");
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Admin Profile</h2>

      <div className={styles.cardsGrid}>
      {/* ACCOUNT INFO DISPLAY */}
      <div className={styles.card}>
        <h3 className={styles.subTitle}>Account Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>ID:</span>
            <span className={styles.infoValue}>{stored?.id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Role:</span>
            <span className={styles.infoValue}>{stored?.role?.toUpperCase()}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status:</span>
            <span className={styles.infoValue}>{stored?.status || 'Active'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Username:</span>
            <span className={styles.infoValue}>{form.username}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Name:</span>
            <span className={styles.infoValue}>{form.firstName} {form.lastName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{form.email}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <input
              className={styles.input}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <input
              className={styles.input}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <button className={styles.saveButton} onClick={saveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <div className={styles.card}>
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

        <button className={styles.saveButton} onClick={changePassword} disabled={savingPassword}>
          {savingPassword ? "Saving..." : "Update Password"}
        </button>
      </div>

      <div className={styles.card}>
        <h3 className={styles.subTitle}>Two-Factor Authentication (2FA)</h3>

        {twoFAEnabled ? (
          <>
            <p className={styles.successText}>2FA is currently enabled.</p>
            <button className={styles.dangerButton} onClick={() => setStep("confirmDisable")}>
              Disable 2FA
            </button>
          </>
        ) : (
          <button className={styles.saveButton} onClick={enable2FA}>
            Enable 2FA
          </button>
        )}

        {step === "showQR" && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <h3 className={styles.modalTitle}>Enable Two-Factor Authentication</h3>
              <img src={qrCode} alt="QR Code" className={styles.qrImage} />
              <p className={styles.modalText}>
                Scan this QR code with Google Authenticator, then enter the 6-digit code.
              </p>
              <input
                type="text"
                maxLength={6}
                className={styles.codeInput}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className={styles.saveButton} onClick={verify2FA}>Verify Code</button>
              <button className={styles.cancelButton} onClick={() => setStep("idle")}>Cancel</button>
            </div>
          </div>
        )}

        {step === "confirmDisable" && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <h3 className={styles.modalTitle}>Disable Two-Factor Authentication?</h3>
              <p className={styles.warningText}>
                This will remove the extra security layer from your account.
              </p>
              <button className={styles.dangerButton} onClick={disable2FA}>Yes, Disable 2FA</button>
              <button className={styles.cancelButton} onClick={() => setStep("idle")}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}