import express from "express";
import {
  addBooking,
  addBulkBookings,
  getAllBookings,
  deleteBulkBooking,
  deleteBooking,
  generateInvoice,
  getBookedDates,
  getBookingsByVilla,
  updateBooking,
  updateBulkBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// Create
router.post("/", addBooking);
router.post("/bulk", addBulkBookings);

// Read
router.get("/", getAllBookings);

// Invoice
router.get("/:id/invoice", generateInvoice);

// Villa-based
router.get("/villa/:villa/dates", getBookedDates);
router.get("/villa/:villa", getBookingsByVilla);

// 🔥 BULK UPDATE (FIXED)
router.put("/bulk/:bulk_id", updateBulkBooking);

// Update single
router.put("/:id", updateBooking);

// Delete
router.delete("/bulk/:bulk_id", deleteBulkBooking);
router.delete("/:id", deleteBooking);

export default router;
