import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { PAGE_TITLES } from "../../constants/navigation";

export default function TopBar({ onAddClick }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || "Finch";

  return (
    <header className="h-16 flex items-center justify-between px-5 md:px-8 border-b border-slate-800/80 shrink-0">
      <div>
        <h1 className="text-[17px] font-semibold text-slate-50 leading-none">
          {title}
        </h1>
        <p className="hidden md:block text-[12px] text-slate-500 mt-1">
          Personal Finance Tracker
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="hidden md:flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-500 transition-colors px-4 py-2 text-[13px] font-medium text-slate-950 shadow-sm shadow-emerald-500/20"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Transaction
      </button>
    </header>
  );
}
