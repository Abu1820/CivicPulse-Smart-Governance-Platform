import { Link } from "react-router-dom";
import "../styles/Home.css";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function Home() {
  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    user = null;
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <section className="hero">
        <div className="hero-logo-badge">
          <Logo size="lg" showText={false} />
        </div>
        <h1>CivicPulse - Smart Governance Platform</h1>

        <p>
          {isAdmin
            ? "Monitor civic reports, review resolution analytics, and manage community governance."
            : "Report civic issues quickly and help improve your community."}
        </p>

        {isAdmin ? (
          <Link to="/admin-dashboard">
            <button>Admin Dashboard</button>
          </Link>
        ) : (
          <Link to="/report">
            <button>Report an Issue</button>
          </Link>
        )}
      </section>

      <Features />

      <Footer />
    </>
  );
}

export default Home;
