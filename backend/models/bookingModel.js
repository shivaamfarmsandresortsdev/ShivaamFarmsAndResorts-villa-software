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
  return await supabase.from("bookings").select("*");
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
