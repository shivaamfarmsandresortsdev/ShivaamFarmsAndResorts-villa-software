import express from "express";
import {
  getAllVillas,
  addVilla,
  updateVilla,
  deleteVilla,
} from "../controllers/villaController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Read: all authenticated roles (staff needs villa list for booking)
router.get("/", authenticate, getAllVillas);

// Create + Update: admin and manager
router.post("/", authenticate, authorize("admin", "manager"), addVilla);
router.put("/:id", authenticate, authorize("admin", "manager"), updateVilla);

// Delete: admin only
router.delete("/:id", authenticate, authorize("admin"), deleteVilla);

export default router;
