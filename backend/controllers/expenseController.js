// models/expenseModel.js
export const getExpenseData = async (supabase) => {
  const { data, error } = await supabase
    .from("monthly_expenses")
    .select("id, month, year, amount")
    .order("id", { ascending: true });

  if (error) throw error;

  const months = data.map((e) => `${e.month}-${e.year}`);
  const values = data.map((e) => e.amount);

  return { months, values };
};
