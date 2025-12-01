// routes/expense.js
import express from "express";

const router = express.Router();

export default function expenseRoutes(supabase) {
  // ✅ Expense Data (for Expense Chart)
  router.get("/", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("monthly_expenses") // 👈 your table
        .select("month, amount")
        .order("month", { ascending: true });

      if (error) throw error;

      const months = data.map((e) => e.month);
      const values = data.map((e) => e.amount);

      res.json({ months, values });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
