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

import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import Login from "./pages/Login.jsx";
import Protected from "./Protected.jsx";
import NotAllowed from "./pages/NotAllowed.jsx";


// ⭐ Layout wrapper
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

const App = () => {

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let logoutTimer;
    let warningTimer;

    const logout = () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      window.location.href = "/login";
    };

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);

      // ⚠️ Warning after 2 minutes
      warningTimer = setTimeout(() => {
        setShowModal(true);
      }, 2 * 60 * 1000);

      // 🚪 Logout after 3 minutes
      logoutTimer = setTimeout(() => {
        logout();
      }, 3 * 60 * 1000);
    };

    if (localStorage.getItem("loggedIn")) {
      const events = ["mousemove", "click", "keypress", "scroll"];

      events.forEach((event) =>
        window.addEventListener(event, resetTimer)
      );

      resetTimer();

      return () => {
        clearTimeout(logoutTimer);
        clearTimeout(warningTimer);
        events.forEach((event) =>
          window.removeEventListener(event, resetTimer)
        );
      };
    }
  }, []);

  const stayLoggedIn = () => {
    setShowModal(false);
    window.dispatchEvent(new Event("mousemove")); // reset timer
  };

  const logoutNow = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <Router>
      <ScrollToTop />

      {/* 🔔 SESSION WARNING MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-warning">
                <h5 className="modal-title text-dark">
                  Session Expiring Soon
                </h5>
              </div>
              <div className="modal-body">
                <p>
                  ⚠️ Your session will expire in <b>1 minute</b> due to inactivity.
                </p>
                <p>Do you want to stay logged in?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={logoutNow}
                >
                  Logout
                </button>
                <button
                  className="btn btn-success"
                  onClick={stayLoggedIn}
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Layout>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />

          <Route path="/staff" element={
            <Protected allowedRoles={["admin"]}>
              <Staff />
            </Protected>
          } />

          <Route path="/villas" element={
            <Protected allowedRoles={["admin"]}>
              <Villas />
            </Protected>
          } />

          <Route path="/finance" element={
            <Protected allowedRoles={["admin"]}>
              <Finance />
            </Protected>
          } />

          <Route path="/booking" element={
            <Protected>
              <Booking />
            </Protected>
          } />

          <Route path="/calendar" element={
            <Protected>
              <CalendarPage />
            </Protected>
          } />

          <Route path="/stocks" element={
            <Protected allowedRoles={["admin"]}>
              <Stocks />
            </Protected>
          } />

          <Route path="/checkInForm" element={
            <Protected>
              <CheckInForm />
            </Protected>
          } />

          <Route path="/settings" element={
            <Protected>
              <Settings />
            </Protected>
          } />

          <Route path="/not-allowed" element={
            <Protected>
              <NotAllowed />
            </Protected>
          } />

        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
