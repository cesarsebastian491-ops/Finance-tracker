import { useState } from "react";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      setIsExiting(true);
      setTimeout(() => {
        alert("Registered successfully!");
        navigate("/", { replace: true });
      }, 600);
    } else {
      alert("Registration failed");
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
            </div>

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