import { insertCheckIn, fetchAllCheckIns } from "../models/checkinModel.js";
import {supabase} from "../config/supabaseClient.js";

// ✅ Create a new check-in and mark booking as checked-in
export const createCheckIn = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      villa,
      guests,
      paymentMode,
      advance,
      balance,
      total,
      bookingId,
    } = req.body;

    // Map frontend keys to DB column names
    const mappedData = {
      first_name: firstName,
      last_name: lastName,
      phone,
      check_in: checkIn,
      check_out: checkOut,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      villa,
      guests,
      payment_mode: paymentMode,
      advance,
      balance,
      total,
      booking_id: bookingId || null,
    };

    console.log("🟢 Mapped check-in data:", mappedData);

    // 1️⃣ Insert new check-in record
    const inserted = await insertCheckIn(mappedData);
    console.log("✅ Check-in inserted successfully:", inserted);

    // 2️⃣ Update the corresponding booking to checked_in = true
    let updateError = null;

    if (bookingId) {
      console.log("🔹 Attempting to update booking by ID:", bookingId);
      const { error } = await supabase
        .from("bookings")
        .update({ checked_in: true })
        .eq("id", bookingId);

      updateError = error;
    }

    // Fallback if bookingId is missing or update failed
    if (!bookingId || updateError) {
      console.log(
        "🔹 Attempting fallback update using phone, check_in, and villa"
      );
      const { error } = await supabase
        .from("bookings")
        .update({ checked_in: true })
        .eq("phone", phone)
        .eq("check_in", checkIn)
        .eq("villa", villa);

      updateError = error;
    }

    if (updateError) {
      console.error("⚠️ Failed to update booking checked_in:", updateError);
    } else {
      console.log("✅ Booking marked as checked-in successfully");
    }

    // 3️⃣ Fetch all check-ins to return to frontend
    const allCheckIns = await fetchAllCheckIns();

    // 4️⃣ Respond back with inserted record and all check-ins
    res.status(201).json({ 
      success: true, 
      insertedCheckIn: inserted,
      allCheckIns 
    });

  } catch (error) {
    console.error("❌ Error inserting check-in:", error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to save check-in data.",
    });
  }
};

// ✅ Endpoint to fetch all check-ins separately
export const getAllCheckIns = async (req, res) => {
  try {
    const allCheckIns = await fetchAllCheckIns();
    res.status(200).json({ success: true, data: allCheckIns });
  } catch (error) {
    console.error("❌ Error fetching check-ins:", error.message || error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addCheckIn = async (req, res) => {
  try {
    const checkinData = req.body;

    // 1️⃣ Insert the check-in record
    const { data: insertedCheckIn, error: insertError } = await supabase
      .from("checkins")
      .insert([checkinData])
      .select();

    if (insertError) throw insertError;

    // 2️⃣ Mark the corresponding booking as checked_in
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ checked_in: true })
      .eq("id", checkinData.booking_id);

    if (updateError) throw updateError;

    res.status(200).json({
      message: "Check-in saved and booking marked as checked-in ✅",
      data: insertedCheckIn,
    });
  } catch (err) {
    console.error("❌ Failed to save check-in:", err);
    res.status(500).json({ error: "Failed to save check-in." });
  }
};

