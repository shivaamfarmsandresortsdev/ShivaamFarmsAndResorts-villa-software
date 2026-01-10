import { supabase } from "../config/supabaseClient.js";

// ✅ GET ALL VILLAS
export const getAllVillas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("villas")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json({ data });
  } catch (err) {
    console.error("getAllVillas error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ ADD VILLA
export const addVilla = async (req, res) => {
  try {
    const { name, type, capacity, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Villa name is required" });
    }

    const payload = {
      name: name.trim(),
      type: type || null,
      capacity: capacity ? Number(capacity) : null,
      is_active: is_active ?? true,
    };

    const { data, error } = await supabase
      .from("villas")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (err) {
    console.error("addVilla error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

// ✅ UPDATE VILLA
export const updateVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, is_active } = req.body;

    const payload = {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(type !== undefined ? { type: type || null } : {}),
      ...(capacity !== undefined
        ? { capacity: capacity === "" ? null : Number(capacity) }
        : {}),
      ...(is_active !== undefined ? { is_active } : {}),
    };

    const { data, error } = await supabase
      .from("villas")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (err) {
    console.error("updateVilla error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

// ✅ DELETE VILLA
export const deleteVilla = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("villas").delete().eq("id", id);

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteVilla error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
