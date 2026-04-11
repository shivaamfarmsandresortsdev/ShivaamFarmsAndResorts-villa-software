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

  // ---------------- GENERATE PDF ----------------
  const generateInvoicePDF = () => {
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

    return doc;
  };

  const handleDownload = () => {
    const doc = generateInvoicePDF();
    doc.save(
      `Invoice_${normalizedBooking.guest}_${normalizedBooking.villas.length}_Villas.pdf`
    );
  };

  const handleWhatsAppShare = async () => {
    const doc = generateInvoicePDF();
    const pdfBlob = doc.output("blob");
    const fileName = `Invoice_${normalizedBooking.guest}.pdf`;
    
    const villasText = normalizedBooking.villas.join(", ");
    const message = `INVOICE: SHIVAAM FARMS & RESORTS\n\nDear ${normalizedBooking.guest},\n\nThank you for choosing Shivaam Farms & Resorts. Here are your booking details:\n\n🏡 Villas: ${villasText}\n📅 Check-in: ${new Date(normalizedBooking.checkIn).toLocaleDateString()}\n📅 Check-out: ${new Date(normalizedBooking.checkOut).toLocaleDateString()}\n👥 Guests: ${normalizedBooking.guests}\n💰 Total Amount: ₹${normalizedBooking.amount.toFixed(2)}\n💳 Payment Mode: ${normalizedBooking.paymentMode}\n\nPlease find the attached invoice PDF for your records.\n\nThank you for visiting!`;

    const file = new File([pdfBlob], fileName, { type: "application/pdf" });

    // Simple check to detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Use system sharing ONLY on mobile (best for PDF files)
    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Invoice - Shivaam Farms & Resorts",
          text: message,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          fallbackWhatsAppLink(message);
        }
      }
    } else {
      // Direct WhatsApp Web link for desktop browsers
      fallbackWhatsAppLink(message);
    }
  };

  const fallbackWhatsAppLink = (message) => {
    // Clean non-digits
    const phone = normalizedBooking.phone.replace(/\D/g, "");
    
    // Add country code if it's a 10-digit number (common in India)
    let formattedPhone = phone;
    if (phone.length === 10) {
      formattedPhone = "91" + phone;
    }

    // Using api.whatsapp.com/send is more reliable for desktop browser chat pre-filling
    const whatsappUrl = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    // Create an anchor element and click it (more reliable than window.open in some browsers)
    const link = document.createElement("a");
    link.href = whatsappUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <div className="text-center mt-4 d-flex justify-content-center gap-3 invoice-actions">
          <button className="btn btn-success" onClick={handleDownload}>
            ⬇️ Download Invoice
          </button>
          <button className="btn btn-whatsapp" onClick={handleWhatsAppShare}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              className="bi bi-whatsapp me-2"
              viewBox="0 0 16 16"
              style={{ verticalAlign: "middle", marginBottom: "3px" }}
            >
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.965l-1.127 4.12 4.215-1.106a7.857 7.857 0 0 0 3.793.974h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
