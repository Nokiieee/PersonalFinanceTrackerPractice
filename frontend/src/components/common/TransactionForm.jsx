import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
} from "lucide-react";
import { getCategoriesForType } from "../../constants/transactionCategories";

const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TransactionForm({
  type,
  onBack,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = null,
  initialValues = null,
  isEdit = false,
}) {
  const categories = getCategoriesForType(type);

  const [form, setForm] = useState({
    amount: initialValues?.amount != null ? String(initialValues.amount) : "",
    category: initialValues?.category ?? "",
    date: initialValues?.date ?? todayISO(),
    description: initialValues?.description ?? "",
  });
  const [errors, setErrors] = useState({});

  const isIncome = type === "income";

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.amount || Number(form.amount) <= 0) {
      next.amount = "Enter an amount greater than 0";
    }
    if (!form.category) {
      next.category = "Select a category";
    }
    if (!form.date) {
      next.date = "Select a date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      amount: Number(form.amount),
      category: form.category,
      type,
      date: form.date,
      description: form.description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        {!isEdit && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-slate-300 p-1 -ml-1 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
            isIncome
              ? "bg-emerald-500/12 text-emerald-400"
              : "bg-rose-500/12 text-rose-400"
          }`}
        >
          {isIncome ? (
            <ArrowDownCircle size={18} strokeWidth={1.8} />
          ) : (
            <ArrowUpCircle size={18} strokeWidth={1.8} />
          )}
        </span>
        <h2 className="text-[15px] font-semibold text-slate-50">
          {isEdit
            ? isIncome
              ? "Edit Income"
              : "Edit Expense"
            : isIncome
              ? "Add Income"
              : "Add Expense"}
        </h2>
      </div>

      {/* Server error banner */}
      {submitError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5">
          <p className="text-[12.5px] text-rose-400">{submitError}</p>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[14px]">
            ₱
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange("amount")}
            disabled={isSubmitting}
            className={`w-full rounded-xl bg-slate-800/70 border px-7 py-2.5 text-[14px] text-slate-100 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60
                       ${
                         errors.amount
                           ? "border-rose-500/60 focus:ring-rose-500/30"
                           : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                       }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-[12px] text-rose-400">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
          Category
        </label>
        <select
          value={form.category}
          onChange={handleChange("category")}
          disabled={isSubmitting}
          className={`w-full rounded-xl bg-slate-800/70 border px-3.5 py-2.5 text-[14px] text-slate-100
                     focus:outline-none focus:ring-2 transition-shadow appearance-none disabled:opacity-60
                     ${
                       errors.category
                         ? "border-rose-500/60 focus:ring-rose-500/30"
                         : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                     }`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-[12px] text-rose-400">{errors.category}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={form.date}
          onChange={handleChange("date")}
          disabled={isSubmitting}
          className={`w-full rounded-xl bg-slate-800/70 border px-3.5 py-2.5 text-[14px] text-slate-100
                     focus:outline-none focus:ring-2 transition-shadow disabled:opacity-60
                     ${
                       errors.date
                         ? "border-rose-500/60 focus:ring-rose-500/30"
                         : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                     }`}
        />
        {errors.date && (
          <p className="mt-1 text-[12px] text-rose-400">{errors.date}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-[12.5px] font-medium text-slate-400 mb-1.5">
          Description <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Add a note..."
          value={form.description}
          onChange={handleChange("description")}
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl bg-slate-800/70 border border-slate-700 px-3.5 py-2.5 text-[14px] text-slate-100
                     placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-shadow disabled:opacity-60"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-slate-700 py-2.5 text-[13.5px] font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13.5px] font-semibold text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed
                     ${isIncome ? "bg-emerald-500 hover:bg-emerald-400" : "bg-rose-500 hover:bg-rose-400"}`}
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : `Save ${isIncome ? "Income" : "Expense"}`}
        </button>
      </div>
    </form>
  );
}
