import express from "express";
import Budget from "../models/budget.model.js";
import Transaction from "../models/transaction.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All budget routes require a valid JWT
router.use(protect);

// GET /api/budgets
// Returns all budgets with expense totals and category breakdown.
// Auto-creates current month if it doesn't exist yet.
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Auto-create current month budget if missing
    const exists = await Budget.findOne({
      userId: req.user._id,
      month: currentMonth,
    });
    if (!exists) {
      // Inherit amount from the most recent previous budget
      const latest = await Budget.findOne({ userId: req.user._id }).sort({
        month: -1,
      });
      await Budget.create({
        userId: req.user._id,
        month: currentMonth,
        amount: latest?.amount ?? 0,
      });
    }

    const budgets = await Budget.find({ userId: req.user._id }).sort({
      month: -1,
    });

    // For each budget, aggregate expenses + category breakdown
    const enriched = await Promise.all(
      budgets.map(async (b) => {
        const [year, month] = b.month.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        // Category breakdown with individual transactions
        const transactions = await Transaction.find({
          userId: req.user._id,
          type: "expense",
          date: { $gte: start, $lte: end },
        }).sort({ date: -1 });

        // Group transactions by category
        const categoryMap = {};
        for (const t of transactions) {
          if (!categoryMap[t.category]) {
            categoryMap[t.category] = {
              category: t.category,
              total: 0,
              transactions: [],
            };
          }
          categoryMap[t.category].total += t.amount;
          categoryMap[t.category].transactions.push(t);
        }

        const totalExpenses = transactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );
        const categoryBreakdown = Object.values(categoryMap)
          .sort((a, z) => z.total - a.total)
          .map((c) => ({
            ...c,
            percentage:
              b.amount > 0 ? Math.round((c.total / b.amount) * 100) : 0,
          }));

        // Days left in month (only relevant for current month)
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const daysLeft =
          b.month === currentMonth ? daysInMonth - today.getDate() : 0;

        return {
          _id: b._id,
          month: b.month,
          amount: b.amount,
          totalExpenses,
          remaining: b.amount - totalExpenses,
          percentageUsed:
            b.amount > 0 ? Math.round((totalExpenses / b.amount) * 100) : 0,
          daysLeft,
          isCurrentMonth: b.month === currentMonth,
          categoryBreakdown,
        };
      }),
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error fetching budgets:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /api/budgets/:id — update budget amount
router.put("/:id", async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || amount < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid budget amount" });
    }
    const updated = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount },
      { new: true, runValidators: true },
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating budget:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
