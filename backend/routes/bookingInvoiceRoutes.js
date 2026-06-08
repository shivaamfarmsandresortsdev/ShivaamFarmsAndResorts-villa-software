import express from "express";
import { sendBookingInvoiceToWhatsApp } from "../controllers/bookingInvoiceController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Only admin and manager can generate/send invoices
router.post(
  "/booking/send-invoice/:bookingId",
  authenticate,
  authorize("admin", "manager"),
  sendBookingInvoiceToWhatsApp
);

export default router;
