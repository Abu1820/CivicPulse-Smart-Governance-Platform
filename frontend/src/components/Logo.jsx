import "../styles/Logo.css";

function Logo({ size = "md", showText = true, showTagline = true, className = "" }) {
  const pixelSizes = {
    sm: 32,
    md: 42,
    lg: 56,
  };

  const iconPx = pixelSizes[size] || 42;

  return (
    <div className={`civicpulse-brand ${size} ${className}`.trim()}>
      <div
        className="brand-icon-wrapper"
        style={{ width: iconPx, height: iconPx, minWidth: iconPx }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-icon-svg"
        >
          <defs>
            <linearGradient id="cpBrandBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#042f2e" />
            </linearGradient>
            <linearGradient id="cpBrandPulse" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="cpBrandGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Squircle Badge Background */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill="url(#cpBrandBg)"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeOpacity="0.7"
          />

          {/* Civic Towers / Governance Pillars */}
          <rect x="18" y="27" width="7" height="23" rx="1.5" fill="#14b8a6" fillOpacity="0.25" />
          <rect x="28.5" y="19" width="7" height="31" rx="1.5" fill="#14b8a6" fillOpacity="0.45" />
          <rect x="39" y="24" width="7" height="26" rx="1.5" fill="#14b8a6" fillOpacity="0.25" />

          {/* Dynamic Pulse Lifeline Wave */}
          <path
            d="M 10 40 L 22 40 L 26 44 L 32 15 L 38 49 L 43 38 L 47 41 L 54 40"
            stroke="url(#cpBrandPulse)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cpBrandGlow)"
          />

          {/* Active Pulse Beacon Node */}
          <circle cx="32" cy="15" r="3" fill="#ffffff" />
          <circle
            cx="32"
            cy="15"
            r="6"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.85"
            className="pulse-ripple"
          />
        </svg>
      </div>

      {showText && (
        <div className="brand-text-block">
          <div className="brand-title">
            <span className="brand-civic">Civic</span>
            <span className="brand-pulse">Pulse</span>
          </div>
          {showTagline && size !== "sm" && (
            <span className="brand-tagline">
              SMART GOVERNANCE <span className="tagline-dot">•</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;
