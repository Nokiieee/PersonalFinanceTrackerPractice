import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlySpending,
} from "../services/transactionService";
import ExpensePieChart from "../components/common/ExpensePieChart";
import MonthlyBarChart from "../components/common/MonthlyBarChart";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export default function Dashboard() {
  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [summaryRes, categoryRes, monthlyRes] = await Promise.all([
          getSummary(),
          getCategoryBreakdown(),
          getMonthlySpending(),
        ]);
        setSummary(summaryRes);
        setCategoryData(categoryRes);
        setMonthlyData(monthlyRes);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
          <p className="text-[13px] text-rose-400">{error}</p>
        </div>
      )}

      {/* Balance — full width, visually prominent */}
      <BalanceCard value={summary.balance} loading={loading} />

      {/* Income + Expenses — side by side on all screen sizes */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          label="Total Income"
          value={summary.totalIncome}
          icon={ArrowDownCircle}
          tone="emerald"
          loading={loading}
        />
        <SummaryCard
          label="Total Expenses"
          value={summary.totalExpenses}
          icon={ArrowUpCircle}
          tone="rose"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpensePieChart data={categoryData} loading={loading} />
        <MonthlyBarChart data={monthlyData} loading={loading} />
      </div>
    </div>
  );
}

// Balance card — full width, distinct emerald gradient style
function BalanceCard({ value, loading }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Wallet size={16} strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-medium text-emerald-300/80">Balance</p>
        </div>
        <span className="text-[11px] font-medium text-emerald-500/60 tracking-wide uppercase">
          Current
        </span>
      </div>

      {loading ? (
        <div className="h-9 w-44 rounded-lg bg-emerald-500/10 animate-pulse" />
      ) : (
        <p className="text-[32px] font-bold tracking-tight text-emerald-400">
          {formatAmount(value)}
        </p>
      )}
    </div>
  );
}

// Income / Expenses supporting cards
function SummaryCard({ label, value, icon: Icon, tone, loading }) {
  const isRose = tone === "rose";
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11.5px] text-slate-500 font-medium">{label}</p>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full
          ${isRose ? "bg-rose-500/12 text-rose-400" : "bg-emerald-500/12 text-emerald-400"}`}
        >
          <Icon size={14} strokeWidth={1.8} />
        </span>
      </div>
      {loading ? (
        <div className="h-6 w-full rounded-lg bg-slate-800 animate-pulse" />
      ) : (
        <p
          className={`text-[16px] font-semibold tracking-tight
          ${isRose && value > 0 ? "text-rose-400" : "text-slate-50"}`}
        >
          {formatAmount(value)}
        </p>
      )}
    </div>
  );
}
