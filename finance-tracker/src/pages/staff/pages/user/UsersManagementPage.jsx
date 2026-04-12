import { useEffect, useState } from "react";
import { API_URL } from "../../../../config";
import styles from "./UsersManagementPage.module.css";
import "../../Components/staffTheme.css";

export default function StaffUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const token = JSON.parse(localStorage.getItem("user"))?.access_token;

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users/staff/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const openDetails = (user) => {
    setSelectedUser(user);
    setShowEditModal(false);
    setSaveMsg("");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowEditModal(false);
    setSaveMsg("");
  };

  const openEdit = () => {
    setEditForm({
      username: selectedUser.username || "",
      firstName: selectedUser.firstName || "",
      lastName: selectedUser.lastName || "",
      email: selectedUser.email || "",
      phone: selectedUser.phone || "",
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/users/${selectedUser.id}/staff-edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSaveMsg("Saved successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      setSaveMsg("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Users</h1>

      <div className={styles.topBar}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.count}>{filtered.length} users</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className={styles.row} onClick={() => openDetails(u)}>
                <td>{u.username}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`role_${u.role}`]}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={u.status === "active" ? styles.activeStatus : styles.disabledStatus}>
                    {u.status === "active" ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>{u.lastActive ? new Date(u.lastActive).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedUser && !showEditModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>User Details</h3>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}><span>ID</span><strong>{selectedUser.id}</strong></div>
              <div className={styles.infoRow}><span>Username</span><strong>{selectedUser.username}</strong></div>
              <div className={styles.infoRow}><span>Full Name</span><strong>{selectedUser.firstName} {selectedUser.lastName}</strong></div>
              <div className={styles.infoRow}><span>Email</span><strong>{selectedUser.email}</strong></div>
              <div className={styles.infoRow}><span>Phone</span><strong>{selectedUser.phone || "—"}</strong></div>
              <div className={styles.infoRow}><span>Role</span><strong>{selectedUser.role}</strong></div>
              <div className={styles.infoRow}><span>Status</span>
                <strong className={selectedUser.status === "active" ? styles.activeStatus : styles.disabledStatus}>
                  {selectedUser.status}
                </strong>
              </div>
              <div className={styles.infoRow}><span>Joined</span><strong>{new Date(selectedUser.createdAt).toLocaleDateString()}</strong></div>
              <div className={styles.infoRow}><span>Last Active</span><strong>{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : "—"}</strong></div>
            </div>

            {selectedUser.role === "user" && (
              <button className={styles.editBtn} onClick={openEdit}>
                Edit Information
              </button>
            )}

            <button className={styles.closeBtn} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit User</h3>

            <div className={styles.formGrid}>
              {["username", "firstName", "lastName", "email", "phone"].map((field) => (
                <div className={styles.formGroup} key={field}>
                  <label className={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    className={styles.input}
                    value={editForm[field]}
                    onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}

            <div className={styles.modalActions}>
              <button className={styles.editBtn} onClick={saveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
