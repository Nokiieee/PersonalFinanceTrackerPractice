import api from "./api";

export async function getSummary() {
  const { data } = await api.get("/transactions/summary");
  return data.data;
}

export async function getCategoryBreakdown() {
  const { data } = await api.get("/transactions/category-breakdown");
  return data.data; // [{ category, total, percentage }]
}

export async function getMonthlySpending() {
  const { data } = await api.get("/transactions/monthly-spending");
  return data.data; // [{ month, income, expense }]
}

export async function getTransactions() {
  const { data } = await api.get("/transactions");
  return data.data;
}

export async function createTransaction({
  amount,
  category,
  type,
  date,
  description,
}) {
  const { data } = await api.post("/transactions", {
    amount,
    category,
    type,
    date,
    description,
  });
  return data.data;
}

export async function deleteTransaction(id) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}

export async function updateTransaction(id, updates) {
  const { data } = await api.put(`/transactions/${id}`, updates);
  return data.data;
}

// GET /api/transactions/report?startDate=...&endDate=...
export async function getReport(startDate, endDate) {
  const { data } = await api.get(
    `/transactions/report?startDate=${startDate}&endDate=${endDate}`,
  );
  return data.data; // { current: { totalIncome, totalExpenses, savings, savingsRate, categoryBreakdown, dailyTrend }, previous }
}
