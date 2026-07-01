export default function PageStub({ title }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Balance", "Income", "Expenses"].map((label) => (
          <div
            key={label}
            className="rounded-2xl bg-slate-900 border border-slate-800/80 p-5 hover:border-slate-700 transition-colors"
          >
            <p className="text-[12px] text-slate-500 mb-1.5">{label}</p>
            <p className="text-[22px] font-semibold text-slate-50 tracking-tight">
              ₱48,250
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-6 min-h-[260px] flex items-center justify-center">
        <p className="text-[13px] text-slate-600">{title} content goes here</p>
      </div>
    </div>
  );
}
