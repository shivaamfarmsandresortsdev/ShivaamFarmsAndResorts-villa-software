// controllers/bookingController.js
import {
  insertBooking,
  fetchAllBookings,
  deleteBookingById,
  getBookingById,
  updateBookingById,
} from "../models/bookingModel.js";

const normalizeIncoming = (src = {}) => {
  return {
    id: src.id ?? src?.booking_id ?? null,

    guest: src.guest ?? src?.guest,
    email: src.email ?? src?.email,
    phone: src.phone ?? src?.phone,
    address: src.address ?? src?.address ?? null,
    aadhar: src.aadhar ?? src?.aadhar ?? null,

    villa: src.villa ?? src?.villa,
    checkIn: src.checkIn ?? src?.check_in ?? null,
    checkOut: src.checkOut ?? src?.check_out ?? null,
    nights: src.nights ?? src?.nights ?? null,
    guests: src.guests ?? src?.guests ?? 1,

    // financials (incoming may be baseAmount or amount)
    baseAmount: Number(src.baseAmount ?? src?.amount ?? src?.base_amount ?? 0) || 0,
    gstType: src.gstType ?? src?.gst_type ?? "",
    advancedAmount:
      Number(src.advancedAmount ?? src?.advanced_amount ?? 0) || 0,

    // optional client-provided total - controller will recalc and ignore client mismatch
    clientTotal: Number(src.totalAmount ?? src?.total_amount ?? 0) || 0,

    receivedBy: src.receivedBy ?? src?.received_by ?? null,
    paymentMode: src.paymentMode ?? src?.payment_mode ?? null,
    paymentCategory: src.paymentCategory ?? src?.payment_category ?? null,
    status: src.status ?? src?.status ?? null,
  };
};

const computeDerived = (booking) => {
  // GST rate
  let gstRate = 0;
  if (booking.gstType === "IGST (18%)") gstRate = 0.18;
  else if (booking.gstType === "CGST + SGST (9% + 9%)") gstRate = 0.18;
  else gstRate = 0; // default

  const baseAmount = Number(booking.baseAmount || 0);
  const gstAmount = +(baseAmount * gstRate).toFixed(2);
  let cgstAmount = 0,
    sgstAmount = 0,
    igstAmount = 0;
  if (booking.gstType === "CGST + SGST (9% + 9%)") {
    cgstAmount = +(gstAmount / 2).toFixed(2);
    sgstAmount = +(gstAmount / 2).toFixed(2);
  } else if (booking.gstType === "IGST (18%)") {
    igstAmount = gstAmount;
  }
  const totalAmount = +(baseAmount + gstAmount).toFixed(2);

  // nights calculation from dates (if provided)
  let nights = booking.nights ?? null;
  if (booking.checkIn && booking.checkOut) {
    const d1 = new Date(booking.checkIn);
    const d2 = new Date(booking.checkOut);
    if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
      nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    } else {
      nights = 0;
    }
  }

  // advanced and remaining
  const advancedAmount = Number(booking.advancedAmount ?? 0) || 0;
  const remainingAmount =
    booking.paymentCategory === "Advanced"
      ? Math.max(totalAmount - advancedAmount, 0)
      : 0;

  // status auto resolve
  const status =
    booking.paymentCategory === "Total" || remainingAmount === 0
      ? "Confirmed"
      : booking.status ?? "Pending";

  return {
    baseAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
    advancedAmount,
    remainingAmount,
    nights,
    status,
  };
};

/* Create booking */
export const addBooking = async (req, res) => {
  try {
    const incoming = normalizeIncoming(req.body);
    // sanitize aadhar
    if (incoming.aadhar) incoming.aadhar = String(incoming.aadhar).replace(/\s/g, "");

    const derived = computeDerived(incoming);

    // Prepare DB payload - snake_case
    const bookingData = {
      guest: incoming.guest,
      email: incoming.email,
      phone: incoming.phone ?? null,
      address: incoming.address ?? null,
      aadhar: incoming.aadhar ?? null,
      villa: incoming.villa,
      check_in: incoming.checkIn,
      check_out: incoming.checkOut,
      nights: derived.nights,
      guests: incoming.guests,

      base_amount: derived.baseAmount,
      gst_type: incoming.gstType,
      gst_amount: derived.gstAmount,
      cgst_amount: derived.cgstAmount,
      sgst_amount: derived.sgstAmount,
      igst_amount: derived.igstAmount,
      total_amount: derived.totalAmount,
      advanced_amount: derived.advancedAmount,
      remaining_amount: derived.remainingAmount,

      received_by: incoming.receivedBy ?? null,
      payment_mode: incoming.paymentMode ?? null,
      payment_category: incoming.paymentCategory ?? null,
      status: derived.status,
    };

    const { data, error } = await insertBooking(bookingData);
    if (error) throw error;

    res.status(200).json({ message: "Booking added", data });
  } catch (err) {
    console.error("Add booking error:", err.message || err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

/* Get all bookings */
export const getAllBookings = async (req, res) => {
  try {
    const { checked_in } = req.query;

    let { data, error } = await fetchAllBookings();
    if (error) {
      console.log("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }


    // filter server-side (already all data returned by model)
    if (checked_in === "false") {
      data = data.filter((b) => !b.checked_in);
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Fetch error:", err.message || err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

/* Delete booking */
export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined" || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid booking ID" });
  }

  try {
    const { error } = await deleteBookingById(Number(id));
    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err.message || err);
    res.status(500).json({ error: "Server error" });
  }
};

/* Get booking by id (for invoice / edit) */
export const generateInvoice = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) return res.status(400).json({ error: "Invalid ID" });

  try {
    const { data, error } = await getBookingById(Number(id));
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ booking: data });
  } catch (err) {
    console.error("Invoice error:", err.message || err);
    res.status(500).json({ error: "Server error" });
  }
};

