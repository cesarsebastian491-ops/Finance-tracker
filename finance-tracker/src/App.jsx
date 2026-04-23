import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/registerPage";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/protectedRoute";
import "./theme.css";
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"></link>

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// USER
import UserLayout from "./pages/users/UserLayout";
import ExpenseDBoard from "./pages/users/Expense/expenseDBoard";
import OverviewDBoard from "./pages/users/Overview/overviewDBoard";
import IncomeDBoard from "./pages/users/Income/incomeDBoard";
import TransactionDBoard from "./pages/users/Transaction/transactionDBoard";
import LogsDBoard from "./pages/users/logsPage/LogPage";
import ViewProfile from "./pages/users/profile/viewProfile";
import EditProfile from "./pages/users/profile/editProfile";
import PasswordChange from "./pages/users/profile/PasswordChange";

// STAFF
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/pages/Dashboard/StaffDashboard";
import StaffTransactionPage from "./pages/staff/pages/Transaction/staffTransactionPage";
import StaffLogs from "./pages/staff/pages/LogsPage/LogPage";
import StaffUsers from "./pages/staff/pages/user/UsersManagementPage";
import StaffProfile from "./pages/staff/pages/Profile/ProfilePage";

// ADMIN
import AdminDashboard from "./pages/admin/dashboard/AdminDashBoard";
import AdminLayout from "./pages/admin/SideBar/AdminLayout";
import ManagementPage from "./pages/admin/management/ManagementPage";
import Systempage from "./pages/admin/system/SystemPage";
import AdminAnalytics from "./pages/admin/analytics/analyticsPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* USER ROUTES */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<OverviewDBoard />} />
          <Route path="expense" element={<ExpenseDBoard />} />
          <Route path="income" element={<IncomeDBoard />} />
          <Route path="running-balance" element={<TransactionDBoard />} />
          <Route path="logs" element={<LogsDBoard />} />
        </Route>

        <Route
          path="/user/profile/view"
          element={
            <ProtectedRoute>
              <ViewProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile/password"
          element={
            <ProtectedRoute>
              <PasswordChange />
            </ProtectedRoute>
          }
        />
        {/* STAFF ROUTES */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffTransactionPage />} />
          <Route path="transactions/*" element={<StaffTransactionPage />} />
          <Route path="users/*" element={<StaffUsers />} />
          <Route path="logs/*" element={<StaffLogs />} />
          <Route path="profile/*" element={<StaffProfile />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="management/*" element={<ManagementPage />} />
          <Route path="system/*" element={<Systempage />} />
          <Route path="analytics/*" element={<AdminAnalytics />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;