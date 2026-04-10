// src/pages/users/UserLayout.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAppName } from "../../components/hooks/UseAppName";
import { API_URL } from "../../config";

export default function UserLayout() {
    const [open, setOpen] = useState(true);
    const [showProfile, setShowProfile] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.access_token;

    const appName = useAppName(API_URL, token);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.access_token;
        if (!token) return;

        const interval = setInterval(() => {
            fetch(`${API_URL}/auth/ping`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">

            {/* TOPBAR */}
            <div className="topbar">
                <div className="topbar-left">
                    <button className="hamburger" onClick={() => setOpen(!open)}>
                        ☰
                    </button>

                    <div className="logo">{appName}</div>
                    <div className="welcome">
                        welcome back! <b>{user.firstName}</b>
                    </div>
                </div>

                <div className="topbar-right">
                    <button
                        className="profile-avatar"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        {user?.username?.charAt(0)?.toUpperCase()}
                    </button>
                </div>

                {showProfile && (
                    <>
                        <div
                            className="profile-backdrop"
                            onClick={() => setShowProfile(false)}
                        ></div>

                        <div className="profile-popup">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {user?.username?.charAt(0)?.toUpperCase()}
                                </div>

                                <div>
                                    <h3>
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <NavLink to="/user/profile/view" className="profile-action-btn">
                                    View Profile
                                </NavLink>

                                <NavLink
                                    to="/user/profile/password"
                                    className="profile-action-btn"
                                    onClick={() => setShowProfile(false)}
                                >
                                    Change Password
                                </NavLink>

                                <button
                                    className="profile-action-btn"
                                    onClick={() => {
                                        localStorage.removeItem("user");
                                        window.location.href = "/";
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* SIDEBAR */}
            <aside className={`sidebar ${open ? "open" : ""}`}>
                <nav className={`menu ${open ? "open" : ""}`}>
                    <center>
                        <h3>menu</h3>
                    </center>

                    <NavLink to="/user/dashboard" className="nav-item">
                        Overview
                    </NavLink>
                    <NavLink to="/user/expense" className="nav-item">
                        Expense
                    </NavLink>
                    <NavLink to="/user/income" className="nav-item">
                        Revenue
                    </NavLink>
                    <NavLink to="/user/running-balance" className="nav-item">
                        Running Balance
                    </NavLink>
                    {/* <NavLink to="/user/report" className="nav-item">
                        Report
                    </NavLink> */}
                    <NavLink to="/user/logs" className="nav-item">
                        Activity Log
                    </NavLink>
                </nav>
            </aside>

            {open && <div className="backdrop" onClick={() => setOpen(false)}></div>}

            {/* ⭐ THIS IS WHERE YOUR PAGE CONTENT SHOWS ⭐ */}
            <Outlet />

        </div>
    );
}