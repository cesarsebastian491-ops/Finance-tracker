import { Routes, Route, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../../../config";
import ManagementDashboard from "./pages/ManagementDashboard";
import "./pages/ManagementPage.css";
import UsersPage from "./pages/UsersPage";
import TransactionsPage from "./pages/TransactionsPage";
import LogsPage from "./pages/LogsPage";
import ExpenseDBoard from "../../users/Expense/expenseDBoard";
import IncomeDBoard from "../../users/Income/incomeDBoard";
import RunningBalancePage from "../../users/Transaction/transactionDBoard";

// import UsersPage from "./pages/UsersPage";
// import CategoriesPage from "./pages/CategoriesPage";
// import IncomePage from "./pages/IncomePage";
// import ExpensePage from "./pages/ExpensePage";


export default function ManagementPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalLogs: 0,
    totalTransactions: 0,
  });

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchManagementData();
  }, []);

  const fetchManagementData = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      const token = stored?.access_token;

      const res = await fetch(`${API_URL}/admin/management-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      const data = await res.json();

      // Summary stats
      setStats({
        totalUsers: data.totalUsers || 0,
        totalCategories: data.totalCategories || 0,
        totalIncomeTransactions: data.totalIncomeTransactions || 0,
        totalExpenseTransactions: data.totalExpenseTransactions || 0,
        totalLogs: data.totalLogs || 0,
        totalTransactions: data.totalTransactions || 0,
      });
      // Full data
      setUsers(data.users || []);
      setCategories(data.categories || []);
      setIncome(data.income || []);
      setExpense(data.expense || []);
      setLogs(data.logs || []);
      setTransactions(data.transactions || []);

      // 2. Fetch users
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData);


    } catch (err) {
      console.error("Failed to load management data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading management dashboard...</p>;

  return (
    <div className="admin-page">
      <h1>Management</h1>

      <div className="management-tabs">
        <NavLink to="/admin/management" end>Dashboard</NavLink>
        <NavLink to="/admin/management/users">Users</NavLink>
        <NavLink to="/admin/management/transactions">Transactions</NavLink>
        <NavLink to="/admin/management/expense">Expense</NavLink>
        <NavLink to="/admin/management/income">Income</NavLink>
        <NavLink to="/admin/management/running-balance">Running Balance</NavLink>
        <NavLink to="/admin/management/logs">Logs</NavLink>

      </div>

      <div className="management-content">
        <Routes>
          <Route
            index
            element={
              <ManagementDashboard
                stats={stats}
                users={users}
                categories={categories}
                income={income}
                expense={expense}
                logs={logs}
                transactions={transactions}
              />
            }
          />

          <Route
            path="users"
            element={
              <UsersPage
                users={users}
                refreshUsers={fetchManagementData}
              />
            }
          />
          <Route
            path="transactions"
            element={
              <TransactionsPage
                transactions={transactions}
                refreshTransactions={fetchManagementData}
              />
            }
          />
          <Route path="logs" element={<LogsPage logs={logs} />} />
          <Route path="expense" element={<ExpenseDBoard role="staff" />} />
          <Route path="income" element={<IncomeDBoard role="staff" />} />
          <Route path="running-balance" element={<RunningBalancePage role="staff" />} />


          {/* 
  <Route path="categories" element={<CategoriesPage categories={categories} />} />
  <Route path="income" element={<IncomePage income={income} />} />
  <Route path="expense" element={<ExpensePage expense={expense} />} />
  <Route path="logs" element={<LogsPage logs={logs} />} />

  */}
        </Routes>
      </div>
    </div>
  );
}