import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © {new Date().getFullYear()} CivicPulse - Smart Governance Platform. Empowering Citizens, Improving Communities.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
