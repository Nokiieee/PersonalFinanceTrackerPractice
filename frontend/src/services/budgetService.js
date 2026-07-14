import api from "./api";

// GET /api/budgets — all budgets enriched with expense totals + category breakdown
export async function getBudgets() {
  const { data } = await api.get("/budgets");
  return data.data;
}

// PUT /api/budgets/:id — update budget amount
export async function updateBudget(id, amount) {
  const { data } = await api.put(`/budgets/${id}`, { amount });
  return data.data;
}
