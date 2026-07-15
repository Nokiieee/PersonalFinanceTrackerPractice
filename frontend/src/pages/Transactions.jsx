import { useEffect, useState, useCallback } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  SearchX,
  Inbox,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import EditTransactionModal from "../components/layout/EditTransactionModal";
import ConfirmModal from "../components/common/ConfirmModal";

const formatAmount = (amount, type) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });

const TYPE_FILTERS = ["All", "Income", "Expense"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateTransaction = async (payload) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await updateTransaction(editTarget._id, payload);
      setEditTarget(null);
      await load();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTransaction(deleteTarget._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
      await load();
    }
  };

  const filtered = transactions.filter((t) => {
    const matchesType =
      typeFilter === "All" || t.type === typeFilter.toLowerCase();
    const matchesSearch =
      search === "" ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-4 py-2.5
                       text-[13.5px] text-slate-100 placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-shadow"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors
                ${
                  typeFilter === f
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3">
          <p className="text-[13px] text-rose-400">{error}</p>
        </div>
      )}

      {/* Table card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_1fr_72px] gap-4 px-5 py-3 border-b border-slate-800/80">
          {["Date", "Description", "Category", "Amount"].map((h) => (
            <p
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              {h}
            </p>
          ))}
          <span aria-hidden="true" />
        </div>

        {/* Rows */}
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={search !== "" || typeFilter !== "All"} />
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {filtered.map((t) => (
              <TransactionRow
                key={t._id}
                transaction={t}
                onEdit={() => setEditTarget(t)}
                onDelete={() => setDeleteTarget(t)}
              />
            ))}
          </ul>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800/80">
            <p className="text-[12px] text-slate-500">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
              {typeFilter !== "All" || search ? " found" : " total"}
            </p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditTransactionModal
        isOpen={!!editTarget}
        transaction={editTarget}
        onClose={() => {
          setEditTarget(null);
          setSubmitError(null);
        }}
        onSubmit={handleUpdateTransaction}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        icon={Trash2}
        title="Delete this transaction?"
        message={
          deleteTarget
            ? `${deleteTarget.category} — ${formatAmount(deleteTarget.amount)} will be permanently deleted.`
            : ""
        }
        confirmLabel="Delete Transaction"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ----- Sub-components ------------------------------------------------

function TransactionRow({ transaction: t, onEdit, onDelete }) {
  const isIncome = t.type === "income";

  return (
    <li className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1fr_1fr_72px] gap-1 sm:gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors">
      {/* Date */}
      <div className="flex items-center gap-2">
        <span
          className={`hidden sm:flex h-7 w-7 items-center justify-center rounded-full shrink-0
          ${isIncome ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"}`}
        >
          {isIncome ? (
            <ArrowDownCircle size={14} strokeWidth={2} />
          ) : (
            <ArrowUpCircle size={14} strokeWidth={2} />
          )}
        </span>
        <span className="text-[13px] text-slate-400">{formatDate(t.date)}</span>
      </div>

      {/* Description */}
      <div className="sm:flex sm:items-center">
        {/* Mobile: show type badge inline */}
        <div className="flex items-center gap-2 sm:hidden mb-0.5">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0
            ${isIncome ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"}`}
          >
            {isIncome ? (
              <ArrowDownCircle size={11} strokeWidth={2} />
            ) : (
              <ArrowUpCircle size={11} strokeWidth={2} />
            )}
          </span>
          <span
            className={`text-[11px] font-medium ${isIncome ? "text-emerald-400" : "text-rose-400"}`}
          >
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>
        <p className="text-[13.5px] text-slate-200 truncate">
          {t.description || (
            <span className="text-slate-600 italic">No description</span>
          )}
        </p>
      </div>

      {/* Category */}
      <div className="sm:flex sm:items-center">
        <span className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700/60 px-2.5 py-0.5 text-[11.5px] font-medium text-slate-300">
          {t.category}
        </span>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between sm:justify-start">
        <p
          className={`text-[14px] font-semibold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(t.amount)}
        </p>

        {/* Actions (mobile: inline with amount) */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Edit transaction"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            aria-label="Delete transaction"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Actions (desktop: own column) */}
      <div className="hidden sm:flex sm:items-center sm:justify-end gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Edit transaction"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          aria-label="Delete transaction"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-slate-800/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1fr_1fr_72px] gap-4 px-5 py-4"
        >
          {[" w-24", "w-40", "w-20", "w-20", "w-8"].map((w, j) => (
            <div
              key={j}
              className={`h-4 rounded-lg bg-slate-800 animate-pulse ${w}`}
            />
          ))}
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-5 text-center">
      {hasSearch ? (
        <SearchX size={32} className="text-slate-700" strokeWidth={1.5} />
      ) : (
        <Inbox size={32} className="text-slate-700" strokeWidth={1.5} />
      )}
      <div>
        <p className="text-[14px] font-medium text-slate-400">
          {hasSearch ? "No transactions found" : "No transactions yet"}
        </p>
        <p className="text-[12.5px] text-slate-600 mt-1">
          {hasSearch
            ? "Try a different search term or filter"
            : "Add your first income or expense to get started"}
        </p>
      </div>
    </div>
  );
}
