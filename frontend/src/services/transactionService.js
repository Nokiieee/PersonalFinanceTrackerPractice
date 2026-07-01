import api from "./api";

// GET /api/transactions/summary
// Returns { balance, totalIncome, totalExpenses } for the logged-in user
export async function getSummary() {
  const { data } = await api.get("/transactions/summary");
  return data.data;
}

// GET /api/transactions
export async function getTransactions() {
  const { data } = await api.get("/transactions");
  return data.data;
}

// POST /api/transactions
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

// DELETE /api/transactions/:id
export async function deleteTransaction(id) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}

// PUT /api/transactions/:id
export async function updateTransaction(id, updates) {
  const { data } = await api.put(`/transactions/${id}`, updates);
  return data.data;
}
