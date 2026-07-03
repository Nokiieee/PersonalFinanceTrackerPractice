import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#f472b6", // pink
  "#fb923c", // orange
  "#a78bfa", // violet
  "#facc15", // yellow
  "#38bdf8", // sky
  "#f87171", // red
];

const formatPHP = (v) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(v);

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, total, percentage } = payload[0].payload;
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2.5 shadow-xl text-[12.5px]">
      <p className="font-semibold text-slate-100 mb-0.5">{category}</p>
      <p className="text-slate-400">
        {formatPHP(total)} · {percentage}%
      </p>
    </div>
  );
}

function CustomLegend({ payload }) {
  // Always push "Other" to the end regardless of data order
  const sorted = [...payload].sort((a, b) => {
    if (a.value.toLowerCase() === "other") return 1;
    if (b.value.toLowerCase() === "other") return -1;
    return 0;
  });

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {sorted.map((entry, i) => (
        <li
          key={i}
          className="flex items-center gap-1.5 text-[12px] text-slate-400"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function ExpensePieChart({ data, loading }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-slate-100">
          Where money goes
        </h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Expense breakdown by category
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-56">
          <div className="h-40 w-40 rounded-full bg-slate-800 animate-pulse" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <p className="text-[13px] text-slate-600">No expense data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
