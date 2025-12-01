import express from "express";
import { getActivities } from "../controllers/activityController.js";

const router = express.Router();

// GET /api/activity
router.get("/", getActivities);

export default router;
