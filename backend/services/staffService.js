import { supabase } from "../config/supabaseClient.js";

export const getStaff = async () => {
    const { data, error } = await supabase
        .from("Staff")
        .select("id, name, role, contact,joiningdate")
        .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const addStaff = async (staff) => {
    const { error } = await supabase.from("Staff").insert([staff]);
    if (error) throw new Error(error.message);
    return true;
};

export const updateStaff = async (id, staff) => {
    const { error } = await supabase.from("Staff").update(staff).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
};

export const deleteStaff = async (id) => {
    const { error } = await supabase.from("Staff").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
};
