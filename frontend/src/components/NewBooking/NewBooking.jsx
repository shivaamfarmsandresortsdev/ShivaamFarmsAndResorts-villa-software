// src/components/NewBooking/NewBooking.jsx
import React, { useState, useEffect } from "react";
import "./NewBooking.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://shivaam-farms-and-resorts-villa-kynh.onrender.com";

const NewBooking = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    guest: "",
    // email: "",
    phone: "",
    address: "",
    // aadhar: "",
    villa: "Sample Villa",
    checkIn: "",
    checkOut: "",
    nights: 0,
    guests: 1,
    status: "Pending",

    baseAmount: "",
    // gstType: "",
    totalAmount: 0,
    receivedBy: "",
    paymentMode: "",
    paymentCategory: "Total",
    advancedAmount: 0,
    remainingAmount: 0,
  });

  const villaOptions = [
    "All Villas",
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
    "Hill Farm"
  ];

  const [dateError, setDateError] = useState("");
  const [bookingMode, setBookingMode] = useState("single");
  // "single" | "bulk"

  // const normalizeAadharInput = (val) => {
  //   let digits = String(val).replace(/\D/g, "").slice(0, 12);
  //   return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  // };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]:
          type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };

      // nights auto-calc
      if (name === "checkIn" || name === "checkOut") {
        const checkIn = name === "checkIn" ? value : next.checkIn;
        const checkOut = name === "checkOut" ? value : next.checkOut;
        if (checkIn && checkOut) {
          const d1 = new Date(checkIn);
          const d2 = new Date(checkOut);
          if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
            next.nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            setDateError("");
          } else {
            next.nights = 0;
            setDateError("Check-out must be after check-in");
          }
        } else {
          next.nights = 0;
          setDateError("");
        }
      }

      // paymentCategory "Total" resets advanced/remaining
      if (name === "paymentCategory" && value === "Total") {
        next.advancedAmount = 0;
        next.remainingAmount = 0;
      }

      // if advanced/amount change and paymentCategory is Advanced, recalc remaining
      if (
        (name === "advancedAmount" || name === "baseAmount") &&
        next.paymentCategory === "Advanced"
      ) {
        const advanced = Number(
          name === "advancedAmount" ? value : next.advancedAmount
        );

        const base = Number(
          name === "baseAmount" ? value : next.baseAmount
        );

        const total = base;

        next.totalAmount = total;
        next.remainingAmount = Math.max(total - (advanced || 0), 0);
      }


      return next;
    });
  };

  // aadhar special handler
  // const handleAadharChange = (e) => {
  //   const formatted = normalizeAadharInput(e.target.value);
  //   setFormData((prev) => ({ ...prev, aadhar: formatted }));
  // };

  // Recompute total when baseAmount or gstType changes
  useEffect(() => {
    const base = Number(formData.baseAmount || 0);

    if (!base) {
      setFormData((prev) => ({
        ...prev,
        totalAmount: 0,
        remainingAmount: 0,
      }));
      return;
    }

    const total = base; // 🔥 GST REMOVED

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      remainingAmount:
        prev.paymentCategory === "Advanced"
          ? Math.max(total - (prev.advancedAmount || 0), 0)
          : 0,
    }));
  }, [
    formData.baseAmount,
    formData.paymentCategory,
    formData.advancedAmount,
  ]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.guest.trim()) return alert("Enter guest");
    // if (!formData.email.trim()) return alert("Enter email");
    // if (!formData.aadhar || formData.aadhar.replace(/\s/g, "").length !== 12)
    //   return alert("Enter 12-digit Aadhar");
    if (!formData.checkIn || !formData.checkOut) return alert("Select dates");
    if (formData.nights <= 0) return alert("Invalid dates");
    if (!formData.baseAmount || Number(formData.baseAmount) <= 0)
      return alert("Enter base amount");
    // if (!formData.gstType) return alert("Select GST type");
    if (!formData.receivedBy.trim()) return alert("Enter received by");
    if (!formData.paymentMode) return alert("Select payment mode");

    const payload = {
      guest: formData.guest.trim(),
      // email: formData.email.trim(),
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      // aadhar: formData.aadhar.replace(/\s/g, ""),
      villa: formData.villa,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: Number(formData.nights),
      guests: Number(formData.guests),

      baseAmount: Number(formData.baseAmount),
      // gstType: formData.gstType,
      advancedAmount:
        formData.paymentCategory === "Advanced"
          ? Number(formData.advancedAmount || 0)
          : 0,
      paymentCategory: formData.paymentCategory,
      paymentMode: formData.paymentMode,
      receivedBy: formData.receivedBy.trim(),
      status: formData.status,
    };

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const body = await res.json();

      if (!res.ok) {
        alert("Error: " + (body.error || "server error"));
        return;
      }

      alert("Booking created");

      // 🔥 REFRESH PARENT LIST FIRST
      await onSave(body.data);

      // 🔥 THEN CLOSE MODAL
      onClose();

    } catch (err) {
      console.error("Create booking failed", err);
      alert("Could not connect to server");
    }
  };

  const VillaMultiSelect = ({ options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef();

    // Close when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleVilla = (villa) => {
      if (value.includes(villa)) {
        onChange(value.filter((v) => v !== villa));
      } else {
        onChange([...value, villa]);
      }
    };

    return (
      <div ref={ref} className="position-relative">
        {/* Input box */}
        <div
          className="form-control d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-truncate">
            {value.length ? value.join(", ") : "Select Villas"}
          </span>
          <span>▾</span>
        </div>

        {/* Dropdown */}
        {open && (
          <div
            className="border rounded shadow-sm bg-white mt-1 p-2 position-absolute w-100"
            style={{ zIndex: 1000, maxHeight: 200, overflowY: "auto" }}
          >
            {options.map((villa) => (
              <div key={villa} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={value.includes(villa)}
                  onChange={() => toggleVilla(villa)}
                  id={`${villa}`}
                />
                <label className="form-check-label" htmlFor={`${villa}`}>
                  {villa}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  const BulkBookingForm = ({ villaOptions, onClose, onSave }) => {
    const [rows, setRows] = useState([
      {
        guest: "",
        phone: "",
        villas: ["Sample Villa"],

        checkIn: "",
        checkOut: "",
        nights: 0,
        guests: 1,

        baseAmount: "",
        // gstType: "",
        totalAmount: 0,

        paymentCategory: "Total",
        advancedAmount: 0,
        remainingAmount: 0,

        paymentMode: "",
        receivedBy: "",
        status: "Pending",
      },
    ]);

    const today = new Date().toISOString().split("T")[0];

    /* ---- SAME LOGIC AS SINGLE BOOKING ---- */
    const recalcRow = (row) => {
      // -------- Nights auto-calc --------
      if (row.checkIn && row.checkOut) {
        const d1 = new Date(row.checkIn);
        const d2 = new Date(row.checkOut);

        if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
          row.nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        } else {
          row.nights = 0;
        }
      } else {
        row.nights = 0;
      }

      // -------- Amount calculation --------
      const base = Number(row.baseAmount || 0);
      if (!base) {
        row.totalAmount = 0;
        row.remainingAmount = 0;
        return;
      }

      const total = base; // 🔥 GST removed
      row.totalAmount = total;

      if (row.paymentCategory === "Advanced") {
        row.remainingAmount = Math.max(
          total - Number(row.advancedAmount || 0),
          0
        );
      } else {
        row.advancedAmount = 0;
        row.remainingAmount = 0;
      }
    };

    const updateRow = (index, field, value) => {
      const updated = [...rows];

      // keep same behavior
      updated[index][field] =
        ["baseAmount", "advancedAmount", "guests"].includes(field)
          ? value === ""
            ? ""
            : Number(value)
          : value;

      // recalc
      if (
        [
          "checkIn",
          "checkOut",
          "baseAmount",
          "gstType",
          "paymentCategory",
          "advancedAmount",
        ].includes(field)
      ) {
        recalcRow(updated[index]);
      }

      setRows(updated);
    };

    /* ---------------- SUBMIT (NOW SAME SYSTEM AS SINGLE) ---------------- */
    const handleBulkSubmit = async (e) => {
      e.preventDefault(); // ✅ popup submit system

      const expandedBookings = [];

      for (const r of rows) {
        if (
          !r.guest ||
          !r.villas.length ||
          !r.checkIn ||
          !r.checkOut ||
          r.nights <= 0 ||
          !r.baseAmount ||
          !r.paymentMode ||
          !r.receivedBy
        ) {
          alert("Please fill all required fields");
          return;
        }

        // 🔥 CREATE ONE BOOKING PER VILLA
        r.villas.forEach((villa) => {
          expandedBookings.push({
            guest: r.guest,
            phone: r.phone || null,
            villa, // ✅ SINGLE villa string

            checkIn: r.checkIn,
            checkOut: r.checkOut,
            nights: r.nights,
            guests: r.guests,

            baseAmount: r.baseAmount,
            // gstType: r.gstType,
            paymentCategory: r.paymentCategory,
            advancedAmount:
              r.paymentCategory === "Advanced" ? r.advancedAmount : 0,
            paymentMode: r.paymentMode,
            receivedBy: r.receivedBy,
            status: r.status,
          });
        });
      }

      try {
        const res = await fetch(`${API_BASE}/api/bookings/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookings: expandedBookings }),
        });

        const text = await res.text();

        let body;
        try {
          body = JSON.parse(text);
        } catch {
          console.error("Non-JSON response:", text);
          alert("Server error");
          return;
        }

        if (!res.ok) {
          alert(body.error || "Bulk booking failed");
          return;
        }

        alert("Bulk booking created ✅");

        await onSave(body.data);
        onClose();
      } catch (err) {
        console.error("Bulk request failed:", err);
        alert("Server error");
      }
    };

    /* ---------------- UI (UNCHANGED) ---------------- */
    return (
      <form onSubmit={handleBulkSubmit}>
        <>
          {rows.map((row, index) => (
            <div key={index} className="row g-3 mb-4">
              <div className="col-12 col-sm-6">
                <label>Guest Name</label>
                <input
                  className="form-control"
                  value={row.guest}
                  onChange={(e) => updateRow(index, "guest", e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Villa</label>
                <VillaMultiSelect
                  options={villaOptions.filter((v) => v !== "All Villas")}
                  value={row.villas}
                  onChange={(v) => updateRow(index, "villas", v)}
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Phone</label>
                <input
                  className="form-control"
                  value={row.phone}
                  onChange={(e) => updateRow(index, "phone", e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Check-in</label>
                <input
                  type="date"
                  className="form-control"
                  value={row.checkIn}
                  min={today}
                  onChange={(e) =>
                    updateRow(index, "checkIn", e.target.value)
                  }
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Check-out</label>
                <input
                  type="date"
                  className="form-control"
                  value={row.checkOut}
                  min={
                    row.checkIn
                      ? new Date(
                        new Date(row.checkIn).getTime() + 86400000
                      )
                        .toISOString()
                        .split("T")[0]
                      : today
                  }
                  onChange={(e) =>
                    updateRow(index, "checkOut", e.target.value)
                  }
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Nights</label>
                <input
                  className="form-control"
                  value={
                    Number.isFinite(row.nights) && row.nights > 0
                      ? `${row.nights} nights`
                      : ""
                  }
                  readOnly
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Guests</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={row.guests}
                  onChange={(e) => updateRow(index, "guests", e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Base Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={row.baseAmount}
                  onChange={(e) => updateRow(index, "baseAmount", e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Payment Mode</label>
                <select
                  className="form-select"
                  value={row.paymentMode}
                  onChange={(e) =>
                    updateRow(index, "paymentMode", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="col-12 col-sm-6">
                <label>Payment Category</label>
                <div>
                  <input
                    type="radio"
                    checked={row.paymentCategory === "Total"}
                    onChange={() =>
                      updateRow(index, "paymentCategory", "Total")
                    }
                  />{" "}
                  Total
                  <input
                    type="radio"
                    className="ms-3"
                    checked={row.paymentCategory === "Advanced"}
                    onChange={() =>
                      updateRow(index, "paymentCategory", "Advanced")
                    }
                  />{" "}
                  Advanced
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <label>Customer Payment (₹)</label>
                <input
                  className="form-control"
                  value={
                    row.paymentCategory === "Advanced"
                      ? Number.isFinite(row.advancedAmount)
                        ? row.advancedAmount
                        : 0
                      : Number.isFinite(row.totalAmount)
                        ? row.totalAmount
                        : 0
                  }
                  readOnly
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Total Amount</label>
                <input
                  className="form-control"
                  value={Number.isFinite(row.totalAmount) ? row.totalAmount : 0}
                  readOnly
                />
              </div>

              {row.paymentCategory === "Advanced" && (
                <>
                  <div className="col-12 col-sm-6">
                    <label>Advanced Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={row.advancedAmount}
                      onChange={(e) =>
                        updateRow(index, "advancedAmount", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label>Remaining</label>
                    <input
                      className="form-control"
                      value={
                        Number.isFinite(row.remainingAmount)
                          ? row.remainingAmount
                          : 0
                      }
                      readOnly
                    />
                  </div>
                </>
              )}

              <div className="col-12 col-sm-6">
                <label>Received By</label>
                <input
                  className="form-control"
                  value={row.receivedBy}
                  onChange={(e) =>
                    updateRow(index, "receivedBy", e.target.value)
                  }
                />
              </div>

              <div className="col-12 d-flex justify-content-between">
                {/* UI stays same */}
              </div>
            </div>
          ))}

          <div className="col-12 d-flex justify-content-end gap-2">
            {/* ✅ SAME BUTTON UI — only changed to submit */}
            <button type="submit" className="btn btn-success">
              Create Bulk Bookings
            </button>
          </div>
        </>
      </form>
    );
  };


  return (
    <div className="new-booking-overlay" role="dialog" aria-modal="true">
      <div className="new-booking-page">
        <div className="card p-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5>Create New Booking</h5>
              <small className="text-muted">
                {bookingMode === "single" ? "Single booking" : "Bulk booking"}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${bookingMode === "single" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setBookingMode("single")}
                >
                  Single
                </button>
                <button
                  type="button"
                  className={`btn ${bookingMode === "bulk" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setBookingMode("bulk")}
                >
                  Bulk
                </button>
              </div>
              <button className="btn-close" onClick={onClose} />
            </div>
          </div>

          {bookingMode === "single" ? (
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12 col-sm-6">
                <label>Guest Name</label>
                <input name="guest" value={formData.guest} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-12 col-sm-6">
                <label>Villa</label>
                <select
                  name="villa"
                  value={formData.villa}
                  onChange={handleChange}
                  className="form-select"
                >
                  {villaOptions.map((villa, index) => (
                    <option key={index} value={villa}>
                      {villa}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="col-12 col-sm-6">
              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control" />
            </div> */}

              <div className="col-12 col-sm-6">
                <label>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
              </div>

              <div className="col-12 col-sm-6">
                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="2" />
              </div>

              {/* <div className="col-12 col-sm-6">
              <label>Aadhar</label>
              <input name="aadhar" value={formData.aadhar} onChange={handleAadharChange} className="form-control" maxLength={14} />
              {formData.aadhar && formData.aadhar.replace(/\s/g, "").length !== 12 && (
                <small className="text-danger">Aadhar must be 12 digits</small>
              )}
            </div> */}

              <div className="col-12 col-sm-6">
                <label>Check-in</label>
                <input name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className="form-control" min={new Date().toISOString().split("T")[0]} />
              </div>

              <div className="col-12 col-sm-6">
                <label>Check-out</label>
                <input name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className="form-control" min={formData.checkIn ? new Date(new Date(formData.checkIn).getTime() + 86400000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} />
              </div>

              <div className="col-12 col-sm-6">
                <label>Nights</label>
                <input
                  className="form-control"
                  placeholder="Auto calculated"
                  value={formData.nights > 0 ? `${formData.nights} nights` : ""}
                  readOnly
                />

              </div>


              <div className="col-12 col-sm-6">
                <label>Guests</label>
                <input name="guests" type="number" min="1" value={formData.guests} onChange={handleChange} className="form-control" />
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
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="pcTotal" name="paymentCategory" value="Total" checked={formData.paymentCategory === "Total"} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="pcTotal">Total</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="pcAdv" name="paymentCategory" value="Advanced" checked={formData.paymentCategory === "Advanced"} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="pcAdv">Advanced</label>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6">
                <label>Customer Payment (₹)</label>
                <input
                  value={
                    formData.paymentCategory === "Advanced"
                      ? formData.advancedAmount
                      : formData.totalAmount
                  }
                  readOnly
                  className="form-control"
                />
              </div>

              {formData.paymentCategory === "Advanced" && (
                <>
                  <div className="col-12 col-sm-6">
                    <label>Advanced Amount (₹)</label>
                    <input name="advancedAmount" type="number" value={formData.advancedAmount} onChange={handleChange} className="form-control" />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label>Remaining (₹)</label>
                    <input
                      className="form-control"
                      value={Number.isFinite(formData.remainingAmount) ? formData.remainingAmount : 0}
                      readOnly
                    />
                  </div>
                </>
              )}

              <div className="col-12 col-sm-6">
                <label>Total Amount (auto)</label>
                <input
                  className="form-control"
                  value={Number.isFinite(formData.totalAmount) ? formData.totalAmount : 0}
                  readOnly
                />
              </div>

              <div className="col-12 col-sm-6">
                <label>Received By</label>
                <input name="receivedBy" value={formData.receivedBy} onChange={handleChange} className="form-control" />
              </div>

              {dateError && <div className="col-12"><small className="text-danger">{dateError}</small></div>}

              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-success">Create Booking</button>
              </div>
            </form>
          ) : (
            <BulkBookingForm
              villaOptions={villaOptions}
              onClose={onClose}
              onSave={onSave}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
