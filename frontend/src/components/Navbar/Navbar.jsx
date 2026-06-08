import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/":            "Dashboard",
  "/staff":       "Staff",
  "/finance":     "Finance",
  "/booking":     "Booking",
  "/stocks":      "Stocks",
  "/checkInForm": "Check In Form",
  "/settings":    "Settings",
  "/users":       "User Management",
  "/villas":      "Villas",
  "/calendar":    "Calendar",
};

const roleConfig = {
  admin:   { label: "Admin",   color: "#dc3545", bg: "#fff0f0" },
  manager: { label: "Manager", color: "#b45309", bg: "#fffbeb" },
  staff:   { label: "Staff",   color: "#166534", bg: "#f0fdf4" },
};

// Get initials from name e.g. "Rahul Sharma" → "RS"
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

// Pick a stable avatar background from name
const avatarColors = [
  "#4f46e5", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#db2777", "#0369a1",
];
const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const Navbar = ({ toggleSidebar }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  const role   = user?.role ?? "staff";
  const config = roleConfig[role] ?? roleConfig.staff;
  const initials    = getInitials(user?.name);
  const avatarColor = getAvatarColor(user?.name ?? "");

  return (
    <nav className={`${styles.navbar} navbar px-3 py-2 border-bottom`}>
      <div className="container-fluid d-flex align-items-center">

        {/* Mobile sidebar toggle */}
        <button className="btn btn-dark d-md-none me-3" onClick={toggleSidebar}>
          ☰
        </button>

        {/* Logo */}
        <img
          src={logo}
          style={{ height: "38px", cursor: "pointer" }}
          alt="Shivaam Logo"
          onClick={() => navigate("/")}
        />

        {/* Profile dropdown */}
        {user && (
          <div className="ms-auto position-relative" ref={dropdownRef}>
            <button
              className={`${styles.profileBtn} d-flex align-items-center gap-2`}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              {/* Avatar circle */}
              <div
                className={styles.avatar}
                style={{ background: avatarColor }}
              >
                {initials}
              </div>

              {/* Name + role — hidden on mobile */}
              <div className="d-none d-sm-flex flex-column align-items-start lh-1">
                <span className={styles.profileName}>{user.name}</span>
                <span className={styles.profileRole} style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>

              {/* Caret */}
              <svg
                className={`${styles.caret} ${open ? styles.caretOpen : ""}`}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className={styles.dropdown}>
                {/* Header */}
                <div className={styles.dropdownHeader}>
                  <div
                    className={styles.avatarLg}
                    style={{ background: avatarColor }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownEmail}>{user.email}</div>
                    <span
                      className={styles.rolePill}
                      style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}33` }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                <hr className="my-1" />

                {/* Logout */}
                <button
                  className={styles.dropdownLogout}
                  onClick={handleLogout}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
