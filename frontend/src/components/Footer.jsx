import Logo from "./Logo";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Logo size="sm" showTagline={false} />
        <p className="footer-text">
          © {new Date().getFullYear()} CivicPulse. Smart Governance Platform — Empowering Citizens, Improving Communities.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
