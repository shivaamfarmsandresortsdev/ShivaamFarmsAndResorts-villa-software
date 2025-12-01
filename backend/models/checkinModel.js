import {supabase} from "../config/supabaseClient.js";

export const insertCheckIn = async (checkinData) => {
  const { data, error } = await supabase
    .from("checkins")
    .insert([checkinData])
    .select();

  if (error) throw error;
  return data;
};

export const fetchAllCheckIns = async () => {
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
