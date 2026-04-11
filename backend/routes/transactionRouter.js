import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Map database rows to frontend fields
    const formattedData = data.map((t) => ({
      description: t.description || `Stock - ${t.item_name || "Item"}`,
      date: t.date || t.created_at,
      amount: t.amount || t.quantity || 0,
      type: t.type || "profit",
      status: t.status || "completed",
      receivedBy: t.receivedBy || "System",
      paymentMode: t.paymentMode || "Cash",
      paymentCategory: t.paymentCategory || "Total",
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
