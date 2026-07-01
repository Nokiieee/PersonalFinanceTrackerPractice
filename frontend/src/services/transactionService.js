import api from "./api";

// POST /api/transactions
// Backend responds with { success, data, message } — we just need `data`.
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

// GET /api/transactions
export async function getTransactions() {
  const { data } = await api.get("/transactions");
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
