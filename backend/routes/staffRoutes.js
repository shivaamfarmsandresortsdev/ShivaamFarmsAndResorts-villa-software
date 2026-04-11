import express from "express";
import {
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
} from "../services/staffService.js";

const router = express.Router();

// GET all staff
router.get("/", async (req, res) => {
    try {
        const staff = await getStaff();
        res.json(staff);
    } catch (err) {
        console.error("GET /staff error:", err);
        res.status(500).json({
            message: "Failed to fetch staff",
            error: err.message || String(err),
        });
    }
});

// ADD staff
router.post("/", async (req, res) => {
    try {
        const newStaff = await addStaff(req.body);
        res.status(201).json(newStaff);
    } catch (err) {
        console.error("POST /staff error:", err);
        res.status(500).json({
            message: "Failed to add staff",
            error: err.message || String(err),
        });
    }
});

// UPDATE staff
router.put("/:id", async (req, res) => {
    try {
        const updated = await updateStaff(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("PUT /staff/:id error:", err);
        res.status(500).json({
            message: "Failed to update staff",
            error: err.message || String(err),
        });
    }
});

// DELETE staff
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await deleteStaff(req.params.id);
        res.json(deleted);
    } catch (err) {
        console.error("DELETE /staff/:id error:", err);
        res.status(500).json({
            message: "Failed to delete staff",
            error: err.message || String(err),
        });
    }
});

export default router;
