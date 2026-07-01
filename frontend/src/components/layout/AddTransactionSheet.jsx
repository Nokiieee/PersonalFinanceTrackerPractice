import { X, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import SheetOption from "../common/SheetOption";

export default function AddTransactionSheet({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-slate-900 border-t border-slate-800 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-[slideUp_0.25s_ease-out]">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-700 mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-50">Add a transaction</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <SheetOption
            icon={ArrowDownCircle}
            label="Add Income"
            description="Log money coming in"
            tone="emerald"
            onClick={() => onSelect("income")}
          />
          <SheetOption
            icon={ArrowUpCircle}
            label="Add Expense"
            description="Log money going out"
            tone="rose"
            onClick={() => onSelect("expense")}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
