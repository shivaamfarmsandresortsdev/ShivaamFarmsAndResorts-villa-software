import express from "express";
import {
  addBooking,
  getAllBookings,
  deleteBooking,
  generateInvoice,
  getBookedDates,
  getBookingsByVilla,
  updateBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// Create
router.post("/", addBooking);

// Read all
router.get("/", getAllBookings);

// Invoice (specific route - must come BEFORE /:id)
router.get("/:id/invoice", generateInvoice);

// Get booked dates for a specific villa
router.get("/villa/:villa/dates", getBookedDates);

// Get all bookings for a villa
router.get("/villa/:villa", getBookingsByVilla);

// Update
router.put("/:id", updateBooking);

// Delete
router.delete("/:id", deleteBooking);

export default router;
