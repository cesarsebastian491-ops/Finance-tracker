import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { API_URL } from "../config";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [isExiting, setIsExiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaId, setCaptchaId] = useState("");
  const [captchaDisplay, setCaptchaDisplay] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const navigate = useNavigate();

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
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("one special character");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!captchaInput) {
      setCaptchaError("Please enter the CAPTCHA code.");
      return;
    }

    if (captchaInput !== captchaDisplay) {
      setCaptchaError("Incorrect CAPTCHA code. Please try again.");
      await loadCaptcha();
      return;
    }

    setCaptchaError("");

    // Validate password
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setErrors({ password: `Password must contain ${passwordErrors.join(', ')}` });
      return;
    }

    const payload = { ...form, captchaId, captchaCode: captchaInput };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        await loadCaptcha();
        alert(error.message || "Registration failed");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setIsExiting(true);
        setTimeout(() => {
          alert("Registered successfully!");
          navigate("/", { replace: true });
        }, 600);
      } else {
        await loadCaptcha();
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      await loadCaptcha();
      alert("Network error during registration. Please try again.");
    }
  };

  return (
    <div className={`${styles.registerPage} ${isExiting ? styles.exitRight : ""}`}>
      
      {/* LEFT SIDE — IMAGE PANEL */}
      <div className={`${styles.leftPanel} ${isExiting ? styles.exitLeft : ""}`}>
        <div className={styles.overlayText}>
          <h2>Join the Platform</h2>
          <p>Your financial journey starts today</p>
        </div>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className={styles.rightPanel}>
        <div className={`${styles.card} ${styles.fadeIn}`}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join us and start tracking</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>First Name</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Last Name</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Phone Number</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Username</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Email</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Password</label>
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>
            {!errors.password && (
              <p className={styles.passwordHint}>
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}

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

            <button type="submit" className={styles.registerBtn}>
              Register →
            </button>
          </form>

          <div className={styles.loginSection}>
            <p>Already have an account?</p>
            <Link to="/" className={styles.loginLink}>
              Login
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}