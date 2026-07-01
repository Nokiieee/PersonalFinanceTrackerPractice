import mongoose from "mongoose";

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
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

const Transaction = mongoose.model("transaction", transactionSchema);

export default Transaction;
