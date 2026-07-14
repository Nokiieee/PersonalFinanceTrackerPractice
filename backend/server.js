import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import Transaction from "./models/transaction.model.js";
import Budget from "./models/budget.model.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";

dotenv.config({ path: new URL(".env", import.meta.url).pathname.slice(1) });

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in your .env file.");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("server is live!"));

app.use("/api/auth", authRoutes);

// ─── Transaction Routes ───────────────────────────────────────────────────────

app.get("/api/transactions/summary", protect, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);
    const income = result.find((r) => r._id === "income")?.total || 0;
    const expenses = result.find((r) => r._id === "expense")?.total || 0;
    res.status(200).json({
      success: true,
      data: {
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/transactions/category-breakdown", protect, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);
    const totalExpenses = result.reduce((sum, r) => sum + r.total, 0);
    const data = result.map((r) => ({
      category: r._id,
      total: r.total,
      percentage:
        totalExpenses > 0 ? Math.round((r.total / totalExpenses) * 100) : 0,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/transactions/monthly-spending", protect, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = MONTHS.map((name, i) => {
      const month = i + 1;
      const income =
        result.find((r) => r._id.month === month && r._id.type === "income")
          ?.total || 0;
      const expense =
        result.find((r) => r._id.month === month && r._id.type === "expense")
          ?.total || 0;
      return { month: name, income, expense };
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/transactions/report", protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "startDate and endDate are required",
        });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const periodMs = end - start;
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodMs);

    const getPeriodTotals = async (from, to) => {
      const result = await Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: from, $lte: to } } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]);
      const income = result.find((r) => r._id === "income")?.total || 0;
      const expenses = result.find((r) => r._id === "expense")?.total || 0;
      return {
        totalIncome: income,
        totalExpenses: expenses,
        savings: income - expenses,
      };
    };

    const categoryResult = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: "expense",
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);
    const totalExp = categoryResult.reduce((sum, r) => sum + r.total, 0);
    const categoryBreakdown = categoryResult.map((r) => ({
      category: r._id,
      total: r.total,
      percentage: totalExp > 0 ? Math.round((r.total / totalExp) * 100) : 0,
    }));

    const trendResult = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    const dayMap = {};
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      dayMap[key] = { date: key, income: 0, expense: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const r of trendResult) {
      if (dayMap[r._id.day]) dayMap[r._id.day][r._id.type] = r.total;
    }
    const dailyTrend = Object.values(dayMap);

    const [current, previous] = await Promise.all([
      getPeriodTotals(start, end),
      getPeriodTotals(prevStart, prevEnd),
    ]);

    const savingsRate =
      current.totalIncome > 0
        ? Math.round((current.savings / current.totalIncome) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        current: { ...current, savingsRate, categoryBreakdown, dailyTrend },
        previous,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/transactions", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/api/transactions", protect, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user._id,
    });
    await newTransaction.save();
    res
      .status(201)
      .json({
        success: true,
        data: newTransaction,
        message: "Transaction created",
      });
  } catch (error) {
    console.error(error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.delete("/api/transactions/:id", protect, async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.put("/api/transactions/:id", protect, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ─── Budget Routes ────────────────────────────────────────────────────────────

// GET /api/budgets
// Returns all budgets with expense totals and category breakdown.
// Auto-creates current month if it doesn't exist yet.
app.get("/api/budgets", protect, async (req, res) => {
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
app.put("/api/budgets/:id", protect, async (req, res) => {
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

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server is live on port ${PORT}!`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
