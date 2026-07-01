import { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import AddTransactionModal from "./AddTransactionModal";
import { createTransaction } from "../../services/transactionService";

// refreshKey is passed to <Outlet /> via context so pages can re-fetch when it changes
export default function AppLayout() {
  const [addOpen, setAddOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleCreateTransaction = useCallback(
    async (data) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await createTransaction(data);
        setAddOpen(false);
        // Bump the key so any page currently mounted will re-fetch its data
        setRefreshKey((k) => k + 1);
        // If not on dashboard, navigate there so the user sees updated totals
        navigate("/dashboard");
      } catch (err) {
        setSubmitError(
          err.response?.data?.message ||
            "Failed to save transaction. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onAddClick={() => setAddOpen(true)} />
        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-6 pb-24 md:pb-8">
          {/* refreshKey forces child pages to re-mount and re-fetch after a transaction is saved */}
          <Outlet key={refreshKey} />
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
