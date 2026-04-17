import React, { useEffect, useState } from "react";
import axios from "axios";

const RecentTransactions = ({ transactions: transactionsProp }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    if (transactionsProp) {
      setTransactions(transactionsProp);
      setFilteredTransactions(transactionsProp);
    }
  }, [transactionsProp]);

  useEffect(() => {
    if (transactionsProp) return; // Skip fetch if data is provided via props
    let stockData = [];
    // let bookingData = [];

    axios
      .get("https://shivaamfarmsandresorts-villa-software-1.onrender.com/api/stocks")
      .then((res) => {
        if (Array.isArray(res.data)) {
          stockData = res.data.map((item) => ({
            description: `${item.itemname || "Unnamed"} | ${item.villa || "N/A"} | ${item.category || "N/A"}`,
            date: item.date || new Date().toISOString(),
            type: "loss",
            status: "completed",
            receivedBy: item.received_by || "Unknown",
            paymentMode: item.payment_mode || "Cash",
            paymentCategory: "Total",
            source: "Stock",
            advancedAmount: 0,
            remainingAmount: 0,
            // gst_type: "-",
            // gst_amount: 0,
            // cgst_amount: 0,
            // sgst_amount: 0,
            // igst_amount: 0,
            total_amount: Number(item.price) || 0, // still keeping total_amount for summary
          }));
        }
        return axios.get("https://shivaamfarmsandresorts-villa-software-1.onrender.com/api/bookings");
      })
      .then((res) => {
        const bookingArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];

        // ✅ 1. GROUP BOOKINGS (bulk-aware)
        const bookingMap = new Map();

        bookingArray.forEach((row) => {
          const key = row.bulk_id || row.id; // 👈 SAME logic as Booking table

          if (!bookingMap.has(key)) {
            bookingMap.set(key, {
              guest: row.guest,
              villas: [],
              date: row.checkIn || row.created_at,

              advancedAmount: Number(row.advanced_amount) || 0,
              remainingAmount: Number(row.remaining_amount) || 0,
              customerPayment: Number(row.totalAmount || row.total_amount) || 0,

              gst_type: row.gst_type || "-",
              gst_amount: Number(row.gst_amount) || 0,
              cgst_amount: Number(row.cgst_amount) || 0,
              sgst_amount: Number(row.sgst_amount) || 0,
              igst_amount: Number(row.igst_amount) || 0,

              status: row.status,
              receivedBy: row.received_by,
              paymentMode: row.payment_mode,
            });
          }

          // 👇 merge villas like Booking table
          const entry = bookingMap.get(key);
          if (row.villa) entry.villas.push(row.villa);
        });


        // ✅ 2. CONVERT bookingMap → bookingData  👈 YOUR CODE GOES HERE
        const bookingData = Array.from(bookingMap.values()).map((b) => ({
          description: `${b.guest} | ${b.villas.join(", ")}`,
          date: b.date,

          advancedAmount: b.advancedAmount,
          remainingAmount: b.remainingAmount,

          type: "profit",
          source: "Booking",

          status: b.status,
          receivedBy: b.receivedBy,
          paymentMode: b.paymentMode,

          paymentCategory:
            b.advancedAmount > 0
              ? "Advanced"
              : b.remainingAmount > 0
                ? "Remaining"
                : "Total",

          gst_type: b.gst_type,
          gst_amount: b.gst_amount,
          cgst_amount: b.cgst_amount,
          sgst_amount: b.sgst_amount,
          igst_amount: b.igst_amount,

          total_amount: b.customerPayment, // ✅ ONCE PER BULK
        }));


        // ✅ 3. COMBINE WITH STOCK DATA
        const combined = [...stockData, ...bookingData].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setTransactions(combined);
        setFilteredTransactions(combined);
      })

      .catch((err) => console.error("Error fetching stock/booking data:", err));
  }, []);

  const getAmountStyle = (type) =>
    type === "profit" ? "text-success fw-bold" : "text-danger fw-bold";

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="badge bg-success-subtle text-success">{status}</span>;
      case "pending":
        return <span className="badge bg-secondary">{status}</span>;
      case "failed":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const applyFilters = (from, to, category) => {
    let filtered = [...transactions];
    if (from) filtered = filtered.filter((t) => new Date(t.date) >= new Date(from));
    if (to) filtered = filtered.filter((t) => new Date(t.date) <= new Date(to));
    if (category !== "All") filtered = filtered.filter((t) => t.paymentCategory === category);
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    applyFilters(value, toDate, paymentCategoryFilter);
  };
  const handleToDateChange = (value) => {
    setToDate(value);
    applyFilters(fromDate, value, paymentCategoryFilter);
  };
  const handlePaymentCategoryFilterChange = (value) => {
    setPaymentCategoryFilter(value);
    applyFilters(fromDate, toDate, value);
  };

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">Recent Transactions</h5>
          <small className="text-muted">Stock + Booking Transactions</small>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mt-2 mt-md-0 w-100 justify-content-between">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <label className="me-2 fw-semibold">From:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="me-2 fw-semibold">To:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="me-2 fw-semibold">Category:</label>
              <select
                className="form-select form-select-sm"
                value={paymentCategoryFilter}
                onChange={(e) => handlePaymentCategoryFilterChange(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Advanced">Advanced</option>
                <option value="Remaining">Remaining</option>
                <option value="Total">Total</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Source</th>
                <th>Description</th>
                <th>Date</th>
                {/* Removed Amount column */}
                <th>Advanced Amount</th>
                <th>Remaining Amount</th>
                <th>Status</th>
                <th>Received By</th>
                <th>Payment Mode</th>
                <th>Payment Category</th>
                {/* <th>GST Type</th>
                <th>GST Amount</th>
                <th>CGST Amount</th>
                <th>SGST Amount</th>
                <th>IGST Amount</th> */}
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((row, index) => (
                <tr key={index}>
                  <td>{row.source}</td>
                  <td>{row.description}</td>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td className="text-end">₹ {row.advancedAmount.toLocaleString()}</td>
                  <td className="text-end">₹ {row.remainingAmount.toLocaleString()}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>{row.receivedBy}</td>
                  <td>{row.paymentMode}</td>
                  <td>{row.paymentCategory}</td>
                  <td className={`text-end ${getAmountStyle(row.type)}`}>
                    ₹ {(row.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}

              {currentTransactions.length > 0 && (
                <>
                  {/* GRAND TOTAL */}
                  <tr className="table-light fw-bold border-top">
                    <td colSpan="9" className="text-end">
                      Grand Total
                    </td>
                    <td className="text-end">
                      ₹ {(
                        currentTransactions.reduce(
                          (sum, t) => sum + (t.source === "Booking" ? t.total_amount || 0 : 0),
                          0
                        ) -
                        currentTransactions.reduce(
                          (sum, t) => sum + (t.source === "Stock" ? t.total_amount || 0 : 0),
                          0
                        )
                      ).toLocaleString()}
                    </td>
                  </tr>

                  {/* ONLINE */}
                  <tr className="table-light fw-bold">
                    <td colSpan="9" className="text-end">
                      Online Transactions (Booking / Stock)
                    </td>
                    <td className="text-end">
                      ₹ {currentTransactions
                        .filter(t => t.paymentMode === "Online" && t.source === "Booking")
                        .reduce((s, t) => s + (t.total_amount || 0), 0)
                        .toLocaleString()}
                      {" / "}
                      ₹ {currentTransactions
                        .filter(t => t.paymentMode === "Online" && t.source === "Stock")
                        .reduce((s, t) => s + (t.total_amount || 0), 0)
                        .toLocaleString()}
                    </td>
                  </tr>

                  {/* CASH */}
                  <tr className="table-light fw-bold">
                    <td colSpan="9" className="text-end">
                      Cash Transactions (Booking / Stock)
                    </td>
                    <td className="text-end">
                      ₹ {currentTransactions
                        .filter(t => t.paymentMode === "Cash" && t.source === "Booking")
                        .reduce((s, t) => s + (t.total_amount || 0), 0)
                        .toLocaleString()}
                      {" / "}
                      ₹ {currentTransactions
                        .filter(t => t.paymentMode === "Cash" && t.source === "Stock")
                        .reduce((s, t) => s + (t.total_amount || 0), 0)
                        .toLocaleString()}
                    </td>
                  </tr>
                </>
              )}

              {currentTransactions.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-3">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center py-3 flex-wrap gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm btn-outline-primary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
