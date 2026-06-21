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
  getBulkBookingById,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// ── Read (all authenticated roles) ───────────────────────────────────────────
router.get("/", authenticate, getAllBookings);
router.get("/bulk/:bulk_id", authenticate, getBulkBookingById);
router.get("/villa/:villa/dates", authenticate, getBookedDates);
router.get("/villa/:villa", authenticate, getBookingsByVilla);

// Invoice: all authenticated roles
router.get("/:id/invoice", authenticate, generateInvoice);

// ── Create (all roles) ────────────────────────────────────────────────────────
router.post("/", authenticate, addBooking);
router.post("/bulk", authenticate, addBulkBookings);

// ── Update (admin + manager only) ─────────────────────────────────────────────
router.put("/bulk/:bulk_id", authenticate, authorize("admin", "manager"), updateBulkBooking);
router.put("/:id", authenticate, authorize("admin", "manager"), updateBooking);

// ── Delete (admin only) ───────────────────────────────────────────────────────
router.delete("/bulk/:bulk_id", authenticate, authorize("admin"), deleteBulkBooking);
router.delete("/:id", authenticate, authorize("admin"), deleteBooking);

export default router;
