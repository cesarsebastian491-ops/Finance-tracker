import styles from "./UsersPage.module.css";
import { API_URL } from "../../../../config";
import "../../../../theme.css";
import { useState } from "react";

export default function UsersPage({ users, refreshUsers }) {
    console.log(users);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "user",
    });

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

    const createUser = async () => {
        try {
            const stored = JSON.parse(localStorage.getItem("user"));
            const token = stored?.access_token;

            if (!newUser.username || !newUser.email || !newUser.password) {
                alert("Username, email, and password are required");
                return;
            }

            const res = await fetch(`${API_URL}/users/admin/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create user");
            }

            alert("User created successfully!");
            setShowAddModal(false);
            setNewUser({
                username: "",
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                phone: "",
                role: "user",
            });
            refreshUsers();
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to create user");
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
                <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    + Add User
                </button>
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
                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AvatarDisplay user={u} />
                                {u.username}
                            </td>
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

            {showAddModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className={styles.smallModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>Add New User</h3>

                        <div className={styles.formGroup}>
                            <label>Username *</label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                value={newUser.username}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, username: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email *</label>
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Password *</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={newUser.password}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, password: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="Enter first name"
                                value={newUser.firstName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, firstName: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Enter last name"
                                value={newUser.lastName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, lastName: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Phone</label>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={newUser.phone}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <div className={styles.roleOptions}>
                                <button
                                    type="button"
                                    className={`${styles.roleOptionBtn} ${styles.roleAdmin} ${
                                        newUser.role === "admin" ? styles.selected : ""
                                    }`}
                                    onClick={() => setNewUser({ ...newUser, role: "admin" })}
                                >
                                    Admin
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.roleOptionBtn} ${styles.roleStaff} ${
                                        newUser.role === "staff" ? styles.selected : ""
                                    }`}
                                    onClick={() => setNewUser({ ...newUser, role: "staff" })}
                                >
                                    Staff
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.roleOptionBtn} ${styles.roleUser} ${
                                        newUser.role === "user" ? styles.selected : ""
                                    }`}
                                    onClick={() => setNewUser({ ...newUser, role: "user" })}
                                >
                                    User
                                </button>
                            </div>
                        </div>

                        <button className={styles.saveBtn} onClick={createUser}>
                            Create User
                        </button>

                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AvatarDisplay({ user }) {
    const hasProfilePic = user.avatar || user.profilePic || user.photo;
    const firstLetter = (user.username || user.email || '?')[0].toUpperCase();
    
    // Role-based colors
    const roleColors = {
        admin: '#dc2626',      // Red
        staff: '#f59e0b',      // Orange
        user: '#3b82f6',       // Blue
    };
    const bgColor = roleColors[user.role?.toLowerCase()] || '#6b7280'; // Gray fallback

    if (hasProfilePic) {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                    src={hasProfilePic}
                    alt={user.username}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${bgColor}`,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: bgColor,
                        border: '2px solid white',
                    }}
                    title={user.role}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                border: `2px solid ${bgColor}`,
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            title={`${user.username} (${user.role})`}
        >
            {firstLetter}
        </div>
    );
}