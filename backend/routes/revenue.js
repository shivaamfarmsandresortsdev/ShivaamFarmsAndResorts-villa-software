// routes/revenue.js

import express from "express";
const router = express.Router();

export default function revenueRoutes(supabase) {
  // GET /api/revenue
  router.get("/", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("monthly_revenue")
        .select("id, month, year, amount") 
        .order("id", { ascending: true });

      if (error) throw error;

      // Example labels: Jan-2025, Feb-2025, ...
      const months = data.map((r) => `${r.month}-${r.year}`);
      const values = data.map((r) => r.amount);

      res.json({ months, values });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
