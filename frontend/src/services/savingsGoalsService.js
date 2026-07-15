import api from "./api";

// GET /api/goals — all goals enriched with saved amount + activity history
export async function getGoals() {
  const { data } = await api.get("/goals");
  return data.data;
}

export async function createGoal({ name, targetAmount }) {
  const { data } = await api.post("/goals", { name, targetAmount });
  return data.data;
}

export async function updateGoal(id, { name, targetAmount }) {
  const { data } = await api.put(`/goals/${id}`, { name, targetAmount });
  return data.data;
}

export async function deleteGoal(id) {
  const { data } = await api.delete(`/goals/${id}`);
  return data;
}

// type: "deposit" | "withdrawal"
export async function addActivity(goalId, { type, amount, description, date }) {
  const { data } = await api.post(`/goals/${goalId}/activities`, {
    type,
    amount,
    description,
    date,
  });
  return data.data;
}

export async function updateActivity(goalId, activityId, { amount, description, date }) {
  const { data } = await api.put(
    `/goals/${goalId}/activities/${activityId}`,
    { amount, description, date },
  );
  return data.data;
}

export async function deleteActivity(goalId, activityId) {
  const { data } = await api.delete(`/goals/${goalId}/activities/${activityId}`);
  return data;
}
