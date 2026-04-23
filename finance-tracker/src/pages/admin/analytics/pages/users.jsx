import { useEffect, useState } from "react";
import styles from "./users.module.css";
import { API_URL } from "../../../../config";

export default function UsersAnalyticsPage() {
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalUsers, setModalUsers] = useState([]);
    const [filteredModalUsers, setFilteredModalUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalType, setModalType] = useState(""); // "allUsers" or "activeUsers"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const stored = JSON.parse(localStorage.getItem("user"));
    const token = stored?.access_token;

    useEffect(() => {
        if (!token) {
            setError("Authentication required. Please log in again.");
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/analytics/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setData(data);
                setError(null);
            })
            .catch(err => {
                console.error("Failed to fetch user analytics:", err);
                setError(`Failed to load analytics: ${err.message}`);
            })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        const filtered = modalUsers.filter(u => {
            const searchLower = searchTerm.toLowerCase();
            if (modalType === "allUsers") {
                return `${u.firstName} ${u.lastName} ${u.id}`.toLowerCase().includes(searchLower);
            }
            return `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase().includes(searchLower);
        });
        setFilteredModalUsers(filtered);
    }, [searchTerm, modalUsers, modalType]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Loading user analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <p>❌ {error}</p>
                </div>
            </div>
        );
    }

    if (!data) return <p>No data available</p>;

    return (

        <>
            <div className={styles.container}>
                <h2 className={styles.title}>Users Analytics</h2>

                <div className={styles.grid}>
                    <Card
                        label="Total Users"
                        value={data.totalUsers}
                        icon="👥"
                        color="#3b82f6"
                        onClick={() => {
                            setModalTitle("All Users");
                            setModalUsers(data.allUsers || []);
                            setModalType("allUsers");
                            setSearchTerm("");
                            setShowModal(true);
                        }}
                    />
                    <Card
                        label="New Users (7 days)"
                        value={data.newUsers}
                        icon="🆕"
                        color="#10b981"
                    />
                    <Card
                        label="Active Users (Online Now)"
                        value={data.activeUsers}
                        icon="🟢"
                        color="#8b5cf6"
                        onClick={() => {
                            setModalTitle("Active Users");
                            setModalUsers(data.activeUsersList || []);
                            setModalType("activeUsers");
                            setSearchTerm("");
                            setShowModal(true);
                        }}
                    />
                </div>

                <h3 className={styles.subtitle}>Users by Role</h3>
                <div className={styles.grid}>
                    {data.usersByRole.map((r, i) => (
                        <Card key={i} label={r.role} value={r.count} />
                    ))}
                </div>

                <h3 className={styles.subtitle}>Users by Status</h3>
                <div className={styles.grid}>
                    {data.usersByStatus.map((s, i) => (
                        <Card key={i} label={s.status} value={s.count} />
                    ))}
                </div>

            </div>
            {showModal && (
                <div className={styles.modalBackdrop} onClick={() => {
                    setShowModal(false);
                    setSearchTerm("");
                    setModalType("");
                }}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalTitle}</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => {
                                    setShowModal(false);
                                    setSearchTerm("");
                                    setModalType("");
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder={modalType === "allUsers" ? "Search by name or ID..." : "Search by name, email, or role..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>

                        <div className={styles.userList}>
                            {filteredModalUsers.length === 0 && (
                                <p className={styles.emptyState}>No users found.</p>
                            )}

                            {filteredModalUsers.map((u) => (
                                <div key={u.id} className={styles.userRow}>
                                    {modalType === "allUsers" ? (
                                        // Simple view: Name, ID, and Role
                                        <div className={styles.userInfoSimple}>
                                            <div className={styles.userNameWithRole}>
                                                <div className={styles.userName}>{u.firstName} {u.lastName}</div>
                                                <span className={`${styles.badge} ${styles[`badge-${u.role?.toLowerCase()}`]}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                            <div className={styles.userId}>ID: {u.id}</div>
                                        </div>
                                    ) : (
                                        // Detailed view: Name, Email, and Badges
                                        <>
                                            <div className={styles.userInfo}>
                                                <div className={styles.userName}>
                                                    {u.firstName} {u.lastName}
                                                </div>
                                                <div className={styles.userEmail}>{u.email}</div>
                                            </div>
                                            <div className={styles.userBadges}>
                                                <span className={`${styles.badge} ${styles[`badge-${u.role?.toLowerCase()}`]}`}>
                                                    {u.role}
                                                </span>
                                                {u.status && (
                                                    <span className={`${styles.badge} ${styles[`status-${u.status?.toLowerCase()}`]}`}>
                                                        {u.status}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalFooter}>
                            <p className={styles.note}>
                                Showing {filteredModalUsers.length} of {modalUsers.length} users
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

function Card({ label, value, onClick, icon, color }) {
    const cardStyle = color ? { borderLeft: `4px solid ${color}` } : {};
    return (
        <div
            className={`${styles.card} ${onClick ? styles.clickable : ""}`}
            onClick={onClick}
            style={cardStyle}
        >
            {icon && <div className={styles.cardIcon}>{icon}</div>}
            <h4>{label}</h4>
            <p className={styles.cardValue}>{value}</p>
        </div>
    );
} 
