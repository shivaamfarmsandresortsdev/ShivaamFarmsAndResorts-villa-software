import { supabase } from "../config/supabaseClient.js";

// Get all stocks
export const getStocks = async (req, res) => {
  const { data, error } = await supabase
    .from("stocks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// Add new stock
export const addStock = async (req, res) => {
  const stockData = req.body;

  const { data, error } = await supabase.from("stocks").insert([stockData]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};


// Delete stock item by ID
export const deleteStock = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("stocks").delete().eq("id", id). select();;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Item deleted successfully", data });
};