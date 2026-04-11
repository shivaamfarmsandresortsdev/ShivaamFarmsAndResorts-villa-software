import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookingSearchPopup.css";

// Base color palette
const baseColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#1A535C",
  "#FF6F91",
  "#6A4C93",
  "#FF9F1C",
  "#2EC4B6",
  "#E71D36",
  "#9B5DE5",
  
];

// Generate a color for any villa number
const getVillaColor = (villa) => {
  if (!villa) return "#999";

  // Try number-based color first
  const digits = villa.toString().match(/\d+/);
  if (digits) {
    const num = parseInt(digits[0], 10) - 1;
    return baseColors[num % baseColors.length];
  }

  // Fallback: hash villa name
  let hash = 0;
  for (let i = 0; i < villa.length; i++) {
    hash = villa.charCodeAt(i) + ((hash << 5) - hash);
  }

  return baseColors[Math.abs(hash) % baseColors.length];
};


const BookingSearchPopup = ({ onClose, onSelect }) => {
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/bookings?checked_in=false");
        const data = res.data.data || [];
        setBookings(data);

      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filtered = bookings.filter(
    (b) =>
      b.guest?.toLowerCase().includes(query.toLowerCase()) ||
      // b.email?.toLowerCase().includes(query.toLowerCase()) ||
      b.villa?.toLowerCase().includes(query.toLowerCase()) ||
      b.phone?.toLowerCase().includes(query.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getVillas = (b) => {
    if (Array.isArray(b.villas)) return b.villas;
    if (b.villa) return [b.villa];
    return [];
  };
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getPaymentMode = (b) => b.payment_mode || b.paymentMode || "-";

  const getAdvance = (b) =>
    num(
      b.advanced_amount ??
      b.advancedAmount ??
      b.bulk_advanced_amount ??
      b.bulkAdvancedAmount
    );

  const getRemaining = (b) =>
    num(
      b.remaining_amount ??
      b.remainingAmount ??
      b.bulk_remaining_amount ??
      b.bulkRemainingAmount
    );

  const getTotal = (b) =>
    num(
      b.total_amount ??
      b.totalAmount ??
      b.baseAmount ??
      b.baseAmount ??
      b.bulk_base_amount ??
      b.bulkBaseAmount
    );




  return (
    <div
      className="booking-search-overlay"
      onClick={() => {
        setQuery("");      // ✅ clear search input
        setBookings([]);   // ✅ clear previous booking list
        onClose();         // ✅ close popup
      }}
    >

      <div
        className="booking-search-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Search Bookings</h5>
          <button
            className="btn-close"
            onClick={() => {
              setQuery("");
              setBookings([]);
              onClose();
            }}
          ></button>

        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by guest, villa or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {loading ? (
          <p className="text-center mt-3">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-danger mt-3">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center mt-3">No bookings found.</p>
        ) : (
          <div className="results-list">
            {filtered.map((b) => {
              console.log("SEARCH BOOKING RAW:", b);
              const villas = getVillas(b);
              const primaryVilla = villas[0];

              return (
                <div
                  key={b.id || b.booking_id || b.bulk_id || b.bulkId}
                  className="result-item shadow-sm p-3 rounded mb-2 bg-white cursor-pointer"
                  onClick={async () => {
                    try {
                      console.log("✅ CLICKED BOOKING:", b);

                      // ✅ detect ids safely
                      const bookingId = b.id || b.booking_id;
                      const bulkId = b.bulk_id || b.bulkId;

                      // ✅ Normal booking
                      if (bookingId) {
                        const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}`);
                        onSelect && onSelect(res.data.data);
                        onClose();
                        return;
                      }

                      // ✅ Bulk booking (if your backend supports it)
                      if (bulkId) {
                        const res = await axios.get(`${API_BASE}/api/bookings/bulk/${bulkId}`);
                        onSelect && onSelect(res.data.data);
                        onClose();
                        return;
                      }

                      alert("❌ No valid booking id found");
                    } catch (err) {
                      console.error("Failed to load booking details", err);
                      alert("Failed to load booking details");
                    }
                  }}

                >

                  <div className="d-flex align-items-center mb-1">
                    <span
                      className="villa-dot me-2"
                      style={{ backgroundColor: getVillaColor(primaryVilla) }}
                    ></span>
                    <div>
                      <div className="fw-bold fs-6">{b.guest}</div>
                      <div className="small text-muted">
                        {villas.join(", ")}
                        {villas.length > 1 && (
                          <span className="badge bg-info ms-2">Bulk</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="small text-muted mb-1">
                    {formatDate(b.check_in || b.checkIn)} →{" "}
                    {formatDate(b.check_out || b.checkOut)}
                  </div>

                  {isAdmin && (
                    <>
                      <div className="small mb-1">Payment: {getPaymentMode(b)}</div>
                      <div className="small mb-1">Advance: ₹{getAdvance(b)}</div>
                      <div className="small mb-1">Balance: ₹{getRemaining(b)}</div>
                      <div className="fw-bold">Total: ₹{getTotal(b)}</div>
                    </>
                  )}
                  {b.status && (
                    <div className="badge bg-secondary mt-2">{b.status}</div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSearchPopup;
