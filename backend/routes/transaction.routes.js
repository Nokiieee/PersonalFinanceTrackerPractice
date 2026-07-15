import express from "express";
import Transaction from "../models/transaction.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All transaction routes require a valid JWT
router.use(protect);

// GET /api/transactions/summary
router.get("/summary", async (req, res) => {
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

// GET /api/transactions/category-breakdown
router.get("/category-breakdown", async (req, res) => {
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

// GET /api/transactions/monthly-spending
router.get("/monthly-spending", async (req, res) => {
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

// GET /api/transactions/report?startDate=...&endDate=...
router.get("/report", async (req, res) => {
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

// GET /api/transactions
router.get("/", async (req, res) => {
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

// POST /api/transactions
router.post("/", async (req, res) => {
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

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
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

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
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

export default router;
