import bcrypt from "bcryptjs";
import { supabase } from "../config/supabaseClient.js";

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password, and role are required." });
    }

    if (!["manager", "staff"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'manager' or 'staff'." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from("users")
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        role,
        is_active: true,
      }])
      .select("id, name, email, role, is_active, created_at")
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active, password } = req.body;

    // Prevent admin from being edited into another role
    const { data: target } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (target?.role === "admin" && role && role !== "admin") {
      return res.status(400).json({ success: false, message: "Cannot change admin role." });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (role) {
      if (!["manager", "staff"].includes(role)) {
        return res.status(400).json({ success: false, message: "Role must be 'manager' or 'staff'." });
      }
      updates.role = role;
    }
    if (is_active !== undefined) updates.is_active = is_active;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      }
      updates.password_hash = await bcrypt.hash(password, 12);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, name, email, role, is_active, created_at")
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const { data: target } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (target?.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete an admin account." });
    }

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;

    return res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
