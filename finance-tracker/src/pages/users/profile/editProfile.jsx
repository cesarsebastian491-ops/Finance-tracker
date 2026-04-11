import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditProfile.module.css";
import { API_URL } from "../../../config";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (!stored?.access_token) return;

      try {
        const res = await fetch(`${API_URL}/users/${stored.id}`, {
          headers: { Authorization: `Bearer ${stored.access_token}` },
        });
        const data = await res.json();
        if (data) {
          setUser(data);
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fallback to localStorage
        setUser(stored);
        setForm({
          firstName: stored.firstName || "",
          lastName: stored.lastName || "",
          username: stored.username || "",
          email: stored.email || "",
          phone: stored.phone || "",
        });
      }
    };

    fetchUserProfile();
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.access_token;

      const hasChanges = Object.keys(form).some(
        key => form[key] !== user[key]
      );

      if (!hasChanges) {
        alert("No changes to save");
        return;
      }

      const payload = {};
      ["firstName", "lastName", "username", "phone"].forEach(key => {
        if (form[key] !== user[key]) payload[key] = form[key];
      });

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const updated = await response.json();

      localStorage.setItem(
        "user",
        JSON.stringify({
        ...updated, 
          access_token: token,
        })
      );

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate("/user/profile/view", { replace: true });
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {showToast && (
        <div className={styles.successOverlay}>
          <div className={styles.successBox}>
            <p>Profile updated successfully!</p>
          </div>
        </div>
      )}

      <div className={styles.epContainer}>
        <button className={styles.epBackBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={styles.epCard}>
          <div className={styles.epAvatar}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>

          <h2 className={styles.epTitle}>Edit Profile</h2>

          <div className={styles.epForm}>
            <label>First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />

            <label>Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />

            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              name="email"
              value={form.email}
              disabled
            />

            <label>Phone</label>
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
            />
          </div>

          <button className={styles.epSaveBtn} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}