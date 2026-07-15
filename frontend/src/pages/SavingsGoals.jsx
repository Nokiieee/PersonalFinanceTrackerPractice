import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Target,
  Inbox,
  Loader2,
  X,
} from "lucide-react";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addActivity,
  updateActivity,
  deleteActivity,
} from "../services/savingsGoalsService";
import ConfirmModal from "../components/common/ConfirmModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(v);

const fmtShort = (v) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(v);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [goalModal, setGoalModal] = useState(null); // { mode: "create" } | { mode: "edit", goal }
  const [activityModal, setActivityModal] = useState(null); // { mode, goalId, type, activity }
  const [deleteGoalTarget, setDeleteGoalTarget] = useState(null);
  const [deleteActivityTarget, setDeleteActivityTarget] = useState(null); // { goalId, activity }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load savings goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveGoal = async (payload) => {
    if (goalModal.mode === "edit") {
      await updateGoal(goalModal.goal._id, payload);
    } else {
      await createGoal(payload);
    }
    setGoalModal(null);
    await load();
  };

  const handleConfirmDeleteGoal = async () => {
    try {
      await deleteGoal(deleteGoalTarget._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteGoalTarget(null);
      await load();
    }
  };

  const handleSaveActivity = async (payload) => {
    if (activityModal.mode === "edit") {
      await updateActivity(activityModal.goalId, activityModal.activity._id, payload);
    } else {
      await addActivity(activityModal.goalId, payload);
    }
    setActivityModal(null);
    await load();
  };

  const handleConfirmDeleteActivity = async () => {
    try {
      await deleteActivity(deleteActivityTarget.goalId, deleteActivityTarget.activity._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteActivityTarget(null);
      await load();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setGoalModal({ mode: "create" })}
          className="flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-500 transition-colors px-4 py-2 text-[13px] font-medium text-slate-950 shadow-sm shadow-emerald-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Goal
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
          <p className="text-[13px] text-rose-400">{error}</p>
        </div>
      )}

      {loading ? (
        <SkeletonCards />
      ) : goals.length === 0 ? (
        <EmptyState onCreate={() => setGoalModal({ mode: "create" })} />
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={() => setGoalModal({ mode: "edit", goal })}
              onDelete={() => setDeleteGoalTarget(goal)}
              onDeposit={() =>
                setActivityModal({ mode: "create", goalId: goal._id, type: "deposit" })
              }
              onWithdraw={() =>
                setActivityModal({ mode: "create", goalId: goal._id, type: "withdrawal" })
              }
              onEditActivity={(activity) =>
                setActivityModal({ mode: "edit", goalId: goal._id, activity })
              }
              onDeleteActivity={(activity) =>
                setDeleteActivityTarget({ goalId: goal._id, activity })
              }
            />
          ))}
        </div>
      )}

      {/* Create/Edit goal modal */}
      {goalModal && (
        <GoalFormModal
          goal={goalModal.mode === "edit" ? goalModal.goal : null}
          onSave={handleSaveGoal}
          onClose={() => setGoalModal(null)}
        />
      )}

      {/* Deposit/Withdraw/Edit activity modal */}
      {activityModal && (
        <ActivityFormModal
          type={activityModal.mode === "edit" ? activityModal.activity.type : activityModal.type}
          activity={activityModal.mode === "edit" ? activityModal.activity : null}
          onSave={handleSaveActivity}
          onClose={() => setActivityModal(null)}
        />
      )}

      {/* Delete goal confirmation */}
      <ConfirmModal
        isOpen={!!deleteGoalTarget}
        icon={Trash2}
        title="Delete this goal?"
        message={`"${deleteGoalTarget?.name}" and its entire activity history will be permanently deleted.`}
        confirmLabel="Delete Goal"
        onConfirm={handleConfirmDeleteGoal}
        onCancel={() => setDeleteGoalTarget(null)}
      />

      {/* Delete activity confirmation */}
      <ConfirmModal
        isOpen={!!deleteActivityTarget}
        icon={Trash2}
        title="Delete this activity?"
        message="This will remove the entry and recalculate the goal's saved amount."
        confirmLabel="Delete Activity"
        onConfirm={handleConfirmDeleteActivity}
        onCancel={() => setDeleteActivityTarget(null)}
      />
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  onEditActivity,
  onDeleteActivity,
}) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const { name, targetAmount, savedAmount, remaining, percentageUsed, isCompleted, activities } =
    goal;

  const overfunded = savedAmount > targetAmount;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all bg-slate-900
      ${isCompleted ? "border-emerald-500/25" : "border-slate-800/80"}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-400 shrink-0">
              <Target size={17} strokeWidth={1.8} />
            </span>
            <h2 className="text-[15px] font-semibold text-slate-100">{name}</h2>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle size={10} /> Goal reached
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors"
            >
              <Pencil size={12} strokeWidth={2} />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Target" value={fmtShort(targetAmount)} />
          <Stat label="Saved" value={fmtShort(savedAmount)} tone="emerald" />
          <Stat label="Remaining" value={fmtShort(Math.max(remaining, 0))} />
          <Stat label="Progress" value={`${percentageUsed}%`} tone="emerald" />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11.5px] text-slate-500">Saved toward goal</span>
            <span className="text-[12px] font-semibold text-emerald-400">
              {percentageUsed}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(Math.max(percentageUsed, 0), 100)}%` }}
            />
          </div>
          {overfunded && (
            <p className="mt-1.5 text-[11.5px] text-emerald-400">
              Exceeded goal by {fmtShort(savedAmount - targetAmount)}
            </p>
          )}
        </div>

        {/* Deposit / Withdraw actions */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onDeposit}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-[13px] font-semibold text-slate-950 transition-colors"
          >
            <ArrowDownCircle size={15} strokeWidth={2} />
            Deposit
          </button>
          <button
            onClick={onWithdraw}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 py-2.5 text-[13px] font-semibold text-slate-200 transition-colors"
          >
            <ArrowUpCircle size={15} strokeWidth={2} />
            Withdraw
          </button>
        </div>
      </div>

      {/* Activity history toggle */}
      <button
        onClick={() => setHistoryOpen((v) => !v)}
        className="flex items-center justify-between w-full border-t border-slate-800/80 px-5 py-3 hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
          Activity History{" "}
          <span className="text-slate-600 normal-case font-normal">
            ({activities.length})
          </span>
        </span>
        {historyOpen ? (
          <ChevronUp size={15} className="text-slate-500" />
        ) : (
          <ChevronDown size={15} className="text-slate-500" />
        )}
      </button>

      {historyOpen && (
        <div className="border-t border-slate-800/80">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[13px] text-slate-600">
                No activity yet. Make your first deposit.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/60">
              {activities.map((a) => (
                <ActivityRow
                  key={a._id}
                  activity={a}
                  onEdit={() => onEditActivity(a)}
                  onDelete={() => onDeleteActivity(a)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity, onEdit, onDelete }) {
  const isDeposit = activity.type === "deposit";

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0
          ${isDeposit ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"}`}
        >
          {isDeposit ? (
            <ArrowDownCircle size={15} strokeWidth={2} />
          ) : (
            <ArrowUpCircle size={15} strokeWidth={2} />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] text-slate-200 truncate">
            {activity.description || (
              <span className="text-slate-600 italic">No description</span>
            )}
          </p>
          <p className="text-[11.5px] text-slate-500 mt-0.5">{formatDate(activity.date)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className={`text-[13.5px] font-semibold ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
          {isDeposit ? "+" : "-"}
          {fmt(activity.amount)}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Edit activity"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Delete activity"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({ label, value, tone }) {
  const color = tone === "emerald" ? "text-emerald-400" : "text-slate-100";

  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3.5 py-2.5">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <p className={`text-[14px] font-semibold ${color}`}>{value}</p>
    </div>
  );
}

// ─── Create/Edit Goal Modal ─────────────────────────────────────────────────────

function GoalFormModal({ goal, onSave, onClose }) {
  const [name, setName] = useState(goal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!goal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(targetAmount);
    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }
    if (!targetAmount || isNaN(num) || num <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), targetAmount: num });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl animate-[scaleIn_0.18s_ease-out]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-slate-50">
              {isEdit ? "Edit Goal" : "New Savings Goal"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
              <p className="text-[12.5px] text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Goal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Emergency Fund"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                disabled={saving}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5
                           text-[14px] text-slate-100 placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                           transition-shadow disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[14px]">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => {
                    setTargetAmount(e.target.value);
                    setError(null);
                  }}
                  disabled={saving}
                  className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-7 py-2.5
                             text-[14px] text-slate-100 placeholder:text-slate-500
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                             transition-shadow disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-[13.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-[13.5px] font-semibold text-slate-950 transition-colors disabled:opacity-70"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

// ─── Deposit/Withdraw (create/edit) Modal ───────────────────────────────────────

function ActivityFormModal({ type, activity, onSave, onClose }) {
  const isDeposit = type === "deposit";
  const isEdit = !!activity;

  const [amount, setAmount] = useState(activity ? String(activity.amount) : "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [date, setDate] = useState(
    activity ? new Date(activity.date).toISOString().slice(0, 10) : todayISO(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        type,
        amount: num,
        description: description.trim() || undefined,
        date,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit
    ? `Edit ${isDeposit ? "Deposit" : "Withdrawal"}`
    : isDeposit
      ? "Add Deposit"
      : "Add Withdrawal";

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl animate-[scaleIn_0.18s_ease-out]">
          <div className="flex items-center gap-2.5 mb-5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                isDeposit ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"
              }`}
            >
              {isDeposit ? (
                <ArrowDownCircle size={17} strokeWidth={1.8} />
              ) : (
                <ArrowUpCircle size={17} strokeWidth={1.8} />
              )}
            </span>
            <h2 className="flex-1 text-[15px] font-semibold text-slate-50">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
              <p className="text-[12.5px] text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[14px]">
                  ₱
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  disabled={saving}
                  className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-7 py-2.5
                             text-[14px] text-slate-100 placeholder:text-slate-500
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                             transition-shadow disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError(null);
                }}
                disabled={saving}
                className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5
                           text-[14px] text-slate-100
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                           transition-shadow disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Description <span className="text-slate-600">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Add a note..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className="w-full resize-none rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5 text-[14px] text-slate-100
                           placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-shadow disabled:opacity-60"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-[13.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-semibold transition-colors disabled:opacity-70
                  ${isDeposit ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-rose-500 hover:bg-rose-400 text-white"}`}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : isEdit ? "Save Changes" : title}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center gap-3 py-16 px-5 text-center">
      <Inbox size={32} className="text-slate-700" strokeWidth={1.5} />
      <div>
        <p className="text-[14px] font-medium text-slate-400">No savings goals yet</p>
        <p className="text-[12.5px] text-slate-600 mt-1">
          Create your first goal to start saving
        </p>
      </div>
      <button
        onClick={onCreate}
        className="mt-2 flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-4 py-2 text-[13px] font-medium text-slate-950"
      >
        <Plus size={16} strokeWidth={2.5} />
        New Goal
      </button>
    </div>
  );
}

// ─── Loading skeletons ────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5 space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-36 rounded-lg bg-slate-800 animate-pulse" />
            <div className="h-8 w-20 rounded-xl bg-slate-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-14 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-2 rounded-full bg-slate-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
