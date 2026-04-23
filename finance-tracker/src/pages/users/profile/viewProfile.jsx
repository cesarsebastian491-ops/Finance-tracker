import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import styles from "./ViewProfile.module.css";
import { API_URL } from "../../../config";

export default function ViewProfile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const stored = JSON.parse(localStorage.getItem("user"));
            if (!stored?.access_token) return;

            try {
                const res = await fetch(`${API_URL}/users/${stored.id}`, {
                    headers: { Authorization: `Bearer ${stored.access_token}` },
                });
                const data = await res.json();
                if (data) setUser(data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setUser(stored); // Fallback to localStorage
            }
        };

        fetchUserProfile();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div className={styles.vpContainer}>
            <button className={styles.vpBackBtn} onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div className={styles.vpCard}>
                <div className={styles.vpAvatar}>
                    {user?.profilePicture ? (
                        <img
                            src={`${API_URL}${user.profilePicture}`}
                            alt="Profile"
                            className={styles.vpAvatarImg}
                        />
                    ) : (
                        user?.username?.charAt(0)?.toUpperCase()
                    )}
                </div>

                <h2 className={styles.vpName}>
                    {user.firstName} {user.lastName}
                </h2>

                <p className={styles.vpUsername}>@{user.username}</p>

                <div className={styles.vpInfo}>
                    <div className={styles.vpRow}>
                        <label>Email</label>
                        <p>{user.email}</p>
                    </div>

                    <div className={styles.vpRow}>
                        <label>Phone</label>
                        <p>{user.phone || "Not set"}</p>
                    </div>

                    <div className={styles.vpRow}>
                        <label>Account Created</label>
                        <p>{user.createdAt?.slice(0, 10) || "—"}</p>
                    </div>
                </div>

                <NavLink to="/user/profile/edit" className={styles.vpEditBtn}>
                    Edit Profile
                </NavLink>
            </div>
        </div>
    );
}