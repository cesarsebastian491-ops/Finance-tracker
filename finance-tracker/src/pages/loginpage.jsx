import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css"; // NEW
import { API_URL } from "../config";

export default function Login() {
    const [step, setStep] = useState("login");
    const [tempUserId, setTempUserId] = useState(null);
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) return;

        const user = JSON.parse(stored);

        if (user.role === "admin") navigate("/admin", { replace: true });
        else if (user.role === "staff") navigate("/staff", { replace: true });
        else navigate("/user/dashboard", { replace: true });
    }, []);

    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (data.requires2FA) {
            setTempUserId(data.userId);
            setStep("2fa");
            return;
        }

        if (data.success && data.user && data.access_token) {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...data.user,
                    access_token: data.access_token,
                    sessionId: data.sessionId,
                })
            );

            if (data.user.role === "admin") navigate("/admin");
            else if (data.user.role === "staff") navigate("/staff");
            else navigate("/user/dashboard");
        } else {
            localStorage.removeItem("user");
            alert("Invalid email or password");
        }
    };

    const handle2FAVerify = async () => {
        const res = await fetch(`${API_URL}/auth/2fa/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: tempUserId, code }),
        });

        const data = await res.json();

        if (!data.success) {
            alert("Invalid 2FA code");
            return;
        }

        localStorage.setItem(
            "user",
            JSON.stringify({
                ...data.user,
                access_token: data.access_token,
            })
        );

        if (data.user.role === "admin") navigate("/admin");
        else if (data.user.role === "staff") navigate("/staff");
        else navigate("/user/dashboard");
    };

    return (
        <div className={styles.loginPage}>
            {/* LEFT SIDE — LOGIN CARD */}
            <div className={styles.leftPanel}>
                <div className={styles.card}>

                    {step === "login" && (
                        <>
                            <h1 className={styles.title}>Welcome back.</h1>
                            <p className={styles.subtitle}>
                                Enter your credentials to access your dashboard.
                            </p>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.inputGroup}>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder=" " /* keep placeholder blank for CSS trigger */
                                    />
                                    <label>Email Address</label>
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Password</label>
                                </div>

                                <div className={styles.rowBetween}>
                                    <label className={styles.remember}>
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <button type="button" className={styles.linkBtn}>
                                        Forgot Password
                                    </button>
                                </div>

                                <button type="submit" className={styles.loginBtn}>
                                    Login →
                                </button>
                            </form>

                            <div className={styles.registerSection}>
                                <p>Don’t have an account?</p>
                                <Link to="/register" className={styles.registerLink}>
                                    Create one
                                </Link>
                            </div>
                        </>
                    )}

                    {step === "2fa" && (
                        <>
                            <h1 className={styles.title}>Two‑Factor Authentication</h1>
                            <p className={styles.subtitle}>Enter the 6‑digit code</p>

                            <input
                                type="text"
                                maxLength={6}
                                className={styles.twofaInput}
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />

                            <button className={styles.loginBtn} onClick={handle2FAVerify}>
                                Verify Code
                            </button>

                            <button className={styles.backBtn} onClick={() => setStep("login")}>
                                Back
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* RIGHT SIDE — IMAGE PANEL */}
            <div className={styles.rightPanel}>
                <div className={styles.overlayText}>
                    <h2>VAULT</h2>
                    <p>Track Smarter. Live Better.</p>
                </div>
            </div>
        </div>
    );
}