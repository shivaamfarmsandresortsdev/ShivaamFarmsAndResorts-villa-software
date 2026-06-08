// routes/checkinRoutes.js
import express from "express";
import { createCheckIn, getAllCheckIns } from "../controllers/checkinController.js";

const router = express.Router();

// POST /api/checkins → add a new check-in
router.post("/", createCheckIn);

// GET /api/checkins → fetch all check-ins
router.get("/", getAllCheckIns);

export default router;
