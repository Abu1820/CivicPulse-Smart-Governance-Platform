import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email Verification Step State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Cooldown timer for resending OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!register.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (register.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!register.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(register.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!register.password) {
      newErrors.password = "Password is required";
    } else if (register.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/register", register);

      if (response.data && !response.data.success) {
        toast.error(response.data.message || "Registration failed");
        return;
      }

      toast.success("Verification code sent to your email!");
      setVerificationEmail(register.email);
      setIsVerifying(true);
      setResendCooldown(30);
    } catch (error) {
      console.error(error);
      const errorMsg = getErrorMessage(error, "Registration failed. Please check your details.");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsVerifyingCode(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email: verificationEmail,
        code: otpCode.trim(),
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Invalid verification code");
        return;
      }

      toast.success(response.data.message || "Email verified successfully!");

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
          })
        );
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1200);
      } else {
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = getErrorMessage(error, "Verification failed. Please check your code.");
      toast.error(errorMsg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await api.post("/auth/resend-code", {
        email: verificationEmail,
      });

      if (response.data.success) {
        toast.success("A fresh verification code has been dispatched!");
        setResendCooldown(30);
      } else {
        toast.error(response.data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to resend code right now.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {!isVerifying ? (
          <>
            <h2>Create Account</h2>

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={register.name}
                  onChange={handleChange}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <span className="field-error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={register.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>

              <div className="form-group password-group">
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={register.password}
                    onChange={handleChange}
                    className={errors.password ? "input-error" : ""}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="field-error-text">{errors.password}</span>}
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Register"}
              </button>
            </form>

            <p className="auth-switch-text">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </>
        ) : (
          /* Step 2: Email Verification (OTP) */
          <div className="otp-verification-step">
            <div className="otp-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            <h2>Verify Your Email</h2>
            <p className="otp-subtitle">
              We have dispatched a 6-digit code to:
              <br />
              <strong>{verificationEmail}</strong>
            </p>


            <form onSubmit={handleVerifySubmit} noValidate>
              <div className="form-group">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="otp-code-input"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={isVerifyingCode || otpCode.length !== 6}>
                {isVerifyingCode ? "Verifying..." : "Verify & Activate Account"}
              </button>
            </form>

            <div className="otp-actions-row">
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
              </button>

              <button
                type="button"
                className="back-to-reg-btn"
                onClick={() => {
                  setIsVerifying(false);
                  setOtpCode("");
                }}
              >
                ← Change Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
