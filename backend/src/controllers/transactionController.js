import Transaction from "../models/Transaction.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({
    date: -1,
  });

  res.json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = asyncHandler(async (req, res) => {
  const { description, amount, type, category, date } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    description,
    amount,
    type,
    category,
    date: date || new Date(),
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = asyncHandler(async (req, res) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new ApiError("Transaction not found", 404);
  }

  // Verify transaction belongs to user
  if (transaction.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized", 401);
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: transaction,
  });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new ApiError("Transaction not found", 404);
  }

  // Verify transaction belongs to user
  if (transaction.user.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized", 401);
  }

  await transaction.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});
