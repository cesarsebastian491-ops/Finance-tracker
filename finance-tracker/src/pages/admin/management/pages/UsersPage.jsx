import styles from "./UsersPage.module.css";
import { API_URL } from "../../../../config";
import { useState } from "react";

export default function UsersPage({ users, refreshUsers }) {
    console.log(users);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const openDetails = (user) => setSelectedUser(user);
    const closeDetails = () => {
        setSelectedUser(null);
        setShowRoleModal(false);
    };

    const filteredUsers = users.filter((u) => {
        const term = search.toLowerCase();
        return (
            u.email?.toLowerCase().includes(term) ||
            u.name?.toLowerCase().includes(term) ||
            u.role?.toLowerCase().includes(term)
        );
    });

    const updateRole = async (newRole) => {
        try {
            const stored = JSON.parse(localStorage.getItem("user"));
            const token = stored?.access_token;

            const res = await fetch(`${API_URL}/users/${selectedUser.id}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,   // ✅ REQUIRED
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error("Failed to update role");

            const updated = await res.json();

            setShowRoleModal(false);
            setSelectedUser(null);

            refreshUsers(); // refresh table

        } catch (err) {
            console.error(err);
        }
    };
    const saveUserInfo = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const token = storedUser?.access_token;

            const res = await fetch(`${API_URL}/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: selectedUser.username,
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    email: selectedUser.email,
                    phone: selectedUser.phone,
                }),
            });

            if (!res.ok) throw new Error("Failed to update user");

            setShowEditModal(false);
            setSelectedUser(null);
            refreshUsers();
        } catch (err) {
            console.error(err);
        }
    };
    const toggleStatus = async () => {
        try {
            const stored = JSON.parse(localStorage.getItem("user"));
            const token = stored?.access_token;

            const newStatus =
                selectedUser.status === "active" ? "disabled" : "active";

            const res = await fetch(`${API_URL}/users/${selectedUser.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            setShowRoleModal(false);
            setSelectedUser(null);
            refreshUsers();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>User Management</h2>

            <div className={styles.topBar}>
                <input
                    type="text"
                    placeholder="Search users..."
                    className={styles.search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>

                    </tr>
                </thead>

                <tbody>
                    {filteredUsers.map((u) => (
                        <tr
                            key={u.id}
                            onClick={() => openDetails(u)}
                            className={styles.row}
                        >
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td className={u.status === "active" ? styles.active : styles.disabled}>
                                {u.status === "active" ? "Active" : "Disabled"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedUser && (
                <div className={styles.modalOverlay} onClick={closeDetails}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>User Information</h3>

                        <div className={styles.modalContent}>
                            <div className={styles.infoRow}>
                                <span>ID</span>
                                <h5>{selectedUser.id}</h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>username</span>
                                <h5>{selectedUser.username}</h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>full name</span>
                                <h5>{selectedUser.firstName} {selectedUser.lastName}</h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>Email</span>
                                <h5>{selectedUser.email}</h5>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Phone</span>
                                <h5>{selectedUser.phone}</h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>Role</span>
                                <h5>{selectedUser.role}</h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>Status</span>
                                <h5 className={selectedUser.active ? styles.active : styles.disabled}>
                                    {selectedUser.status === "active" ? "Disable User" : "Enable User"}
                                </h5>
                            </div>

                            <div className={styles.infoRow}>
                                <span>Created</span>
                                <h5>{new Date(selectedUser.createdAt).toLocaleString()}</h5>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.editBtn}
                                onClick={() => setShowEditModal(true)}
                            >
                                Edit Information
                            </button>

                            <button
                                className={styles.roleBtn}
                                onClick={() => setShowRoleModal(true)}
                            >
                                Change Role
                            </button>

                            <button
                                className={styles.toggleBtn}
                                onClick={toggleStatus}
                            >
                                {selectedUser.status === "active" ? "Disable User" : "Enable User"}
                            </button>

                        </div>

                        <button className={styles.closeBtn} onClick={closeDetails}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showRoleModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setShowRoleModal(false);
                        setSelectedUser(null);
                    }}
                >
                    <div className={styles.smallModal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Change Role</h3>

                        <div className={styles.roleOptions}>
                            <button
                                className={`${styles.roleOptionBtn} ${styles.roleAdmin}`}
                                onClick={() => updateRole("admin")}
                            >
                                Admin
                            </button>

                            <button
                                className={`${styles.roleOptionBtn} ${styles.roleStaff}`}
                                onClick={() => updateRole("staff")}
                            >
                                Staff
                            </button>

                            <button
                                className={`${styles.roleOptionBtn} ${styles.roleUser}`}
                                onClick={() => updateRole("user")}
                            >
                                User
                            </button>
                        </div>

                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowRoleModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className={styles.smallModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>Edit User Information</h3>

                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                type="text"
                                value={selectedUser.username}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, username: e.target.value })
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input
                                type="text"
                                value={selectedUser.firstName}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, firstName: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={selectedUser.lastName}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, lastName: e.target.value })
                                }
                            />
                        </div>


                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={selectedUser.email}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, email: e.target.value })
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={selectedUser.phone}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                                }
                            />
                        </div>

                        <button className={styles.saveBtn} onClick={saveUserInfo}>
                            Save Changes
                        </button>

                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}