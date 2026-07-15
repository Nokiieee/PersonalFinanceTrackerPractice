import mongoose from "mongoose";

const savingsActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingsGoal",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["deposit", "withdrawal"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true },
);

const SavingsActivity = mongoose.model("SavingsActivity", savingsActivitySchema);
export default SavingsActivity;
