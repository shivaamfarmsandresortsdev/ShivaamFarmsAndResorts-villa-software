import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Footer from "./components/Footer/Footer.jsx";

import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff.jsx";
import Villas from "./pages/Villas.jsx";
import Finance from "./pages/Finance.jsx";
import Booking from "./pages/Booking.jsx";
import Stocks from "./pages/Stocks.jsx";
import CheckInForm from "./pages/CheckInForm.jsx";
import Settings from "./pages/Settings.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import Users from "./pages/Users.jsx";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import Login from "./pages/Login.jsx";
import Protected from "./Protected.jsx";
import NotAllowed from "./pages/NotAllowed.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// ─── Inactivity session guard ─────────────────────────────────────────────────
function InactivityGuard() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    let logoutTimer;
    let warningTimer;

    const handleLogout = async () => {
      await logout();
      window.location.href = "/login";
    };

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      warningTimer = setTimeout(() => setShowModal(true), 2 * 60 * 1000);
      logoutTimer  = setTimeout(handleLogout, 3 * 60 * 1000);
    };

    const events = ["mousemove", "click", "keypress", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user, logout]);

  const stayLoggedIn = () => {
    setShowModal(false);
    window.dispatchEvent(new Event("mousemove"));
  };

  const handleLogoutClick = async () => {
    await logout();
    window.location.href = "/login";
  };

  if (!showModal) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-warning">
            <h5 className="modal-title text-dark">Session Expiring Soon</h5>
          </div>
          <div className="modal-body">
            <p>⚠️ Your session will expire in <b>1 minute</b> due to inactivity.</p>
            <p>Do you want to stay logged in?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleLogoutClick}>
              Logout
            </button>
            <button className="btn btn-success" onClick={stayLoggedIn}>
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <>
      {!hideLayout && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}
      <div className="main-content">
        {!hideLayout && <Navbar toggleSidebar={toggleSidebar} />}
        <div className="p-4">{children}</div>
        {!hideLayout && <Footer />}
      </div>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <Router>
      <ScrollToTop />
      <InactivityGuard />

      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* All authenticated roles */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/booking" element={<Protected><Booking /></Protected>} />
          <Route path="/calendar" element={<Protected><CalendarPage /></Protected>} />
          <Route path="/checkInForm" element={<Protected><CheckInForm /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />

          {/* Admin only */}
          <Route path="/staff" element={
            <Protected allowedRoles={["admin"]}><Staff /></Protected>
          } />
          <Route path="/villas" element={
            <Protected allowedRoles={["admin", "manager"]}><Villas /></Protected>
          } />
          <Route path="/finance" element={
            <Protected allowedRoles={["admin"]}><Finance /></Protected>
          } />
          <Route path="/stocks" element={
            <Protected allowedRoles={["admin"]}><Stocks /></Protected>
          } />
          <Route path="/users" element={
            <Protected allowedRoles={["admin"]}><Users /></Protected>
          } />

          <Route path="/not-allowed" element={
            <Protected><NotAllowed /></Protected>
          } />
        </Routes>
      </Layout>
    </Router>
  </AuthProvider>
);

export default App;
