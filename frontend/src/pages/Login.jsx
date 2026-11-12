import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getErrorMessage } from "../utils/errorHandler";
import Logo from "../components/Logo";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [login, setLogin] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unverified user recovery state
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

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
    setLogin((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!login.email.trim()) {
      newErrors.email = "Please enter your email";
    }
    if (!login.password) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", login);

      if (!response.data.success) {
        if (response.data.requiresVerification) {
          toast.warn(response.data.message || "Please verify your email address.");
          setUnverifiedEmail(response.data.email || login.email);
          setShowOtpStep(true);
          setResendCooldown(30);
          return;
        }
        toast.error(response.data.message || "Invalid credentials");
        return;
      }

      toast.success(response.data.message || "Login Successful");

      localStorage.setItem("token", response.data.token);

      const user = {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };

      localStorage.setItem("user", JSON.stringify(user));

      if (response.data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      const errorMsg = getErrorMessage(error, "Invalid email or password");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const res = await api.post("/auth/verify-email", {
        email: unverifiedEmail,
        code: otpCode,
      });

      if (res.data.success) {
        toast.success("Email verified! Logging you in...");
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: res.data.name,
              email: res.data.email,
              role: res.data.role,
            })
          );
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 1000);
        } else {
          setShowOtpStep(false);
        }
      } else {
        toast.error(res.data.message || "Verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired verification code");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await api.post("/auth/resend-code", { email: unverifiedEmail });
      if (res.data.success) {
        toast.success("Verification code sent to your email!");
        setResendCooldown(30);
      } else {
        toast.error(res.data.message || "Failed to resend");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not resend code");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="auth-logo-wrap">
          <Logo size="md" />
        </div>
        {!showOtpStep ? (
          <>
            <h2>Login</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={login.email}
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
                    placeholder="Password"
                    value={login.password}
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
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="auth-switch-text">
              Don't have an account? <Link to="/register">Create one here</Link>
            </p>
          </>
        ) : (
          <div className="otp-verification-step">
            <h2>Verify Your Email</h2>
            <p className="otp-subtitle">
              Your account requires email verification.
              <br />
              Enter the 6-digit code for <strong>{unverifiedEmail}</strong>:
            </p>

            <form onSubmit={handleVerifyOtp} noValidate>
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
                {isVerifyingCode ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>

            <div className="otp-actions-row">
              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
              </button>
              <button
                type="button"
                className="back-to-reg-btn"
                onClick={() => setShowOtpStep(false)}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
