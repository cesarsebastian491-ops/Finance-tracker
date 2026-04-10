import { useEffect, useState } from "react";
import styles from "./users.module.css";
import { API_URL } from "../../../../config";

export default function UsersAnalyticsPage() {
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalUsers, setModalUsers] = useState([]);
    const [data, setData] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${API_URL}/analytics/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => setData(data));
    }, []);

    if (!data) return <p>Loading user analytics...</p>;

    return (

        <>
            <div className={styles.container}>
                <h2 className={styles.title}>Users Analytics</h2>

                <div className={styles.grid}>
                    <Card
                        label="Total Users"
                        value={data.totalUsers}
                        onClick={() => {
                            setModalTitle("All Users");
                            setModalUsers(data.allUsers); // backend must return this
                            setShowModal(true);
                        }}
                    />
                    <Card label="New Users (7 days)" value={data.newUsers} />
                    <Card
                        label="Active Users (Online Now)"
                        value={data.activeUsers}
                        onClick={() => {
                            setModalTitle("Active Users");
                            setModalUsers(data.activeUsersList); // backend must return this
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
                <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                        <h2>{modalTitle}</h2>

                        <div className={styles.userList}>
                            {modalUsers.length === 0 && <p>No users found.</p>}

                            {modalUsers.map((u) => (
                                <div key={u.id} className={styles.userRow}>
                                    <span>{u.firstName} {u.lastName}</span>
                                    <span>{u.email}</span>
                                    <span>{u.role}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalFooter}>
                            <p className={styles.note}>
                                For full control, visit the User Management Page.
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

function Card({ label, value, onClick }) {
    return (
        <div className={styles.card} onClick={onClick}>
            <h4>{label}</h4>
            <p>{value}</p>
        </div>
    );
} 
