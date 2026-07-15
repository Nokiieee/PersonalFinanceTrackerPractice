import { X } from "lucide-react";
import TransactionForm from "../common/TransactionForm";

export default function EditTransactionModal({
  isOpen,
  transaction,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}) {
  if (!isOpen || !transaction) return null;

  const initialValues = {
    amount: transaction.amount,
    category: transaction.category,
    date: new Date(transaction.date).toISOString().slice(0, 10),
    description: transaction.description ?? "",
  };

  const content = (
    <TransactionForm
      type={transaction.type}
      isEdit
      initialValues={initialValues}
      onCancel={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Desktop: centered modal card */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl shadow-slate-950/50 animate-[scaleIn_0.18s_ease-out] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-end mb-1">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          {content}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 rounded-t-3xl bg-slate-900 border-t border-slate-800 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-[slideUp_0.25s_ease-out] max-h-[85vh] overflow-y-auto">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-700 mb-4" />
        <div className="flex items-center justify-end mb-1">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {content}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
