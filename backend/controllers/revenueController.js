import { getRevenueData } from "../models/revenueModel.js";

export const revenueData = async (req, res, supabase) => {
  try {
    const result = await getRevenueData(supabase);
    res.json(result);
  } catch (err) {
    console.error("Revenue fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};
