import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./EditBulkBooking.css";

const VILLA_OPTIONS = [
  { value: "Sample Villa", label: "Sample Villa" },
  { value: "Khetan Villa", label: "Khetan Villa" },
  { value: "Madan Villa", label: "Madan Villa" },
  { value: "Pandhari Villa", label: "Pandhari Villa" },
  { value: "Dormitory Villa", label: "Dormitory Villa" },
  { value: "Tidke Villa", label: "Tidke Villa" },
  { value: "Ishan Villa", label: "Ishan Villa" },
  { value: "Cottage Villa", label: "Cottage Villa" },
  { value: "Krishna Villa", label: "Krishna Villa" },
  { value: "Motvani Villa", label: "Motvani Villa" },
  { value: "Bhatkar Villa", label: "Bhatkar Villa" },
  { value: "Hill Farm", label: "Hill Farm" },
  { value: "Wood Farm", label: "Wood Farm" },
];

const EditBulkBooking = ({ bulkBooking, onClose, onSave }) => {
  const [bulkData, setBulkData] = useState({
    bulkId: null,
    villas: [],
    checkIn: "",
    checkOut: "",
    baseAmount: 0,
    paymentCategory: "Total",
    advancedAmount: 0,
    remainingAmount: 0,
    paymentMode: "",
    receivedBy: "",
    status: "Pending",
    bookings: [],
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD BULK DATA ---------------- */
  useEffect(() => {
    if (!bulkBooking) return;

    const bulkId = bulkBooking.bulkId || bulkBooking.bulk_id; // ✅ FIX

    console.log("✅ bulkBooking:", bulkBooking);
    console.log("✅ bulkId detected:", bulkId);

    setBulkData({
      bulkId,
      villas: (bulkBooking.bookings || []).map((b) => b.villa),
      checkIn: bulkBooking.checkIn || bulkBooking.check_in || "",
      checkOut: bulkBooking.checkOut || bulkBooking.check_out || "",
      baseAmount: Number(bulkBooking.baseAmount || bulkBooking.base_amount || 0),
      paymentCategory:
        bulkBooking.paymentCategory || bulkBooking.payment_category || "Total",
      advancedAmount: Number(
        bulkBooking.advancedAmount || bulkBooking.advanced_amount || 0
      ),
      remainingAmount:
        (bulkBooking.paymentCategory || bulkBooking.payment_category) ===
        "Advanced"
          ? Number(bulkBooking.baseAmount || bulkBooking.base_amount || 0) -
            Number(bulkBooking.advancedAmount || bulkBooking.advanced_amount || 0)
          : 0,
      paymentMode: bulkBooking.paymentMode || bulkBooking.payment_mode || "",
      receivedBy: bulkBooking.receivedBy || bulkBooking.received_by || "",
      status: bulkBooking.status || "Pending",
      bookings: bulkBooking.bookings || [],
    });
  }, [bulkBooking]);

  /* ---------------- PAYMENT CALC ---------------- */
  useEffect(() => {
    if (bulkData.paymentCategory === "Advanced") {
      setBulkData((prev) => ({
        ...prev,
        remainingAmount:
          Number(prev.baseAmount || 0) - Number(prev.advancedAmount || 0),
      }));
    } else {
      setBulkData((prev) => ({
        ...prev,
        remainingAmount: 0,
      }));
    }
  }, [bulkData.baseAmount, bulkData.advancedAmount, bulkData.paymentCategory]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setBulkData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleGuestChange = (index, field, value) => {
    const updated = [...bulkData.bookings];
    updated[index][field] = value;

    setBulkData((prev) => ({
      ...prev,
      bookings: updated,
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    try {
      if (!bulkData.bulkId) {
        alert("❌ Bulk ID is missing! Cannot update.");
        return;
      }

const url = `http://localhost:5000/api/bookings/bulk/${bulkData.bulkId}`;


      console.log("PUT URL:", url);
      console.log("Payload sending:", bulkData);

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkData),
      });

      const text = await res.text();
      console.log("Status:", res.status);
      console.log("Response:", text);

      if (!res.ok) {
        setLoading(false);
        alert(`Bulk update failed (${res.status})`);
        return;
      }

      const data = text ? JSON.parse(text) : {};
      setLoading(false);
      alert("✅ Bulk booking updated successfully");
      onSave(data);
      onClose();
    } catch (err) {
      console.error("Request error:", err);
      setLoading(false);
      alert("Server error");
    }
  };

  return (
    <div className="new-booking-overlay">
      <div className="new-booking-page">
        <div className="card p-4 shadow">
          <div className="d-flex justify-content-between mb-3">
            <h5>Edit Bulk Booking</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            {/* COMMON DETAILS */}
            <div className="col-sm-6">
              <label className="form-label">Villas</label>

              <Select
                isMulti
                options={VILLA_OPTIONS}
                value={VILLA_OPTIONS.filter((opt) =>
                  bulkData.villas.includes(opt.value)
                )}
                onChange={(selected) => {
                  const selectedVillas = selected
                    ? selected.map((v) => v.value)
                    : [];

                  setBulkData((prev) => ({
                    ...prev,
                    villas: selectedVillas,
                    bookings: prev.bookings.map((b, i) => ({
                      ...b,
                      villa: selectedVillas[i] || b.villa,
                    })),
                  }));
                }}
                placeholder="Select villas..."
              />
            </div>

            <div className="col-sm-6">
              <label>Base Amount (₹)</label>
              <input
                type="number"
                name="baseAmount"
                value={bulkData.baseAmount}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-sm-6">
              <label>Check-in</label>
              <input
                type="date"
                name="checkIn"
                value={bulkData.checkIn}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-sm-6">
              <label>Check-out</label>
              <input
                type="date"
                name="checkOut"
                value={bulkData.checkOut}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* PAYMENT */}
            <div className="col-sm-6">
              <label>Payment Category</label>
              <select
                name="paymentCategory"
                value={bulkData.paymentCategory}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Total">Total</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {bulkData.paymentCategory === "Advanced" && (
              <>
                <div className="col-sm-6">
                  <label>Advanced Amount</label>
                  <input
                    type="number"
                    name="advancedAmount"
                    value={bulkData.advancedAmount}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="col-sm-6">
                  <label>Remaining</label>
                  <input
                    readOnly
                    value={bulkData.remainingAmount}
                    className="form-control"
                  />
                </div>
              </>
            )}

            {/* GUEST LIST */}
            <div className="col-12">
              <h6>Guests</h6>
              {bulkData.bookings.map((g, i) => (
                <div key={g.id || i} className="row g-2 mb-2">
                  <div className="col">
                    <input
                      value={g.guest || ""}
                      onChange={(e) =>
                        handleGuestChange(i, "guest", e.target.value)
                      }
                      className="form-control"
                    />
                  </div>

                  <div className="col">
                    <input
                      value={g.phone || ""}
                      onChange={(e) =>
                        handleGuestChange(i, "phone", e.target.value)
                      }
                      className="form-control"
                    />
                  </div>

                  <div className="col">
                    <input
                      value={g.address || ""}
                      onChange={(e) =>
                        handleGuestChange(i, "address", e.target.value)
                      }
                      className="form-control"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="col-12 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {loading ? "Saving..." : "Save Bulk Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBulkBooking;
