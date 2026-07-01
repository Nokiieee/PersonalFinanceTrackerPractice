import { useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import SheetOption from "../common/SheetOption";
import TransactionForm from "../common/TransactionForm";

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}) {
  const [step, setStep] = useState("choose"); // "choose" | "form"
  const [type, setType] = useState(null); // "income" | "expense"

  if (!isOpen) return null;

  const handleChoose = (chosenType) => {
    setType(chosenType);
    setStep("form");
  };

  const handleClose = () => {
    onClose();
    // Reset for next time the modal opens
    setStep("choose");
    setType(null);
  };

  const content =
    step === "choose" ? (
      <ChooseType onSelect={handleChoose} />
    ) : (
      <TransactionForm
        type={type}
        onBack={() => setStep("choose")}
        onCancel={handleClose}
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
        onClick={handleClose}
      />

      {/* Desktop: centered modal card */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl shadow-slate-950/50 animate-[scaleIn_0.18s_ease-out] max-h-[90vh] overflow-y-auto">
          {step === "choose" && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-slate-50">
                Add a transaction
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          )}
          {content}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 rounded-t-3xl bg-slate-900 border-t border-slate-800 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-[slideUp_0.25s_ease-out] max-h-[85vh] overflow-y-auto">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-700 mb-4" />
        {step === "choose" && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-50">
              Add a transaction
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-300 p-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
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

function ChooseType({ onSelect }) {
  return (
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
  );
}
