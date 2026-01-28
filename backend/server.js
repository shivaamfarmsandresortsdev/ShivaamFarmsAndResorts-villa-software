// server.js
import "dotenv/config.js";
import cors from "cors";
import express from "express";
import { supabase } from "./config/supabaseClient.js";

import staffRoutes from "./routes/staffRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import revenueRoutes from "./routes/revenue.js";
import expenseRoutes from "./routes/expense.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import bookingInvoiceRoutes from "./routes/bookingInvoiceRoutes.js";
import villaRoutes from "./routes/villaRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/__supabase_test", async (req, res) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .limit(1);

  res.json({ data, error });
});


// ✅ Mount your routes
app.use("/staff", staffRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", bookingInvoiceRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/villas", villaRoutes);

// ✅ IMPORTANT — pass supabase client to these route functions
app.use("/api/revenue", revenueRoutes(supabase));
app.use("/api/expenses", expenseRoutes(supabase));
app.get("/__routes_check", (req, res) => {
  res.json({
    routes: [
      "POST /api/bookings",
      "POST /api/bookings/bulk",
      "PUT /api/bookings/bulk/:bulk_id",     // ✅ add this
      "PUT /api/bookings/:id",
      "DELETE /api/bookings/bulk/:bulk_id",
      "DELETE /api/bookings/:id"
    ]
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
