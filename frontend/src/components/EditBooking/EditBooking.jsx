// src/components/EditBooking/EditBooking.jsx
import React, { useState, useEffect } from "react";
import "./EditBooking.css";

const EditBooking = ({ booking, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    guest: "",
    // email: "",
    phone: "",
    address: "",
    // aadhar: "",
    villas: [],
    checkIn: "",
    checkOut: "",
    nights: 0,
    guests: 1,
    status: "Pending",

    baseAmount: 0,
    // gstType: "",
    totalAmount: 0,
    receivedBy: "",
    paymentMode: "",
    paymentCategory: "Total",
    advancedAmount: 0,
    remainingAmount: 0,
  });

  const [loading, setLoading] = useState(false);


  const options = [
    "Sample Villa",
    "Khetan Villa",
    "Madan Villa",
    "Pandhari Villa",
    "Dormitory Villa",
    "Tidke Villa",
    "Ishan Villa",
    "Cottage Villa",
    "Krishna Villa",
    "Motvani Villa",
    "Bhatkar villa",
    "Hill Farm",
  "Wood Farm"];

  useEffect(() => {
    if (!booking) return;
    // booking from API is snake_case from DB - map to camelCase for form
    setFormData({
      id: booking.id,
      guest: booking.guest ?? "",
      // email: booking.email ?? "",
      phone: booking.phone ?? "",
      address: booking.address ?? "",
      // aadhar: booking.aadhar ? booking.aadhar.replace(/\s/g, "") : "",
      villas: booking.villas ?? [],
      checkIn: booking.checkIn ?? "",
      checkOut: booking.checkOut ?? "",
      nights: booking.nights ?? 0,
      guests: booking.guests ?? 1,
      status: booking.status ?? "Pending",

      baseAmount: Number(booking.base_amount || 0),
      // gstType: booking.gst_type || "",
      totalAmount: Number(booking.total_amount || 0),
      receivedBy: booking.received_by || "",
      paymentMode: booking.payment_mode || "",
      paymentCategory: booking.payment_category || "Total",
      advancedAmount: Number(booking.advanced_amount || 0),
      remainingAmount: Number(booking.remaining_amount || 0),
    });
  }, [booking]);
  useEffect(() => {
    const base = Number(formData.baseAmount || 0);

    if (!base) {
      setFormData((p) => ({
        ...p,
        totalAmount: 0,
        remainingAmount: 0,
      }));
      return;
    }

    const total = base; // 🔥 GST REMOVED

    setFormData((p) => ({
      ...p,
      totalAmount: total,
      remainingAmount:
        p.paymentCategory === "Advanced"
          ? Math.max(total - (p.advancedAmount || 0), 0)
          : 0,
    }));
  }, [
    formData.baseAmount,
    formData.paymentCategory,
    formData.advancedAmount,
  ]);

  // const handleAadhar = (val) => {
  //   let digits = String(val).replace(/\D/g, "").slice(0, 12);
  //   const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  //   setFormData((p) => ({ ...p, aadhar: formatted }));
  // };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // ✅ Extract numeric ID
    let bookingId = formData.id;

    if (typeof bookingId === "string" && bookingId.includes("-")) {
      bookingId = bookingId.split("-")[1];
    }

    bookingId = Number(bookingId);

    if (isNaN(bookingId)) {
      alert("Invalid booking ID");
      return;
    }

    const payload = {
      id: bookingId, // send numeric id
      guest: formData.guest,
      phone: formData.phone || null,
      address: formData.address || null,
     villa: formData.villas[0] || "",
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: Number(formData.nights || 0),
      guests: Number(formData.guests || 1),
      baseAmount: Number(formData.baseAmount || 0),
      advancedAmount:
        formData.paymentCategory === "Total"
          ? booking.advanced_amount
          : Number(formData.advancedAmount || 0),
      paymentCategory: formData.paymentCategory,
      paymentMode: formData.paymentMode,
      receivedBy: formData.receivedBy,
      status: formData.status,
    };

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`, // ✅ fixed here
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const body = await res.json();

      if (!res.ok) {
        setLoading(false);
        alert("Update error: " + (body.error || "server error"));
        return;
      }

      setLoading(false);
      alert("Booking updated");
      onSave(body.data);
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      setLoading(false);
      alert("Could not update booking");
    }
  };


  const VillaMultiSelect = ({ options, value = [], onChange }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef();

    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectVilla = (villa) => {
      onChange([villa]); // ✅ Only one villa
      setOpen(false);    // auto close dropdown
    };

    return (
      <div ref={ref} className="position-relative">
        <div
          className="form-control"
          onClick={() => setOpen(!open)}
          style={{ cursor: "pointer" }}
        >
          {value.length > 0 ? value[0] : "Select Villa"}
        </div>

        {open && (
          <div
            className="border rounded shadow-sm bg-white mt-1 p-2 position-absolute w-100"
            style={{ zIndex: 1000, maxHeight: 200, overflowY: "auto" }}
          >
            {options.map((villa) => (
              <div key={villa} className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="villa"
                  checked={value[0] === villa}
                  onChange={() => selectVilla(villa)}
                />
                <label className="form-check-label">
                  {villa}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="new-booking-overlay">
      <div className="new-booking-page">
        <div className="card p-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Edit Booking</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12 col-sm-6">
              <label>Guest</label>
              <input name="guest" value={formData.guest} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-12 col-sm-6 position-relative">
              <label className="form-label">Villas</label>

              <VillaMultiSelect
                options={options || []}
                value={formData.villas || []}
                onChange={(newVillas) =>
                  setFormData((prev) => ({
                    ...prev,
                    villas: newVillas,
                  }))
                }
              />
            </div>


            <div className="col-12 col-sm-6">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="2" />
            </div>

            {/* <div className="col-12 col-sm-6">
              <label>Aadhar</label>
              <input name="aadhar" value={formData.aadhar} onChange={(e) => handleAadhar(e.target.value)} className="form-control" maxLength={14} />
            </div> */}

            <div className="col-12 col-sm-6">
              <label>Check-in</label>
              <input name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Check-out</label>
              <input name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Base Amount (₹)</label>
              <input name="baseAmount" type="number" value={formData.baseAmount} onChange={handleChange} className="form-control" />
            </div>

            {/* <div className="col-12 col-sm-6">
              <label>GST Type</label>
              <select name="gstType" value={formData.gstType} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                <option value="CGST + SGST (9% + 9%)">CGST + SGST (9% + 9%)</option>
                <option value="IGST (18%)">IGST (18%)</option>
              </select>
            </div> */}

            <div className="col-12 col-sm-6">
              <label>Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label>Payment Category</label>
              <div>
                <input type="radio" id="total" name="paymentCategory" value="Total" checked={formData.paymentCategory === "Total"} onChange={handleChange} /> <label htmlFor="total">Total</label>
                <input type="radio" id="adv" name="paymentCategory" value="Advanced" checked={formData.paymentCategory === "Advanced"} onChange={handleChange} style={{ marginLeft: 10 }} /> <label htmlFor="adv">Advanced</label>
              </div>
            </div>

            {formData.paymentCategory === "Advanced" && (
              <>
                <div className="col-12 col-sm-6">
                  <label>Advanced</label>
                  <input name="advancedAmount" type="number" value={formData.advancedAmount} onChange={handleChange} className="form-control" />
                </div>

                <div className="col-12 col-sm-6">
                  <label>Remaining</label>
                  <input value={formData.remainingAmount} readOnly className="form-control" />
                </div>
              </>
            )}

            <div className="col-12 col-sm-6">
              <label>Total (auto)</label>
              <input value={formData.totalAmount} readOnly className="form-control" />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBooking;
