import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const formatPHP = (v) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(v);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 shadow-xl text-[12.5px]">
      <p className="font-semibold text-slate-100 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }} className="mb-0.5">
          {p.name === "income" ? "Income" : "Expense"}: {formatPHP(p.value)}
        </p>
      ))}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-5 mt-2 text-[12px] text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Income
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400" /> Expense
      </span>
    </div>
  );
}

export default function MonthlyBarChart({ data, loading }) {
  // Only show months up to the current month so future months don't appear empty
  const currentMonth = new Date().getMonth(); // 0-indexed
  const visibleData = data.slice(0, currentMonth + 1);
  const isEmpty = visibleData.every((d) => d.income === 0 && d.expense === 0);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-slate-100">Monthly overview</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Income vs expenses · {new Date().getFullYear()}
        </p>
      </div>

      {loading ? (
        <div className="flex items-end gap-2 h-56 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-slate-800 animate-pulse"
              style={{ height: `${40 + i * 15}%` }}
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center h-56">
          <p className="text-[13px] text-slate-600">No spending data yet</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={visibleData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="income"  fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <CustomLegend />
        </>
      )}
    </div>
  );
}
