import { useEffect, useState, useCallback } from "react";
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Loader2,
  X,
} from "lucide-react";
import { getBudgets, updateBudget } from "../services/budgetService";

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

const monthLabel = (month) => {
  const [y, m] = month.split("-");
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
};

const progressColor = (pct) => {
  if (pct >= 100) return "bg-rose-500";
  if (pct >= 75) return "bg-orange-400";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-emerald-400";
};

const progressTextColor = (pct) => {
  if (pct >= 100) return "text-rose-400";
  if (pct >= 75) return "text-orange-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-emerald-400";
};

const CATEGORY_COLORS = [
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#facc15",
  "#38bdf8",
  "#f87171",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // budget being edited

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveBudget = async (id, amount) => {
    try {
      await updateBudget(id, amount);
      setEditTarget(null);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const current = budgets.find((b) => b.isCurrentMonth);
  const previous = budgets.filter((b) => !b.isCurrentMonth);

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
          <p className="text-[13px] text-rose-400">{error}</p>
        </div>
      )}

      {loading ? (
        <SkeletonCards />
      ) : (
        <>
          {/* Current month */}
          {current && (
            <BudgetCard
              budget={current}
              isCurrent
              onEdit={() => setEditTarget(current)}
            />
          )}

          {/* Previous months */}
          {previous.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-1">
                Previous Months
              </p>
              {previous.map((b) => (
                <BudgetCard
                  key={b._id}
                  budget={b}
                  isCurrent={false}
                  onEdit={() => setEditTarget(b)}
                  collapsedByDefault
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditBudgetModal
          budget={editTarget}
          onSave={(amount) => handleSaveBudget(editTarget._id, amount)}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget, isCurrent, onEdit, collapsedByDefault = false }) {
  const [collapsed, setCollapsed] = useState(collapsedByDefault);

  const {
    month,
    amount,
    totalExpenses,
    remaining,
    percentageUsed,
    daysLeft,
    categoryBreakdown,
  } = budget;

  const exceeded = totalExpenses > amount;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all
      ${
        isCurrent
          ? "bg-slate-900 border-emerald-500/25"
          : "bg-slate-900 border-slate-800/80"
      }`}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-[15px] font-semibold text-slate-100">
              {monthLabel(month)}
            </h2>
            {isCurrent && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                Current
              </span>
            )}
            {exceeded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                <AlertTriangle size={10} /> Over budget
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors"
            >
              <Pencil size={12} strokeWidth={2} />
              Edit Budget
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 transition-colors"
            >
              {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Budget" value={fmtShort(amount)} />
          <Stat
            label="Spent"
            value={fmtShort(totalExpenses)}
            tone={exceeded ? "rose" : undefined}
          />
          <Stat
            label="Remaining"
            value={fmtShort(Math.abs(remaining))}
            tone={exceeded ? "rose" : "emerald"}
            prefix={exceeded ? "−" : ""}
          />
          {isCurrent ? (
            <Stat label="Days Left" value={`${daysLeft} days`} />
          ) : (
            <Stat
              label="Used"
              value={`${percentageUsed}%`}
              tone={progressTextColor(percentageUsed).replace("text-", "")}
            />
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11.5px] text-slate-500">Budget used</span>
            <span
              className={`text-[12px] font-semibold ${progressTextColor(percentageUsed)}`}
            >
              {percentageUsed}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progressColor(percentageUsed)}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          {exceeded && (
            <p className="mt-1.5 text-[11.5px] text-rose-400">
              Exceeded by {fmtShort(Math.abs(remaining))}
            </p>
          )}
        </div>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="border-t border-slate-800/80 px-5 py-4 space-y-4">
          {/* Insight */}
          <Insight budget={budget} />

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 ? (
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Spending by Category
              </p>
              <div className="space-y-2">
                {categoryBreakdown.map((cat, i) => (
                  <CategoryRow
                    key={cat.category}
                    cat={cat}
                    color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    budgetAmount={amount}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-[13px] text-slate-600">
                No expenses recorded for this month
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({ label, value, tone, prefix = "" }) {
  const color = !tone
    ? "text-slate-100"
    : tone === "rose"
      ? "text-rose-400"
      : tone === "emerald"
        ? "text-emerald-400"
        : `text-${tone}-400`;

  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3.5 py-2.5">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <p className={`text-[14px] font-semibold ${color}`}>
        {prefix}
        {value}
      </p>
    </div>
  );
}

// ─── Category row (expandable) ────────────────────────────────────────────────

function CategoryRow({ cat, color, budgetAmount }) {
  const [open, setOpen] = useState(false);
  const pctOfBudget =
    budgetAmount > 0 ? Math.round((cat.total / budgetAmount) * 100) : 0;

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800/60 transition-colors text-left"
      >
        {/* Color dot */}
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: color }}
        />

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-medium text-slate-200">
              {cat.category}
            </span>
            <span className="text-[12px] text-slate-400 ml-2 shrink-0">
              {fmt(cat.total)}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-700">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(pctOfBudget, 100)}%`,
                background: color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[11px] text-slate-500">
            {pctOfBudget}% of budget
          </span>
          <span className="text-[11px] text-slate-600">
            {cat.transactions.length} txn
            {cat.transactions.length !== 1 ? "s" : ""}
          </span>
          {open ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronRight size={14} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded transactions */}
      {open && (
        <ul className="border-t border-slate-700/40 divide-y divide-slate-700/30">
          {cat.transactions.map((t) => (
            <li
              key={t._id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[13px] text-slate-200 truncate">
                  {t.description || (
                    <span className="italic text-slate-500">
                      No description
                    </span>
                  )}
                </p>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  {new Date(t.date).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    timeZone: "Asia/Manila",
                  })}
                </p>
              </div>
              <p className="text-[13px] font-semibold text-rose-400 shrink-0 ml-4">
                -{fmt(t.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Auto-generated Insight ───────────────────────────────────────────────────

function Insight({ budget }) {
  const {
    amount,
    totalExpenses,
    remaining,
    percentageUsed,
    categoryBreakdown,
    daysLeft,
    isCurrentMonth,
  } = budget;

  let icon = CheckCircle;
  let tone = "emerald";
  let text = "";

  if (amount === 0) {
    icon = Wallet;
    tone = "slate";
    text = "No budget set for this month. Click Edit Budget to set one.";
  } else if (percentageUsed >= 100) {
    icon = AlertTriangle;
    tone = "rose";
    text = `You've exceeded your budget by ${fmtShort(Math.abs(remaining))}.${
      categoryBreakdown[0]
        ? ` ${categoryBreakdown[0].category} is your highest spending category.`
        : ""
    }`;
  } else if (percentageUsed >= 75) {
    icon = TrendingDown;
    tone = "orange";
    text = `You've used ${percentageUsed}% of your budget.${
      isCurrentMonth && daysLeft > 0
        ? ` With ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left, you have ${fmtShort(remaining)} remaining.`
        : ""
    }`;
  } else if (percentageUsed >= 50) {
    icon = TrendingUp;
    tone = "yellow";
    text = `You're halfway through your budget with ${fmtShort(remaining)} remaining.${
      categoryBreakdown[0]
        ? ` Your top spending category is ${categoryBreakdown[0].category}.`
        : ""
    }`;
  } else {
    icon = CheckCircle;
    tone = "emerald";
    text = `You're well within your budget! ${fmtShort(remaining)} remaining${
      isCurrentMonth && daysLeft > 0
        ? ` with ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left this month.`
        : "."
    }`;
  }

  const Icon = icon;

  const styles = {
    emerald: {
      wrap: "bg-emerald-500/8 border-emerald-500/20",
      icon: "text-emerald-400",
      text: "text-emerald-300/80",
    },
    orange: {
      wrap: "bg-orange-500/8 border-orange-500/20",
      icon: "text-orange-400",
      text: "text-orange-300/80",
    },
    yellow: {
      wrap: "bg-yellow-500/8 border-yellow-500/20",
      icon: "text-yellow-400",
      text: "text-yellow-300/80",
    },
    rose: {
      wrap: "bg-rose-500/8 border-rose-500/20",
      icon: "text-rose-400",
      text: "text-rose-300/80",
    },
    slate: {
      wrap: "bg-slate-800/60 border-slate-700/50",
      icon: "text-slate-400",
      text: "text-slate-400",
    },
  };

  const s = styles[tone];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${s.wrap}`}
    >
      <Icon size={16} className={`${s.icon} shrink-0 mt-0.5`} strokeWidth={2} />
      <p className={`text-[12.5px] leading-relaxed ${s.text}`}>{text}</p>
    </div>
  );
}

// ─── Edit Budget Modal ────────────────────────────────────────────────────────

function EditBudgetModal({ budget, onSave, onClose }) {
  const [value, setValue] = useState(String(budget.amount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(value);
    if (!value || isNaN(num) || num < 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      await onSave(num);
    } catch {
      setError("Failed to save. Please try again.");
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
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-slate-50">
              Edit Budget
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
          <p className="text-[12.5px] text-slate-500 mb-5">
            {monthLabel(budget.month)}
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
              <p className="text-[12.5px] text-rose-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
                Monthly Budget Amount
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
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
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
                {saving ? "Saving..." : "Save Budget"}
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

// ─── Loading skeletons ────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5 space-y-4"
        >
          <div className="flex justify-between">
            <div className="h-5 w-36 rounded-lg bg-slate-800 animate-pulse" />
            <div className="h-8 w-28 rounded-xl bg-slate-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-14 rounded-xl bg-slate-800 animate-pulse"
              />
            ))}
          </div>
          <div className="h-2 rounded-full bg-slate-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
