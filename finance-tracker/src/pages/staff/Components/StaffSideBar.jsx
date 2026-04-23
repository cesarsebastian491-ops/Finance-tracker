import { NavLink } from "react-router-dom";
import styles from "./staffSidebar.module.css";
import "./staffTheme.css";

export default function StaffSidebar() {
    return (
        <div className={styles.sidebar}>
            <h2 className={styles.logo}>Staff</h2>

            <nav className={styles.nav}>
                <NavLink
                    to="/staff"
                    end
                    className={({ isActive }) => (isActive ? styles.active : "")}
                >
                    <i className="ri-exchange-dollar-line"></i>
                    Transactions
                </NavLink>

                <NavLink
                    to="/staff/users"
                    className={({ isActive }) => (isActive ? styles.active : "")}
                >
                    <i className="ri-user-3-line"></i>
                    Users
                </NavLink>

                <NavLink
                    to="/staff/logs"
                    className={({ isActive }) => (isActive ? styles.active : "")}
                >
                    <i className="ri-file-list-3-line"></i>
                    Logs
                </NavLink>

                <NavLink
                    to="/staff/profile"
                    className={({ isActive }) => (isActive ? styles.active : "")}
                >
                    <i className="ri-user-settings-line"></i>
                    Profile
                </NavLink>
            </nav>

            {/* Logout at the bottom */}
            <button
                className={styles.logoutBtn}
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                }}
            >
                <i className="ri-logout-box-r-line"></i>
                Logout
            </button>
        </div>
    );
}