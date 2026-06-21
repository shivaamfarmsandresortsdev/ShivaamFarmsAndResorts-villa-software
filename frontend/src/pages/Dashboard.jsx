import React, { useState, useEffect } from "react";
import Card from "../components/Card/Card";
import CardBasic from "../components/CardBasic/CardBasic";
import { CiCalendar } from "react-icons/ci";
import { MdCurrencyRupee } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { LuBox } from "react-icons/lu";
import { getStaff } from "../service/staffApi";
import CheckAvailability from "../components/CheckAvailability/CheckAvailability";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "https://shivaamfarmsandresorts-villa-software-1.onrender.com";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [staffCount, setStaffCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const { user } = useAuth();
  const role     = user?.role;
  const isAdmin  = role === "admin";
  const isStaff  = role === "staff";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const promises = [
          fetch(`${API_BASE}/api/bookings`, { credentials: "include" }).then(r => r.json()),
        ];

        // Only admin fetches staff + stocks (staff/manager get 403 otherwise)
        if (isAdmin) {
          promises.push(
            getStaff().catch(() => []),
            fetch(`${API_BASE}/api/stocks`, { credentials: "include" }).then(r => r.json()).catch(() => ({ data: [] }))
          );
        }

        const [bookingRes, staffData, stockRes] = await Promise.all(promises);

        // Bookings
        const bookingData = Array.isArray(bookingRes?.data) ? bookingRes.data : [];
        setTotalBookings(bookingData.length);
        setTotalRevenue(bookingData.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0));

        // Staff (admin only)
        if (staffData) setStaffCount(Array.isArray(staffData) ? staffData.length : 0);

        // Stocks (admin only)
        if (stockRes) {
          const stockArray = Array.isArray(stockRes) ? stockRes : (Array.isArray(stockRes?.data) ? stockRes.data : []);
          setItems(stockArray);
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, isAdmin]);

  const handleLowStockClick = () => {
    const filtered = items.filter(
      (item) => Number(item.current_stock) <= Number(item.min_stock)
    );
    setLowStockItems(filtered);
    setShowLowStockModal(true);
  };

  const totalItems  = items.length;
  const lowItems    = items.filter((item) => Number(item.current_stock) <= Number(item.min_stock)).length;
  const stockHealth = totalItems > 0 ? `${Math.round(((totalItems - lowItems) / totalItems) * 100)}%` : "0%";

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-3 fw-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overviewContainer container">

      <div className="py-3">
        <h2 className="fs-4 fw-500">Check Availability</h2>
        <CheckAvailability />
      </div>

      <div className="py-4">

        {/* Quick Actions */}
        <h2 className="fs-4 fw-500">Quick Actions</h2>
        <div className="row g-3 justify-content-center pb-4">
          <CardBasic
            cardTitle={"New Booking"}
            cardText={"Add a new villa booking"}
            cardColor={"#B7E4C7"}
            navigateTo="/booking"
          />
          <CardBasic
            cardTitle={"Check-in Form"}
            cardText={"Add new check-in entry"}
            cardColor={"#A3CCDA"}
            navigateTo="/checkinform"
          />
          {isAdmin && (
            <CardBasic
              cardTitle={"Stock Update"}
              cardText={"Update inventory levels"}
              cardColor={"#FFF3B0"}
              navigateTo="/stocks"
            />
          )}
        </div>

        {/* Overview */}
        <div className="row g-3 pb-4 justify-content-center">
          <h2 className="fs-4 fw-500">Overview</h2>

          <Card
            cardTitle={"Total Bookings"}
            cardIcon={<CiCalendar fontSize={20} color="#000000" />}
            cardSubtitle={totalBookings.toString()}
          />

          {isAdmin && (
            <>
              <Card
                cardTitle={"Total Revenue"}
                cardIcon={<MdCurrencyRupee fontSize={20} color="#000000" />}
                cardSubtitle={`₹${totalRevenue.toLocaleString()}`}
              />
              <Card
                cardTitle={"Total Staff"}
                cardIcon={<GoPeople fontSize={20} color="#000000" />}
                cardSubtitle={staffCount.toString()}
              />
              <Card
                cardTitle={"Stock Status"}
                cardIcon={<LuBox fontSize={20} color="#000000" />}
                cardSubtitle={stockHealth}
                style={{ cursor: "pointer" }}
                onClick={handleLowStockClick}
              />
            </>
          )}
        </div>

        {/* Low Stock Modal */}
        {showLowStockModal && (
          <div style={{
            position: "fixed", top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
          }}>
            <div style={{
              background: "#fff", padding: "20px", borderRadius: "10px",
              width: "500px", maxHeight: "90vh", overflowY: "auto",
            }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Low Stock Items</h5>
                <button className="btn-close" onClick={() => setShowLowStockModal(false)} />
              </div>
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center bg-light border rounded p-3 mb-2">
                    <div>
                      <div className="fw-semibold">{item.itemname}</div>
                      <small className="text-muted">
                        {item.current_stock} remaining (min: {item.min_stock})
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No low stock items found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
