import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js";

const COOKIE_NAME = "access_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
  path: "/",
});

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, password_hash, role, is_active")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: "Account is deactivated. Contact admin." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: 0 });
  return res.json({ success: true, message: "Logged out successfully." });
};

export const getMe = (req, res) => {
  return res.json({ success: true, user: req.user });
};
