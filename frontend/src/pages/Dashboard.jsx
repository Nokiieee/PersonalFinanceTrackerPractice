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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Balance"
          value={summary.balance}
          icon={Wallet}
          tone="emerald"
          loading={loading}
        />
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

function SummaryCard({ label, value, icon: Icon, tone, loading }) {
  const isRose = tone === "rose";
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5 hover:border-slate-700 transition-colors">
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
        <div className="h-7 w-32 rounded-lg bg-slate-800 animate-pulse" />
      ) : (
        <p
          className={`text-[22px] font-semibold tracking-tight
          ${isRose && value > 0 ? "text-rose-400" : "text-slate-50"}`}
        >
          {formatAmount(value)}
        </p>
      )}
    </div>
  );
}
