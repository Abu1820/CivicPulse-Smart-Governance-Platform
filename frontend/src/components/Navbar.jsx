import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {

    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");

    toast.success("Logged out successfully!");

    navigate("/");

    window.location.reload();
  };

  return (

    <nav>

      <h2>CivicPulse</h2>

      <div>

        <Link to="/">Home</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/report">Report Issue</Link>

            <Link to="/issues">View Issues</Link>

            {user?.role === "ADMIN" && (
              <Link to="/admin-dashboard">
                Dashboard
              </Link>
            )}

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

      </div>

    </nav>

  );
}

export default Navbar;