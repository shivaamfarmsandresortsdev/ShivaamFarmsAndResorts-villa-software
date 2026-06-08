import "dotenv/config.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { supabase } from "./config/supabaseClient.js";

import staffRoutes from "./routes/staffRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import revenueRoutes from "./routes/revenue.js";
import expenseRoutes from "./routes/expense.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import bookingInvoiceRoutes from "./routes/bookingInvoiceRoutes.js";
import villaRoutes from "./routes/villaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { authenticate } from "./middleware/authenticate.js";
import { authorize } from "./middleware/authorize.js";

const app = express();

// ─── CORS: allow specific frontend origins with credentials ───────────────────

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Server is running"));

app.get("/__supabase_test", async (req, res) => {
  const { data, error } = await supabase.from("bookings").select("*").limit(1);
  res.json({ data, error });
});

// ─── Public routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Admin-only: user management ──────────────────────────────────────────────
app.use("/api/users", userRoutes);

// ─── Booking routes (per-route auth defined inside bookingRoutes.js) ──────────
app.use("/api/bookings", bookingRoutes);

// ─── Invoice (auth is handled inside bookingInvoiceRoutes) ───────────────────
app.use("/api", bookingInvoiceRoutes);

// ─── Check-ins (admin + manager + staff) ─────────────────────────────────────
app.use("/api/checkins", authenticate, checkinRoutes);

// ─── Villas (per-route auth defined inside villaRoutes.js) ───────────────────
app.use("/api/villas", villaRoutes);

// ─── Staff management (admin only) ────────────────────────────────────────────
// Moved to /api/staff for consistency; kept old /staff alias for backward compat
app.use("/api/staff", authenticate, authorize("admin"), staffRoutes);
app.use("/staff", authenticate, authorize("admin"), staffRoutes);

// ─── Stocks (admin only) ──────────────────────────────────────────────────────
app.use("/api/stocks", authenticate, authorize("admin"), stockRoutes);

// ─── Finance (admin only) ─────────────────────────────────────────────────────
app.use("/api/revenue", authenticate, authorize("admin"), revenueRoutes(supabase));
app.use("/api/expenses", authenticate, authorize("admin"), expenseRoutes(supabase));

// ─── Route manifest ───────────────────────────────────────────────────────────
app.get("/__routes_check", (req, res) => {
  res.json({
    routes: [
      "POST   /api/auth/login",
      "POST   /api/auth/logout",
      "GET    /api/auth/me",
      "GET    /api/users         [admin]",
      "POST   /api/users         [admin]",
      "PUT    /api/users/:id     [admin]",
      "DELETE /api/users/:id     [admin]",
      "GET    /api/bookings      [all]",
      "POST   /api/bookings      [all]",
      "PUT    /api/bookings/:id  [admin,manager]",
      "DELETE /api/bookings/:id  [admin]",
      "GET    /api/villas        [all]",
      "POST   /api/villas        [admin,manager]",
      "DELETE /api/villas/:id    [admin]",
      "GET    /api/staff         [admin]",
      "GET    /api/stocks        [admin]",
      "GET    /api/revenue       [admin]",
      "GET    /api/expenses      [admin]",
      "GET    /api/checkins      [all]",
      "POST   /api/checkins      [all]",
    ],
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
