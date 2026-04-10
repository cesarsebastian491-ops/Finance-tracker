import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PasswordChange.module.css";
import { API_URL } from "../../../config";

export default function PasswordChange() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.access_token;

      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      };

      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to change password");
        return;
      }

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate("/user/profile/view", { replace: true });
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      {showToast && (
        <div className={styles.successOverlay}>
          <div className={styles.successBox}>
            <p>Password updated successfully!</p>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={styles.card}>
          <div className={styles.avatar}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>

          <h2 className={styles.title}>Change Password</h2>

          <div className={styles.form}>
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
            />

            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>
            Update Password
          </button>
        </div>
      </div>
    </>
  );
}