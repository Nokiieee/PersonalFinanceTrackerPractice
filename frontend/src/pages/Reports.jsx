import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
} from "lucide-react";
import { getReport } from "../services/transactionService";

// ─── Period helpers ───────────────────────────────────────────────────────────

const PERIODS = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Last 3 Months", value: "last-3-months" },
  { label: "Last 6 Months", value: "last-6-months" },
  { label: "This Year", value: "this-year" },
];

function getDateRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const fmt = (d) => d.toISOString().slice(0, 10);

  switch (period) {
    case "this-month":
      return {
        start: fmt(new Date(year, month, 1)),
        end: fmt(new Date(year, month + 1, 0)),
      };
    case "last-month":
      return {
        start: fmt(new Date(year, month - 1, 1)),
        end: fmt(new Date(year, month, 0)),
      };
    case "last-3-months":
      return {
        start: fmt(new Date(year, month - 2, 1)),
        end: fmt(new Date(year, month + 1, 0)),
      };
    case "last-6-months":
      return {
        start: fmt(new Date(year, month - 5, 1)),
        end: fmt(new Date(year, month + 1, 0)),
      };
    case "this-year":
      return {
        start: fmt(new Date(year, 0, 1)),
        end: fmt(new Date(year, 11, 31)),
      };
    default:
      return {
        start: fmt(new Date(year, month, 1)),
        end: fmt(new Date(year, month + 1, 0)),
      };
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

const fmt = (v) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(v);

const pct = (curr, prev) => {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / Math.abs(prev)) * 100);
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function Reports() {
  const [period, setPeriod] = useState("this-month");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getDateRange(p);
      const data = await getReport(start, end);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(period);
  }, [period, fetchReport]);

  const c = report?.current;
  const p = report?.previous;

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((per) => (
          <button
            key={per.value}
            onClick={() => setPeriod(per.value)}
            className={`px-3.5 py-1.5 rounded-xl text-[13px] font-medium border transition-colors
              ${
                period === per.value
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
          >
            {per.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
          <p className="text-[13px] text-rose-400">{error}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={c?.totalIncome ?? 0}
          prev={p?.totalIncome ?? 0}
          icon={ArrowDownCircle}
          tone="emerald"
          loading={loading}
          hint="vs previous period"
        />
        <StatCard
          label="Total Expenses"
          value={c?.totalExpenses ?? 0}
          prev={p?.totalExpenses ?? 0}
          icon={ArrowUpCircle}
          tone="rose"
          loading={loading}
          hint="vs previous period"
          invertTrend
        />
        <StatCard
          label="Net Savings"
          value={c?.savings ?? 0}
          prev={p?.savings ?? 0}
          icon={PiggyBank}
          tone="emerald"
          loading={loading}
          hint="income minus expenses"
        />
        <StatCard
          label="Savings Rate"
          value={c?.savingsRate ?? 0}
          icon={Wallet}
          tone="emerald"
          loading={loading}
          isPercent
          hint="% of income saved"
        />
      </div>

      {/* Trend chart + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendChart data={c?.dailyTrend ?? []} loading={loading} />
        <CategoryBreakdown
          data={c?.categoryBreakdown ?? []}
          loading={loading}
        />
      </div>

      {/* Savings insight card */}
      <SavingsInsight current={c} loading={loading} />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  prev,
  icon: Icon,
  tone,
  loading,
  hint,
  invertTrend,
  isPercent,
}) {
  const isRose = tone === "rose";
  const change = prev !== undefined ? pct(value, prev) : null;
  const positive = invertTrend ? change < 0 : change > 0;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-slate-500 font-medium">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full
          ${isRose ? "bg-rose-500/12 text-rose-400" : "bg-emerald-500/12 text-emerald-400"}`}
        >
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>

      {loading ? (
        <>
          <div className="h-7 w-28 rounded-lg bg-slate-800 animate-pulse mb-2" />
          <div className="h-4 w-20 rounded-lg bg-slate-800 animate-pulse" />
        </>
      ) : (
        <>
          <p
            className={`text-[20px] font-semibold tracking-tight mb-1
            ${isRose && value > 0 ? "text-rose-400" : "text-slate-50"}`}
          >
            {isPercent ? `${value}%` : fmt(value)}
          </p>
          {change !== null ? (
            <div className="flex items-center gap-1">
              {change === 0 ? (
                <Minus size={12} className="text-slate-500" />
              ) : positive ? (
                <TrendingUp size={12} className="text-emerald-400" />
              ) : (
                <TrendingDown size={12} className="text-rose-400" />
              )}
              <span
                className={`text-[11.5px] font-medium
                ${change === 0 ? "text-slate-500" : positive ? "text-emerald-400" : "text-rose-400"}`}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-[11px] text-slate-600">{hint}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-600">{hint}</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Trend chart ──────────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 shadow-xl text-[12.5px]">
      <p className="font-semibold text-slate-100 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.stroke }} className="mb-0.5">
          {p.name === "income" ? "Income" : "Expense"}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

function TrendChart({ data, loading }) {
  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0);

  // For multi-month ranges, collapse to weekly/monthly labels for readability
  const display = data.length > 31 ? data.filter((_, i) => i % 7 === 0) : data;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-slate-100">
          Income vs Expenses
        </h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Daily trend over the selected period
        </p>
      </div>

      {loading ? (
        <div className="h-48 flex items-end gap-1 px-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-slate-800 animate-pulse"
              style={{ height: `${30 + (i % 4) * 15}%` }}
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-[13px] text-slate-600">No data for this period</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={display}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.slice(5)} // show MM-DD
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) =>
                `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
              }
            />
            <Tooltip content={<TrendTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              name="income"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              name="expense"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="flex items-center justify-center gap-5 mt-3 text-[11.5px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />{" "}
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />{" "}
          Expense
        </span>
      </div>
    </div>
  );
}

// ─── Category breakdown ───────────────────────────────────────────────────────

const COLORS = [
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#facc15",
  "#38bdf8",
  "#f87171",
];

function CategoryBreakdown({ data, loading }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-slate-100">
          Top Spending Categories
        </h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Where your money went this period
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-800 animate-pulse" />
              <div className="h-2 rounded-full bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-[13px] text-slate-600">
            No expense data for this period
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[13px] text-slate-300 font-medium">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-slate-500">
                    {item.percentage}%
                  </span>
                  <span className="text-[13px] font-semibold text-slate-200">
                    {fmt(item.total)}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Savings insight ──────────────────────────────────────────────────────────

function SavingsInsight({ current, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
        <div className="h-4 w-40 rounded bg-slate-800 animate-pulse mb-3" />
        <div className="h-3 w-full rounded bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!current) return null;

  const { totalIncome, totalExpenses, savings, savingsRate } = current;
  const isPositive = savings >= 0;

  let message = "";
  let tone = "emerald";

  if (totalIncome === 0 && totalExpenses === 0) {
    message =
      "No transactions recorded for this period. Add some income or expenses to see insights.";
    tone = "slate";
  } else if (savingsRate >= 20) {
    message = `Great job! You saved ${savingsRate}% of your income this period (${fmt(savings)}). You're building strong financial habits.`;
  } else if (savingsRate > 0) {
    message = `You saved ${savingsRate}% of your income (${fmt(savings)}). Aim for 20% or more to build a stronger financial cushion.`;
    tone = "yellow";
  } else if (totalIncome === 0) {
    message = `You spent ${fmt(totalExpenses)} with no income recorded this period.`;
    tone = "rose";
  } else {
    message = `You spent ${fmt(Math.abs(savings))} more than you earned this period. Consider reviewing your top spending categories above.`;
    tone = "rose";
  }

  const bgMap = {
    emerald: "bg-emerald-500/10 border-emerald-500/20",
    rose: "bg-rose-500/10 border-rose-500/20",
    yellow: "bg-yellow-500/10 border-yellow-500/20",
    slate: "bg-slate-800/60 border-slate-700/60",
  };
  const textMap = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    yellow: "text-yellow-400",
    slate: "text-slate-400",
  };
  const titleMap = {
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    yellow: "text-yellow-300",
    slate: "text-slate-300",
  };

  return (
    <div className={`rounded-2xl border p-5 ${bgMap[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        {isPositive ? (
          <TrendingUp size={16} className={textMap[tone]} />
        ) : (
          <TrendingDown size={16} className={textMap[tone]} />
        )}
        <h2 className={`text-[13.5px] font-semibold ${titleMap[tone]}`}>
          Savings Insight
        </h2>
      </div>
      <p className={`text-[13px] leading-relaxed ${textMap[tone]}`}>
        {message}
      </p>
    </div>
  );
}
