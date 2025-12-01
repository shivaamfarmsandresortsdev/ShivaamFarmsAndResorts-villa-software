import express from "express";
import { getStocks, addStock, deleteStock } from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getStocks);
router.post("/", addStock);
router.delete("/:id", deleteStock); // DELETE /api/stocks/:id

export default router;