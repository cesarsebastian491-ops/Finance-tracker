// src/pages/users/UserLayout.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppName } from "../../components/hooks/UseAppName";
import { API_URL } from "../../config";

export default function UserLayout() {
    const [open, setOpen] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
    const location = useLocation();

    const token = user?.access_token;

    const appName = useAppName(API_URL, token);

    // Fetch fresh user data from API on mount and re-sync localStorage
    useEffect(() => {
        if (!token) return;
        const stored = JSON.parse(localStorage.getItem("user"));
        fetch(`${API_URL}/users/${stored?.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    const updated = { ...data, access_token: token };
                    setUser(updated);
                    localStorage.setItem("user", JSON.stringify(updated));
                }
            })
            .catch(() => { });
    }, []);

    // Re-sync user from localStorage on route change, focus, or cross-tab storage events
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored) setUser(stored);
    }, [location.pathname]);

    useEffect(() => {
        const syncUser = () => {
            const stored = JSON.parse(localStorage.getItem("user"));
            if (stored) setUser(stored);
        };

        window.addEventListener("storage", syncUser);
        window.addEventListener("focus", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("focus", syncUser);
        };
    }, []);

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
                        {user?.profilePicture ? (
                            <img
                                src={`${API_URL}${user.profilePicture}`}
                                alt="Profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            />
                        ) : (
                            user?.username?.charAt(0)?.toUpperCase()
                        )}
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
                                    {user?.profilePicture ? (
                                        <img
                                            src={`${API_URL}${user.profilePicture}`}
                                            alt="Profile"
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                        />
                                    ) : (
                                        user?.username?.charAt(0)?.toUpperCase()
                                    )}
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