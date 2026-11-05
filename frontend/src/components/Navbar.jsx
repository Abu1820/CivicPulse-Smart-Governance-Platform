import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import ConfirmModal from "./ConfirmModal";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    user = null;
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    closeMenu();
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    toast.success("Logged out successfully!");
    navigate("/");
    window.location.reload();
  };

  // Prevent background scrolling when mobile menu is active
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Auto-close menu if resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo" onClick={closeMenu} title="CivicPulse - Home">
          <h2>CivicPulse</h2>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-btn"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Navigation Links (Horizontal on Desktop, Slide Drawer on Mobile) */}
        <div className={`nav-links-container ${isMenuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Home
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              {user?.role !== "ADMIN" && (
                <NavLink
                  to="/report"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Report Issue
                </NavLink>
              )}

              <NavLink
                to="/issues"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                View Issues
              </NavLink>

              {user?.role === "ADMIN" && (
                <NavLink
                  to="/admin-dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Dashboard
                </NavLink>
              )}

              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Profile
              </NavLink>
            </>
          )}

          {/* Action Group: Theme Toggle & Logout */}
          <div className="nav-actions-group">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark and light mode"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <>
                  <span className="theme-icon">☀️</span>
                  <span className="theme-text">Light</span>
                </>
              ) : (
                <>
                  <span className="theme-icon">🌙</span>
                  <span className="theme-text">Dark</span>
                </>
              )}
            </button>

            {user && (
              <button
                className="logout-btn"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop overlay for outside-click to close on mobile */}
      <div
        className={`mobile-nav-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        message="Are you sure you want to log out of CivicPulse?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}

export default Navbar;
