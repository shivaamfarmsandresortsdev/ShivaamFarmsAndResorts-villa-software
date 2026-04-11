export const getRevenueData = async (supabase) => {
  const { data, error } = await supabase
    .from("monthly_revenue")
    .select("id, month, year, amount")
    .order("id", { ascending: true });

  if (error) throw error;

  const months = data.map((r) => `${r.month}-${r.year}`);
  const values = data.map((r) => r.amount);

  return { months, values };
};
