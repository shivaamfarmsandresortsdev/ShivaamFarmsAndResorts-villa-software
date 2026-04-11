// controllers/bookingController.js
import { supabase } from "../config/supabaseClient.js";
import {
  insertBooking,
  fetchAllBookings,
  deleteBookingById,
  getBookingById,
  updateBookingById,
} from "../models/bookingModel.js";
import { randomUUID } from "crypto";

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
    const { data = [], error } = await fetchAllBookings();
    if (error) {
      console.error("FETCH ERROR:", error);
      return res.status(500).json({ data: [] });
    }
    console.log("FETCHED BOOKINGS:", data);


    const grouped = Object.values(
      (data || []).reduce((acc, b) => {
        const key = b.bulk_id || `single-${b.id}`;

        if (!acc[key]) {
          acc[key] = {
            booking_id: key,
            bulk_id: b.bulk_id || null,

            guest: b.guest,
            phone: b.phone,
            address: b.address,

            check_in: b.check_in,
            check_out: b.check_out,
            nights: b.nights,
            guests: b.guests,

            villas: [],

            // ✅ MONEY FIELDS YOU CARE ABOUT
            base_amount: 0,
            total_amount: 0,
            advanced_amount: 0,
            remaining_amount: 0,

            payment_mode: b.payment_mode,
            payment_category: b.payment_category,
            received_by: b.received_by,

            status: b.status,
            created_at: b.created_at,
          };
        }

        acc[key].villas.push(b.villa);

        acc[key].base_amount += Number(b.base_amount || 0);
        acc[key].total_amount += Number(b.total_amount || 0);
        acc[key].advanced_amount += Number(b.advanced_amount || 0);
        acc[key].remaining_amount += Number(b.remaining_amount || 0);

        return acc;
      }, {})
    );

    res.status(200).json({ data: grouped });
  } catch (err) {
    console.error("Fetch bookings error:", err);
    res.status(500).json({ error: "Server error" });
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

/* Bulk create bookings */
/* Bulk create bookings */
export const addBulkBookings = async (req, res) => {
  try {
    const { bookings } = req.body;

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ error: "Invalid bookings array" });
    }

    const bulk_id = randomUUID();

    const rows = bookings.map((b) => {
      // GST calculation
      const base = Number(b.baseAmount || 0);
      let gstRate = 0;

      if (b.gstType === "IGST (18%)") gstRate = 0.18;
      if (b.gstType === "CGST + SGST (9% + 9%)") gstRate = 0.18;

      const gstAmount = +(base * gstRate).toFixed(2);

      let cgst = 0, sgst = 0, igst = 0;
      if (b.gstType === "CGST + SGST (9% + 9%)") {
        cgst = +(gstAmount / 2).toFixed(2);
        sgst = +(gstAmount / 2).toFixed(2);
      } else if (b.gstType === "IGST (18%)") {
        igst = gstAmount;
      }

      const total = +(base + gstAmount).toFixed(2);
      const advance = Number(b.advancedAmount || 0);
      const remaining =
        b.paymentCategory === "Advanced"
          ? Math.max(total - advance, 0)
          : 0;

      return {
        bulk_id,

        guest: b.guest,
        phone: b.phone || null,
        villa: b.villa,

        check_in: b.checkIn,
        check_out: b.checkOut,
        nights: b.nights,
        guests: b.guests,

        base_amount: base,
        gst_type: b.gstType,
        gst_amount: gstAmount,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_amount: total,
        advanced_amount: advance,
        remaining_amount: remaining,

        payment_mode: b.paymentMode,
        payment_category: b.paymentCategory,
        received_by: b.receivedBy,

        status:
          b.paymentCategory === "Total" || remaining === 0
            ? "Confirmed"
            : "Pending",
      };
    });

    const { data, error } = await supabase
      .from("bookings")
      .insert(rows)
      .select();

    if (error) {
      console.error("Supabase bulk error:", error);
      throw error;
    }

    res.status(200).json({ data });
  } catch (err) {
    console.error("Bulk insert failed:", err.message || err);
    res.status(500).json({ error: err.message || "Bulk booking failed" });
  }
};

