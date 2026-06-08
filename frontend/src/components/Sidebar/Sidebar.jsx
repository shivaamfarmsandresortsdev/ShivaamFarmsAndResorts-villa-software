import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LuLayoutDashboard, LuBox } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { MdCurrencyRupee, MdVilla } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { FaWpforms } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role;

  useEffect(() => {
    if (isOpen) toggleSidebar();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center text-black mb-1 ${
      isActive ? styles.activeLink : ""
    }`;

  const roleLabel =
    role === "admin"   ? "Villa Manager"   :
    role === "manager" ? "Villa Executive"  :
    role === "staff"   ? "Villa Staff"     :
    (role ? role.charAt(0).toUpperCase() + role.slice(1) : "");

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.sidebarInner}>

        {/* ── Header ── */}
        <div className={`${styles.sidebarHeader} d-flex align-items-center justify-content-between`}>
          <h2 className="fs-6 fw-bold my-0">{roleLabel}</h2>
          <button
            className="btn btn-sm btn-light d-md-none"
            onClick={toggleSidebar}
          >
            ✖
          </button>
        </div>

        {/* ── Navigation ── */}
        <div className={styles.sidebarNav}>
          <ul className="nav flex-column p-2 pt-3">

            {/* All roles */}
            <li>
              <NavLink to="/" className={linkClass}>
                <LuLayoutDashboard className="me-2" />
                Dashboard
              </NavLink>
            </li>

            {/* Admin only */}
            {role === "admin" && (
              <>
                <li>
                  <NavLink to="/staff" className={linkClass}>
                    <GoPeople className="me-2" />
                    Staff
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/finance" className={linkClass}>
                    <MdCurrencyRupee className="me-2" />
                    Finance
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/stocks" className={linkClass}>
                    <LuBox className="me-2" />
                    Stocks
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/users" className={linkClass}>
                    <FiUsers className="me-2" />
                    User Management
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin + Manager */}
            {(role === "admin" || role === "manager") && (
              <li>
                <NavLink to="/villas" className={linkClass}>
                  <MdVilla className="me-2" />
                  Villas
                </NavLink>
              </li>
            )}

            {/* All roles */}
            <li>
              <NavLink to="/booking" className={linkClass}>
                <CiCalendar className="me-2" />
                Booking
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" className={linkClass}>
                <CiCalendar className="me-2" />
                Calendar
              </NavLink>
            </li>
            <li>
              <NavLink to="/checkInForm" className={linkClass}>
                <FaWpforms className="me-2" />
                Check-in Form
              </NavLink>
            </li>
          </ul>
        </div>

        {/* ── Logout — always at bottom ── */}
        <div className={styles.logoutSection}>
          <hr className={styles.logoutDivider} />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
