import { LogOut } from "lucide-react";

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl shadow-slate-950/50 animate-[scaleIn_0.18s_ease-out]">
          {/* Icon + Text — centered */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-4">
              <LogOut size={24} className="text-rose-400" strokeWidth={2} />
            </div>
            <h2 className="text-[16px] font-semibold text-slate-50 mb-1">
              Sign out?
            </h2>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              You&apos;ll be returned to the login screen. <br></br>Any unsaved
              changes will be lost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-700 py-2.5 text-[13.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-400 py-2.5 text-[13.5px] font-semibold text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
