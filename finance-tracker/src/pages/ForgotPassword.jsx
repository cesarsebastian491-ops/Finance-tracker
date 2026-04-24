import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotPassword.module.css";
import { API_URL } from "../config";

export default function ForgotPassword() {
  const [step, setStep] = useState("request"); // request | verify | success
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [testCode, setTestCode] = useState(""); // for testing without email
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.json();
        setError(error.message || "Failed to send reset code");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setStep("verify");
      } else {
        setError(data.message || "Failed to send reset code");
      }
    } catch (err) {
      setError("Error requesting reset");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("success");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Error resetting password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          {step === "request" && (
            <>
              <h1 className={styles.title}>Forgot Password?</h1>
              <p className={styles.subtitle}>
                Enter your email and we'll send you a reset code
              </p>

              <form onSubmit={handleRequestReset} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Email Address</label>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              <button
                className={styles.backLink}
                onClick={() => navigate("/")}
              >
                ← Back to Login
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <h1 className={styles.title}>Reset Your Password</h1>
              <p className={styles.subtitle}>
                Enter the code sent to <strong>{email}</strong>
              </p>

              <form onSubmit={handleResetPassword} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Reset Code (6 digits)</label>
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>New Password</label>
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label>Confirm Password</label>
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <button
                className={styles.backLink}
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
              >
                ← Back
              </button>
            </>
          )}

          {step === "success" && (
            <>
              <div className={styles.successIcon}>✓</div>
              <h1 className={styles.title}>Password Reset!</h1>
              <p className={styles.subtitle}>
                Your password has been successfully reset.
              </p>
              <p className={styles.redirectMsg}>
                Redirecting to login in 3 seconds...
              </p>

              <button
                className={styles.primaryBtn}
                onClick={() => navigate("/")}
              >
                Go to Login Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
