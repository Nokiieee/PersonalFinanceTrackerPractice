import express from "express";
import SavingsGoal from "../models/savingsGoal.model.js";
import SavingsActivity from "../models/savingsActivity.model.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All savings goal routes require a valid JWT
router.use(protect);

// GET /api/goals
// Returns all goals with saved amount derived from their activity history.
router.get("/", async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const enriched = await Promise.all(
      goals.map(async (g) => {
        const activities = await SavingsActivity.find({
          userId: req.user._id,
          goalId: g._id,
        }).sort({ date: -1, createdAt: -1 });

        const savedAmount = activities.reduce(
          (sum, a) => sum + (a.type === "deposit" ? a.amount : -a.amount),
          0,
        );
        const remaining = g.targetAmount - savedAmount;
        const percentageUsed =
          g.targetAmount > 0
            ? Math.round((savedAmount / g.targetAmount) * 100)
            : 0;

        return {
          _id: g._id,
          name: g.name,
          targetAmount: g.targetAmount,
          savedAmount,
          remaining,
          percentageUsed,
          isCompleted: savedAmount >= g.targetAmount,
          activities,
        };
      }),
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error fetching goals:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/goals
router.post("/", async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    const goal = await SavingsGoal.create({
      userId: req.user._id,
      name,
      targetAmount,
    });
    res.status(201).json({
      success: true,
      data: {
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: 0,
        remaining: goal.targetAmount,
        percentageUsed: 0,
        isCompleted: false,
        activities: [],
      },
      message: "Savings goal created",
    });
  } catch (error) {
    console.error("Error creating goal:", error.message);
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

// PUT /api/goals/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    const updated = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, targetAmount },
      { new: true, runValidators: true },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Savings goal not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating goal:", error.message);
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

// DELETE /api/goals/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Savings goal not found" });
    }
    await SavingsActivity.deleteMany({
      userId: req.user._id,
      goalId: deleted._id,
    });
    res.status(200).json({ success: true, message: "Savings goal deleted" });
  } catch (error) {
    console.error("Error deleting goal:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/goals/:id/activities — record a deposit or withdrawal
router.post("/:id/activities", async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Savings goal not found" });
    }

    const { type, amount, description, date } = req.body;

    if (type === "withdrawal") {
      const activities = await SavingsActivity.find({
        userId: req.user._id,
        goalId: goal._id,
      });
      const savedAmount = activities.reduce(
        (sum, a) => sum + (a.type === "deposit" ? a.amount : -a.amount),
        0,
      );
      if (Number(amount) > savedAmount) {
        return res.status(400).json({
          success: false,
          message: "Withdrawal amount exceeds the current saved amount",
        });
      }
    }

    const activity = await SavingsActivity.create({
      userId: req.user._id,
      goalId: goal._id,
      type,
      amount,
      description,
      date,
    });
    res
      .status(201)
      .json({ success: true, data: activity, message: "Activity recorded" });
  } catch (error) {
    console.error("Error creating activity:", error.message);
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

// PUT /api/goals/:goalId/activities/:activityId
router.put("/:goalId/activities/:activityId", async (req, res) => {
  try {
    const activity = await SavingsActivity.findOne({
      _id: req.params.activityId,
      goalId: req.params.goalId,
      userId: req.user._id,
    });
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    const { amount, description, date } = req.body;

    if (activity.type === "withdrawal") {
      const others = await SavingsActivity.find({
        userId: req.user._id,
        goalId: req.params.goalId,
        _id: { $ne: activity._id },
      });
      const savedWithoutThis = others.reduce(
        (sum, a) => sum + (a.type === "deposit" ? a.amount : -a.amount),
        0,
      );
      if (Number(amount) > savedWithoutThis) {
        return res.status(400).json({
          success: false,
          message: "Withdrawal amount exceeds the current saved amount",
        });
      }
    }

    activity.amount = amount;
    activity.description = description;
    if (date) activity.date = date;
    await activity.save();

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    console.error("Error updating activity:", error.message);
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

// DELETE /api/goals/:goalId/activities/:activityId
router.delete("/:goalId/activities/:activityId", async (req, res) => {
  try {
    const deleted = await SavingsActivity.findOneAndDelete({
      _id: req.params.activityId,
      goalId: req.params.goalId,
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, message: "Activity deleted" });
  } catch (error) {
    console.error("Error deleting activity:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
