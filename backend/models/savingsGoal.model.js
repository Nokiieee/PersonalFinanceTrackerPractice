import mongoose from "mongoose";

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [0.01, "Target amount must be greater than 0"],
    },
  },
  { timestamps: true },
);

const SavingsGoal = mongoose.model("SavingsGoal", savingsGoalSchema);
export default SavingsGoal;
