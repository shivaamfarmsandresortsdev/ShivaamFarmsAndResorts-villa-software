// routes/checkinRoutes.js
import express from "express";
import { createCheckIn, getAllCheckIns } from "../controllers/checkinController.js";

const router = express.Router();

// POST → to add a new check-in
router.post("/", createCheckIn);

// GET → to fetch all check-ins
router.get("/", getAllCheckIns);

// GET /api/bookings
router.get("/", async (req, res) => {
  const { checked_in } = req.query;

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("checked_in", checked_in === "true" ? true : false)
      .neq("status", "Pending"); // ✅ filter out pending bookings

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


export default router;
