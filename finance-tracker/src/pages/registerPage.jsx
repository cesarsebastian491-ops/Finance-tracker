import { useState } from "react";
import { Link } from "react-router-dom";
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
      alert("Registered successfully!");
      window.location.href = "/";
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className={styles.registerPage}>
      
      {/* LEFT SIDE — IMAGE PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.overlayText}>
          <h2>Join the Platform</h2>
          <p>Your financial journey starts today</p>
        </div>
      </div>

      {/* RIGHT SIDE — FORM */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
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
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Password</label>
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