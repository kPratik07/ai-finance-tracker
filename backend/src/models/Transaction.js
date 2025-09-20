import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    currency: {
      type: String,
      default: "INR", // Default to INR, can be overridden
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please specify transaction type"],
      enum: ["income", "expense"],
      default: "expense",
    },
    category: {
      type: String,
      required: [true, "Please specify a category"],
      enum: [
        "salary",
        "food",
        "transport",
        "utilities",
        "entertainment",
        "shopping",
        "healthcare",
        "other",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    merchant: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ category: 1 });

export default mongoose.model("Transaction", transactionSchema);
