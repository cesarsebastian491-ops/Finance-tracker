import { useEffect, useState } from "react";
import React from "react";
import { API_URL } from "../../../config";
import "./AdminDashBoard.css";

export default function AdminDashboard() {
  const [expandedUser, setExpandedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalLogs: 0,
  });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (!stored || !stored.access_token) {
        console.error("No token found");
        return;
      }

      const res = await fetch(`${API_URL}/admin/overview`, {
        headers: {
          Authorization: `Bearer ${stored.access_token}`,
        },
      });

      const data = await res.json();
      console.log("Admin overview:", data);

      if (!res.ok) {
        console.error("Error:", data);
        return;
      }

      setStats({
        totalUsers: data.totalUsers || 0,
        totalTransactions: data.totalTransactions || 0,
        totalLogs: data.totalLogs || 0,
      });

      setUsers(data.users || []);
      setTransactions(data.transactions || []);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Error fetching admin overview:", err);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <p>Loading admin dashboard...</p>;

  return (
    <>
      <div className="admin-page">
        <h1>Dashboard Overview</h1>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="summary-card">
            <h3>Total Transactions</h3>
            <p>{stats.totalTransactions}</p>
          </div>
          <div className="summary-card">
            <h3>Total Logs</h3>
            <p>{stats.totalLogs}</p>
          </div>
        </div>

        <div className="two-column top-section">
          {/* USERS */}
          <section className="admin-section half">
            <h2>Users</h2>
            <div className="table-wrapper">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <React.Fragment key={u.id}>
                      <tr
                        className="click-row"
                        onClick={() =>
                          setExpandedUser(expandedUser === u.id ? null : u.id)
                        }
                      >
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                      </tr>

                      {expandedUser === u.id && (
                        <tr className="expanded-row">
                          <td colSpan="3">
                            <div className="expanded-card">
                              <p><strong>ID:</strong> {u.id}</p>
                              <p><strong>Username:</strong> {u.username}</p>
                              <p><strong>Created:</strong> {u.createdAt}</p>
                              <p><strong>Updated:</strong> {u.updatedAt}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

            </div>
          </section>
          {/* LOGS */}
          <section className="admin-section half">
            <h2>Logs</h2>
            <div className="table-wrapper">


              <table className="clean-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Date</th>
                    <th>userID</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>{l.user ? `${l.user.firstName} ${l.user.lastName}` : "Unknown"}</td>
                      <td>{l.action}</td>
                      <td>{l.timestamp}</td>
                      <td>{l.userId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>


        <div className="two-column bottom-section">
          {/* INCOME */}
          <section className="admin-section half">
            <h2>Income transactions</h2>
            <div className="table-wrapper">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === "income")
                    .map(t => (
                      <tr key={t.id}>
                        <td>{t.user ? `${t.user.firstName} ${t.user.lastName}` : "Unknown"}</td>
                        <td>${t.amount}</td>
                        <td>{t.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* EXPENSE */}
          <section className="admin-section half">
            <h2>Expense transactions </h2>
            <div className="table-wrapper">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.type === "expense")
                    .map(t => (
                      <tr key={t.id}>
                        <td>{t.user ? `${t.user.firstName} ${t.user.lastName}` : "Unknown"}</td>
                        <td>${t.amount}</td>
                        <td>{t.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

    </>
  );
}