/* Update booking */
export const updateBooking = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) return res.status(400).json({ error: "Invalid ID" });

  try {
    const incoming = normalizeIncoming(req.body);
    if (incoming.aadhar) incoming.aadhar = String(incoming.aadhar).replace(/\s/g, "");

    // fetch existing
    const { data: existing, error: fetchErr } = await getBookingById(Number(id));
    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ error: "Not found" });

    // merge existing (snake_case from DB) and incoming (camelCase)
    const merged = {
      ...existing,
      // add incoming with DB-like keys to not lose old snake_case values
      guest: incoming.guest ?? existing.guest,
      email: incoming.email ?? existing.email,
      phone: incoming.phone ?? existing.phone,
      address: incoming.address ?? existing.address,
      aadhar: incoming.aadhar ?? existing.aadhar,
      villa: incoming.villa ?? existing.villa,
      checkIn: incoming.checkIn ?? existing.check_in,
      checkOut: incoming.checkOut ?? existing.check_out,
      nights: incoming.nights ?? existing.nights,
      guests: incoming.guests ?? existing.guests,

      // financials - we will recalc strictly from baseAmount
      baseAmount: incoming.baseAmount ?? existing.base_amount,
      gstType: incoming.gstType ?? existing.gst_type,
      advancedAmount: incoming.advancedAmount ?? existing.advanced_amount,

      receivedBy: incoming.receivedBy ?? existing.received_by,
      paymentMode: incoming.paymentMode ?? existing.payment_mode,
      paymentCategory: incoming.paymentCategory ?? existing.payment_category,
      status: incoming.status ?? existing.status,
    };

    // Compute derived values
    const derived = computeDerived(merged);

    // Prepare update payload (snake_case)
    const updateData = {
      guest: merged.guest,
      email: merged.email,
      phone: merged.phone ?? null,
      address: merged.address ?? null,
      aadhar: merged.aadhar ?? null,
      villa: merged.villa,
      check_in: merged.checkIn,
      check_out: merged.checkOut,
      nights: derived.nights,
      guests: merged.guests,

      base_amount: derived.baseAmount,
      gst_type: merged.gstType,
      gst_amount: derived.gstAmount,
      cgst_amount: derived.cgstAmount,
      sgst_amount: derived.sgstAmount,
      igst_amount: derived.igstAmount,
      total_amount: derived.totalAmount,
      advanced_amount: derived.advancedAmount,
      remaining_amount: derived.remainingAmount,

      received_by: merged.receivedBy ?? null,
      payment_mode: merged.paymentMode ?? null,
      payment_category: merged.paymentCategory ?? null,
      status: derived.status,
    };

    const { data, error } = await updateBookingById(Number(id), updateData);
    if (error) throw error;

    res.status(200).json({ message: "Updated", data });
  } catch (err) {
    console.error("Update booking error:", err.message || err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

// Get booked date ranges for a specific villa
export const getBookedDates = async (req, res) => {
  const { villa } = req.params;

  if (!villa) {
    return res.status(400).json({ error: "Villa name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("check_in, check_out")
      .eq("villa", villa);

    if (error) throw error;

    res.status(200).json({ data });  // returns an array like:
    // [{ check_in: "2025-02-10", check_out: "2025-02-13" }, ...]
  } catch (err) {
    console.error("getBookedDates error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get ALL bookings for a specific villa
export const getBookingsByVilla = async (req, res) => {
  const { villa } = req.params;

  if (!villa) {
    return res.status(400).json({ error: "Villa name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("villa", villa);

    if (error) throw error;

    res.status(200).json({ data });
  } catch (err) {
    console.error("getBookingsByVilla error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
