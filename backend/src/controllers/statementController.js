import asyncHandler from "../utils/asyncHandler.js";
import { processStatement } from "../services/statementProcessing.js";
import { parseFile } from "../utils/fileParser.js";
import ApiError from "../utils/apiError.js";

export const uploadStatement = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("Please upload a file", 400);
  }

  try {
    // Parse file content
    const fileContent = await parseFile(req.file);

    // Process statement and extract transactions
    const transactions = await processStatement(fileContent, req.user._id);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    throw new ApiError(`Error processing statement: ${error.message}`, 500);
  }
});
