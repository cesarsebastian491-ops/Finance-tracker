import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../../../config";
import styles from "./ProfilePage.module.css";
import "../../Components/staffTheme.css";

export default function StaffProfile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("view"); // "view" | "edit" | "password"
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const stored = JSON.parse(localStorage.getItem("user"));
  const token = stored?.access_token;

  const fetchProfile = async () => {
    const res = await fetch(`${API_URL}/users/${stored.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data);
    setForm({
      username: data.username || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showMsg("Profile updated successfully!");
      fetchProfile();
      setTab("view");
    } catch {
      showMsg("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showMsg("New passwords do not match.", "error");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      showMsg("Password must be at least 8 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      showMsg("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTab("view");
    } catch (e) {
      showMsg(e.message || "Failed to change password.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p style={{ padding: "2rem" }}>Loading profile...</p>;

  const initial = user.username?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>

      {/* Avatar card */}
      <div className={styles.card}>
        <div 
          className={styles.avatarWrap} 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.avatar}>
            {user?.profilePicture ? (
              <img
                src={`${API_URL}${user.profilePicture}`}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              initial
            )}
          </div>
          <div className={styles.avatarOverlay}>
            {uploading ? "Uploading..." : "Change Photo"}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const storedUser = JSON.parse(localStorage.getItem("user"));
            const token = storedUser?.access_token;

            const formData = new FormData();
            formData.append("file", file);

            setUploading(true);
            try {
              const res = await fetch(`${API_URL}/users/me/profile-picture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              });

              if (!res.ok) throw new Error("Upload failed");

              const updated = await res.json();
              setUser(updated);
              localStorage.setItem(
                "user",
                JSON.stringify({ ...updated, access_token: token })
              );
              showMsg("Profile picture updated successfully!");
            } catch (err) {
              console.error("Upload error:", err);
              showMsg("Failed to upload profile picture.", "error");
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
        />
        <div className={styles.cardInfo}>
          <h2 className={styles.name}>{user.firstName} {user.lastName}</h2>
          <p className={styles.sub}>@{user.username} &nbsp;·&nbsp;
            <span className={styles.roleBadge}>{user.role}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {["view", "edit", "password"].map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.activeTab : ""}`}
            onClick={() => { setTab(t); setMsg({ text: "", type: "" }); }}
          >
            {t === "view" ? "View Profile" : t === "edit" ? "Edit Profile" : "Change Password"}
          </button>
        ))}
      </div>

      {msg.text && (
        <p className={msg.type === "error" ? styles.errorMsg : styles.successMsg}>{msg.text}</p>
      )}

      {/* View Tab */}
      {tab === "view" && (
        <div className={styles.infoCard}>
          {[
            ["Username", user.username],
            ["First Name", user.firstName],
            ["Last Name", user.lastName],
            ["Email", user.email],
            ["Phone", user.phone || "—"],
            ["Role", user.role],
            ["Member Since", new Date(user.createdAt).toLocaleDateString()],
            ["Last Active", user.lastActive ? new Date(user.lastActive).toLocaleString() : "—"],
          ].map(([label, value]) => (
            <div className={styles.infoRow} key={label}>
              <span className={styles.infoLabel}>{label}</span>
              <span className={styles.infoValue}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Tab */}
      {tab === "edit" && (
        <div className={styles.formCard}>
          {[
            { name: "username", label: "Username" },
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            { name: "email", label: "Email" },
            { name: "phone", label: "Phone" },
          ].map(({ name, label }) => (
            <div className={styles.formGroup} key={name}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              />
            </div>
          ))}
          <button className={styles.saveBtn} onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {tab === "password" && (
        <div className={styles.formCard}>
          {[
            { name: "currentPassword", label: "Current Password" },
            { name: "newPassword", label: "New Password" },
            { name: "confirmPassword", label: "Confirm New Password" },
          ].map(({ name, label }) => (
            <div className={styles.formGroup} key={name}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                type="password"
                value={pwForm[name]}
                onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
              />
            </div>
          ))}
          <button className={styles.saveBtn} onClick={changePassword} disabled={saving}>
            {saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      )}
    </div>
  );
}