/* Delete bulk booking */
export const deleteBulkBooking = async (req, res) => {
  console.log("🔥 BULK DELETE HIT", req.params.bulk_id);
  const { bulk_id } = req.params;

  if (!bulk_id) {
    return res.status(400).json({ error: "Invalid bulk ID" });
  }

  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("bulk_id", bulk_id);

    if (error) {
      console.error("Bulk delete error:", error);
      return res.status(500).json({ error: "Bulk delete failed" });
    }

    res.status(200).json({ message: "Bulk booking deleted successfully" });
  } catch (err) {
    console.error("Bulk delete exception:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= BULK UPDATE BOOKINGS ================= */
export const updateBulkBooking = async (req, res) => {
  const { bulk_id } = req.params;
  const payload = req.body;

  if (!bulk_id) {
    return res.status(400).json({ error: "Invalid bulk ID" });
  }

  if (!Array.isArray(payload.bookings) || payload.bookings.length === 0) {
    return res.status(400).json({ error: "Bookings array required" });
  }

  try {
    // 1️⃣ Update COMMON fields for all rows in bulk
    const baseAmount = Number(payload.baseAmount || 0);
    const advancedAmount = Number(payload.advancedAmount || 0);

    const remainingAmount =
      payload.paymentCategory === "Advanced"
        ? Math.max(baseAmount - advancedAmount, 0)
        : 0;

    const status =
      payload.paymentCategory === "Total" || remainingAmount === 0
        ? "Confirmed"
        : payload.status || "Pending";

    const commonUpdate = {
      check_in: payload.checkIn,
      check_out: payload.checkOut,
      base_amount: baseAmount,
      advanced_amount: advancedAmount,
      remaining_amount: remainingAmount,
      payment_category: payload.paymentCategory,
      payment_mode: payload.paymentMode,
      received_by: payload.receivedBy,
      status,
    };

    const { error: commonErr } = await supabase
      .from("bookings")
      .update(commonUpdate)
      .eq("bulk_id", bulk_id);

    if (commonErr) throw commonErr;

    // 2️⃣ Update each guest row individually
    for (const b of payload.bookings) {
      if (!b.id) continue;

      const { error } = await supabase
        .from("bookings")
        .update({
          guest: b.guest,
          phone: b.phone ?? null,
          address: b.address ?? null,
          villa: b.villa,
        })
        .eq("id", b.id);

      if (error) throw error;
    }

    res.status(200).json({
      message: "Bulk booking updated successfully",
    });
  } catch (err) {
    console.error("Bulk update failed:", err.message || err);
    res.status(500).json({ error: "Bulk update failed" });
  }
};

export const getBulkBookingById = async (req, res) => {
  try {
    const { bulk_id } = req.params;

    // ✅ fetch bulk bookings rows (all bookings belonging to that bulk)
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("bulk_id", bulk_id)
      .order("check_in", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Bulk booking not found" });
    }

    // ✅ build response like your frontend expects
    const bulk = {
      bulk_id,
      checkIn: data[0].check_in,
      checkOut: data[0].check_out,
      baseAmount: data.reduce((sum, b) => sum + Number(b.base_amount || 0), 0),
      advancedAmount: data.reduce((sum, b) => sum + Number(b.advanced_amount || 0), 0),
      remainingAmount: data.reduce((sum, b) => sum + Number(b.remaining_amount || 0), 0),
      paymentCategory: data[0].payment_category,
      paymentMode: data[0].payment_mode,
      receivedBy: data[0].received_by,
      status: data[0].status,
      villas: data.map((b) => b.villa),
      bookings: data,
    };

    return res.json({ data: bulk });
  } catch (err) {
    console.error("getBulkBookingById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
