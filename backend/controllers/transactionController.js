import { getTransactions } from "../models/transactionModel.js";

export const fetchTransactions = async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (err) {
    console.error("Transactions fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};
