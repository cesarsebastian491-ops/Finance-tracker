import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditProfile.module.css";
import { API_URL } from "../../../config";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [initialForm, setInitialForm] = useState({});
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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
          const formData = {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
          };
          setForm(formData);
          setInitialForm(formData);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fallback to localStorage
        setUser(stored);
        const formData = {
          firstName: stored.firstName || "",
          lastName: stored.lastName || "",
          username: stored.username || "",
          email: stored.email || "",
          phone: stored.phone || "",
        };
        setForm(formData);
        setInitialForm(formData);
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
        key => form[key] !== initialForm[key]
      );

      if (!hasChanges) {
        alert("No changes to save");
        return;
      }

      const payload = {};
      ["firstName", "lastName", "username", "phone"].forEach(key => {
        if (form[key] !== initialForm[key]) payload[key] = form[key];
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
          <div className={styles.epAvatarWrap} onClick={() => fileInputRef.current?.click()}>
            <div className={styles.epAvatar}>
              {user?.profilePicture ? (
                <img
                  src={`${API_URL}${user.profilePicture}`}
                  alt="Profile"
                  className={styles.epAvatarImg}
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className={styles.epAvatarOverlay}>
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
              } catch (err) {
                console.error("Upload error:", err);
                alert("Failed to upload profile picture");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />

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