import { ChevronRight } from "lucide-react";

export default function SheetOption({ icon: Icon, label, description, tone = "emerald", onClick }) {
  const toneClasses =
    tone === "emerald" ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 w-full rounded-2xl bg-slate-800/60 hover:bg-slate-800 active:scale-[0.99] transition-all px-4 py-3.5 text-left"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${toneClasses}`}>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-slate-100">{label}</p>
        <p className="text-[12px] text-slate-500">{description}</p>
      </span>
      <ChevronRight size={18} className="text-slate-600" />
    </button>
  );
}
