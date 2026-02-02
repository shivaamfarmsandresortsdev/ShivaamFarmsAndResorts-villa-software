import React from "react";
import jsPDF from "jspdf";
import "./Invoice.css";

const Invoice = ({ booking, onClose }) => {
  if (!booking) return null;

  // ✅ Normalize booking fields (SAFE VERSION)
  const normalizedBooking = {
    guest:
      booking.guest ||
      `${booking.firstName || ""} ${booking.lastName || ""}`.trim(),

    phone: booking.phone || "-",

    villas: Array.isArray(booking.villas)
      ? booking.villas
      : booking.villa
      ? [booking.villa]
      : [],

    checkIn: booking.checkIn || booking.check_in,
    checkOut: booking.checkOut || booking.check_out,

    amount:
      Number(booking.base_amount) ||
      Number(booking.totalAmount) ||
      Number(booking.total_amount) ||
      0,

    paymentMode:
      booking.payment_mode || booking.paymentMode || "Cash",

    receivedBy:
      booking.received_by || booking.receivedBy || "Admin",

    guests: booking.guests || 1,
  };

  const company = {
    name: "SHIVAAM FARMS & RESORTS",
    address: "01, AB, Green Planet , Omkar Nagar",
    phone: "+91 7387750307",
    email: "shivaamfarmsandresorts@gmail.com",
  };

  // ---------------- PDF DOWNLOAD ----------------
  const handleDownload = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    /* WATERMARK */
    doc.setFontSize(30);
    doc.setTextColor(220, 220, 220);
    doc.text("SHIVAAM FARMS & RESORTS", pageWidth / 2, 160, {
      align: "center",
      angle: 45,
    });

    /* HEADER */
    doc.setTextColor(0, 100, 0);
    doc.setFontSize(18);
    doc.text(company.name, 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(company.address, 15, 26);
    doc.text(`${company.phone} | ${company.email}`, 15, 31);

    doc.text(`Date: ${new Date().toLocaleString()}`, pageWidth - 80, 20);
    doc.text(
      `Check-in: ${new Date(normalizedBooking.checkIn).toLocaleDateString()}`,
      pageWidth - 80,
      26
    );
    doc.text(
      `Check-out: ${new Date(normalizedBooking.checkOut).toLocaleDateString()}`,
      pageWidth - 80,
      32
    );
    doc.text(`Guests: ${normalizedBooking.guests}`, pageWidth - 80, 38);

    /* GUEST DETAILS */
    let y = 48;
    doc.setFontSize(11);
    doc.text(`Guest: ${normalizedBooking.guest}`, 15, y);
    y += 6;
    doc.text(`Phone: ${normalizedBooking.phone}`, 15, y);
    y += 6;
    doc.text("Villas:", 15, y);
    y += 6;

    normalizedBooking.villas.forEach((v) => {
      doc.text(`• ${v}`, 18, y);
      y += 5;
    });

    /* TABLE HEADER */
    y += 8;
    doc.setFillColor(212, 237, 218);
    doc.rect(15, y, pageWidth - 30, 8, "F");
    doc.text("Description", 20, y + 6);
    doc.text("Rate (Rs.)", 100, y + 6);
    doc.text("Qty", 140, y + 6);
    doc.text("Subtotal (Rs.)", 165, y + 6);

    /* ITEM ROW */
    y += 14;
    doc.text("Villa Booking", 20, y);
    doc.text(`Rs. ${normalizedBooking.amount.toFixed(2)}`, 100, y);
    doc.text("1", 142, y);
    doc.text(`Rs. ${normalizedBooking.amount.toFixed(2)}`, 165, y);

    /* GRAND TOTAL */
    y += 15;
    doc.setFillColor(220, 237, 247);
    doc.rect(15, y, pageWidth - 30, 8, "F");
    doc.text("Grand Total", 20, y + 6);
    doc.text(`Rs. ${normalizedBooking.amount.toFixed(2)}`, 165, y + 6);

    /* PAYMENT */
    y += 16;
    doc.text(`Payment Mode: ${normalizedBooking.paymentMode}`, 15, y);
    y += 6;
    doc.text(`Received By: ${normalizedBooking.receivedBy}`, 15, y);

    /* TERMS */
    y += 12;
    doc.setFontSize(10);
    doc.text("Terms and Conditions:", 15, y);
    y += 6;

    doc.text(
      [
        "1. Check-in time is 1:00 PM and check-out time is 11:00 AM.",
        "2. Guests are responsible for any damages during stay.",
        "3. Outside food delivery is not allowed.",
        "4. Loud music not allowed after 10:00 PM.",
        "5. Pool usage at guest's own risk.",
      ],
      15,
      y
    );

    /* FOOTER */
    doc.text("Thank you for visiting!", pageWidth / 2, 290, {
      align: "center",
    });

    doc.save(
      `Invoice_${normalizedBooking.guest}_${normalizedBooking.villas.length}_Villas.pdf`
    );
  };

  return (
    <div className="invoice-overlay">
      <div className="invoice-container shadow p-4">
        <div className="d-flex justify-content-between mb-3">
          <h4 className="text-success fw-bold">Invoice</h4>
          <button className="btn btn-outline-danger" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <h5 className="text-center text-success">{company.name}</h5>
        <p className="text-center small">{company.address}</p>

        <div className="row mb-3">
          <div className="col-md-6">
            <p>
              <strong>Guest:</strong> {normalizedBooking.guest}
            </p>
            <p>
              <strong>Phone:</strong> {normalizedBooking.phone}
            </p>
            <p>
              <strong>Villas:</strong>
            </p>
            {normalizedBooking.villas.map((v, i) => (
              <div key={i}>🏠 {v}</div>
            ))}
          </div>

          <div className="col-md-6 text-md-end">
            <p>
              <strong>Check-in:</strong>{" "}
              {new Date(normalizedBooking.checkIn).toLocaleDateString()}
            </p>
            <p>
              <strong>Check-out:</strong>{" "}
              {new Date(normalizedBooking.checkOut).toLocaleDateString()}
            </p>
            <p>
              <strong>Guests:</strong> {normalizedBooking.guests}
            </p>
          </div>
        </div>

        <table className="table table-bordered text-center">
          <thead className="table-success">
            <tr>
              <th>Description</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Villa Booking</td>
              <td>{normalizedBooking.amount}</td>
              <td>1</td>
              <td>{normalizedBooking.amount}</td>
            </tr>
          </tbody>
        </table>

        <p className="fw-bold text-end">
          Grand Total: ₹{normalizedBooking.amount.toFixed(2)}
        </p>

        <p>
          <strong>Payment Mode:</strong> {normalizedBooking.paymentMode}
        </p>
        <p>
          <strong>Received By:</strong> {normalizedBooking.receivedBy}
        </p>

        <div className="text-center mt-4">
          <button className="btn btn-success" onClick={handleDownload}>
            ⬇️ Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
