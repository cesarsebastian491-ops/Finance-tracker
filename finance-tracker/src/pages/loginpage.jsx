import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css"; // NEW
import { API_URL } from "../config";

export default function Login() {
    const [step, setStep] = useState("login");
    const [tempUserId, setTempUserId] = useState(null);
    const [code, setCode] = useState("");
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored) return;

            const user = JSON.parse(stored);

            if (user.role === "admin") navigate("/admin", { replace: true });
            else if (user.role === "staff") navigate("/staff", { replace: true });
            else navigate("/user/dashboard", { replace: true });
        } catch (e) {
            console.error("Corrupted user data in localStorage", e);
            localStorage.removeItem("user");
        }
    }, []);

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [show2FACode, setShow2FACode] = useState(false);
    const [captchaId, setCaptchaId] = useState("");
    const [captchaCode, setCaptchaCode] = useState("");
    const [captchaDisplay, setCaptchaDisplay] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    const loadCaptcha = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/auth/captcha`);
            const data = await res.json();
            setCaptchaId(data.captchaId);
            setCaptchaDisplay(data.captchaCode);
            setCaptchaInput("");
            setCaptchaError("");
        } catch {
            setCaptchaError("Failed to load CAPTCHA");
        }
    }, []);

    useEffect(() => {
        loadCaptcha();
    }, [loadCaptcha]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaInput) {
            setCaptchaError("Please enter the CAPTCHA code.");
            return;
        }

        if (!captchaId) {
            setCaptchaError("CAPTCHA not loaded. Please refresh.");
            await loadCaptcha();
            return;
        }

        setCaptchaError("");

        const payload = { ...form, captchaId, captchaCode: captchaInput };

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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

                setIsExiting(true);
                setTimeout(() => {
                    if (data.user.role === "admin") navigate("/admin");
                    else if (data.user.role === "staff") navigate("/staff");
                    else navigate("/user/dashboard");
                }, 600);
            } else {
                localStorage.removeItem("user");
                await loadCaptcha();
                setCaptchaError("");
                alert(data.message || "Invalid email or password");
            }
        } catch (err) {
            await loadCaptcha();
            alert("Connection error. Please check the server and try again.");
        }
    };

    const handle2FAVerify = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/2fa/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: tempUserId, code }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.message || "Invalid 2FA code");
                return;
            }

            const data = await res.json();

            if (!data.success || !data.user || !data.access_token) {
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

            setIsExiting(true);
            setTimeout(() => {
                if (data.user.role === "admin") navigate("/admin");
                else if (data.user.role === "staff") navigate("/staff");
                else navigate("/user/dashboard");
            }, 600);
        } catch (err) {
            console.error("2FA verification error:", err);
            alert("Network error during 2FA verification. Please try again.");
        }
    };

    return (
        <div className={`${styles.loginPage} ${isExiting ? styles.exitLeft : ""}`}>
            {/* LEFT SIDE — LOGIN CARD */}
            <div className={styles.leftPanel}>
                <div className={`${styles.card} ${styles.fadeIn}`}>

                    {step === "login" && (
                        <div className={styles.stepContent}>
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
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder=" "
                                    />
                                    <label>Password</label>
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>

                                <div className={styles.rowBetween}>
                                    <label className={styles.remember}>
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <button 
                                        type="button" 
                                        className={styles.linkBtn}
                                        onClick={() => navigate("/forgot-password")}
                                    >
                                        Forgot Password
                                    </button>
                                </div>

                                <div className={styles.captchaWrap}>
                                    <div className={styles.captchaBox}>
                                        <span className={styles.captchaDigits}>{captchaDisplay}</span>
                                        <button type="button" className={styles.captchaRefresh} onClick={loadCaptcha}>↻</button>
                                    </div>
                                    <input
                                        className={styles.captchaInput}
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        value={captchaInput}
                                        onChange={(e) => {
                                            setCaptchaInput(e.target.value.replace(/\D/g, ''));
                                            setCaptchaError("");
                                        }}
                                    />
                                </div>

                                {captchaError && <p className={styles.captchaError}>{captchaError}</p>}

                                <button type="submit" className={styles.loginBtn}>
                                    Login
                                </button>
                            </form>

                            <div className={styles.registerSection}>
                                <p>Don't have an account?</p>
                                <Link to="/register" className={styles.registerLink}>
                                    Create one
                                </Link>
                            </div>
                        </div>
                    )}

                    {step === "2fa" && (
                        <div className={`${styles.stepContent} ${styles.slideIn}`}>
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
                        </div>
                    )}

                </div>
            </div>

            {/* RIGHT SIDE — IMAGE PANEL */}
            <div className={`${styles.rightPanel} ${isExiting ? styles.exitRight : ""}`}>
                <div className={styles.overlayText}>
                    <h2>VAULT</h2>
                    <p>Track Smarter. Live Better.</p>
                </div>
            </div>
        </div>
    );
}