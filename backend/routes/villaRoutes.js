import express from "express";
import {
  getAllVillas,
  addVilla,
  updateVilla,
  deleteVilla,
} from "../controllers/villaController.js";

const router = express.Router();

// GET all villas
router.get("/", getAllVillas);

// CREATE villa
router.post("/", addVilla);

// UPDATE villa
router.put("/:id", updateVilla);

// DELETE villa
router.delete("/:id", deleteVilla);

export default router;
