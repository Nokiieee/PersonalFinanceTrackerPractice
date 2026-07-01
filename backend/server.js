import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import Transaction from "./models/transaction.model.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";

dotenv.config({ path: new URL(".env", import.meta.url).pathname.slice(1) });

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in your .env file.");
  process.exit(1);
}

const app = express();

// MIDDLEWARE
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ROUTES
app.get("/", (req, res) => res.send("server is live!"));

// Auth (public)
app.use("/api/auth", authRoutes);

// --- Transactions (all protected) ---

// GET /api/transactions/summary
// Returns balance, totalIncome, totalExpenses for the logged-in user
app.get("/api/transactions/summary", protect, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
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
    console.error("Error fetching summary:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/transactions
app.get("/api/transactions", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/transactions
app.post("/api/transactions", protect, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user._id, // always taken from the token, never from the request body
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
    console.error("Error creating transaction:", error.message);
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
app.delete("/api/transactions/:id", protect, async (req, res) => {
  try {
    // userId filter ensures a user can only delete their own transactions
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /api/transactions/:id
app.put("/api/transactions/:id", protect, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating transaction:", error.message);
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

app.listen(5000, () => {
  connectDB();
  console.log("server is live on port 5000!");
});
