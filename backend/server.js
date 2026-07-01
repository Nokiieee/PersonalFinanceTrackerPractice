import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Transaction from "./models/transaction.model.js";
import cors from "cors";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.listen(5000, () => {
  connectDB();
  console.log("server is live!");
});

app.get("/", (req, res) => {
  res.send("server is live!");
});

// GET all transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// CREATE a transaction
app.post("/api/transactions", async (req, res) => {
  const transaction = req.body;

  try {
    const newTransaction = new Transaction(transaction);
    await newTransaction.save();
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: "Transaction created",
    });
  } catch (error) {
    console.error("Error creating transaction:", error.message);

    // Mongoose validation errors (missing/invalid fields) -> 400, not 500
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// DELETE a transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
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

// UPDATE a transaction
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
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
