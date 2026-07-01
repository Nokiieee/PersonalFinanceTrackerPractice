import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import AddTransactionModal from "./AddTransactionModal";
import { createTransaction } from "../../services/transactionService";

export default function AppLayout() {
  const [addOpen, setAddOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTransaction = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await createTransaction(data);
      console.log("Transaction saved:", saved);
      setAddOpen(false);
      // TODO: refresh transaction list / dashboard data here,
      // e.g. via a shared query client, context, or by refetching.
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to save transaction. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onAddClick={() => setAddOpen(true)} />
        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav onAddClick={() => setAddOpen(true)} />
      <AddTransactionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreateTransaction}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
