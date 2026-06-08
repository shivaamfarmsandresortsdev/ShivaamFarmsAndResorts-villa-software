import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login.css";
import logo from "../assets/images/shivaam-farms-and-resorts.png";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-wrapper">

      {/* ══ LEFT PANEL — Brand ══════════════════════════════════ */}
      <div className="lp-left">
        {/* Decorative rings */}
        <span className="lp-ring lp-ring-1" />
        <span className="lp-ring lp-ring-2" />
        <span className="lp-ring lp-ring-3" />
        {/* Glow blobs */}
        <span className="lp-glow lp-glow-1" />
        <span className="lp-glow lp-glow-2" />

        <div className="lp-brand">
          <img src={logo} alt="Shivaam Logo" className="lp-brand-logo" />

          <div className="lp-brand-divider" />

          <h1 className="lp-brand-title">
            Shivaam Farms<br />&amp; Resorts
          </h1>
          <p className="lp-brand-sub">
            Complete villa and resort management — bookings, check-ins, finance, and more.
          </p>

        </div>
      </div>

      {/* ══ RIGHT PANEL — Form ══════════════════════════════════ */}
      <div className="lp-right">
        <div className="lp-card">

          {/* Mobile-only logo (shown when left panel hidden) */}
          <div className="lp-mobile-header">
            <img src={logo} alt="Shivaam Logo" className="lp-mobile-logo" />
          </div>

          {/* Form body */}
          <div className="lp-body">
            <h2 className="lp-title">Welcome back</h2>
            <p className="lp-sub">Sign in to your account to continue</p>

            {error && (
              <div className="lp-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>

              {/* Email */}
              <div className="lp-field">
                <label className="lp-label">Email address</label>
                <div className="lp-input-wrap">
                  <svg className="lp-icon" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="lp-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <svg className="lp-icon" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPass ? "text" : "password"}
                    className="lp-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPass((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? (
                  <><span className="lp-spinner" />Signing in…</>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="lp-footer">
            Shivaam Farms &amp; Resorts &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>

    </div>
  );
}
