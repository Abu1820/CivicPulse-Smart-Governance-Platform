import "../styles/Features.css";

function Features() {
  return (
    <section className="features">
      <div className="features-header">
        <h2>Why Choose CivicPulse?</h2>
        <div className="features-accent-line"></div>
      </div>

      <div className="feature-container">
        <div className="feature-card">
          <div className="feature-icon-bubble">📝</div>
          <h3>Report Issue</h3>
          <p>Report potholes, garbage, water leakage and more with real-time GPS coordinates.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-bubble">📍</div>
          <h3>Track Issues</h3>
          <p>Monitor the live status and resolution progress of your reported issues.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-bubble">📊</div>
          <h3>Dashboard</h3>
          <p>View interactive analytics and live statistics on civic issue resolution.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
