// models/bookingModel.js
import {supabase} from "../config/supabaseClient.js";

/**
 * Simple wrappers - controller does all calculation/sanitization.
 * insertBooking and updateBookingById return the inserted/updated record (.select().single())
 */

export const insertBooking = async (bookingData) => {
  // bookingData must be DB-ready (snake_case)
  return await supabase.from("bookings").insert([bookingData]).select().single();
};

export const fetchAllBookings = async () => {
  const pageSize = 1000;
  let allRows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) return { data: allRows, error };
    if (!data || data.length === 0) break;

    allRows = allRows.concat(data);
    if (data.length < pageSize) break; // last page reached

    from += pageSize;
  }

  return { data: allRows, error: null };
};

export const deleteBookingById = async (id) => {
  return await supabase.from("bookings").delete().eq("id", id);
};

export const getBookingById = async (id) => {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
  return { data, error };
};

export const updateBookingById = async (id, bookingData) => {
  // bookingData should be snake_case and contain columns to update
  return await supabase.from("bookings").update(bookingData).eq("id", id).select().single();
};
