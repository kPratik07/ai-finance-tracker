import asyncHandler from "../utils/asyncHandler.js";
import { processStatementWithAI } from "../services/aiStatementProcessor.js";
import { parseFile } from "../utils/fileParser.js";
import ApiError from "../utils/apiError.js";

export const uploadStatement = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("Please upload a file", 400);
  }

  try {
    // Parse file content
    const fileContent = await parseFile(req.file);

    // Validate content length (AI models have token limits)
    // Increased to 50000 to handle 3-6 month statements
    const MAX_CONTENT_LENGTH = 50000;
    if (fileContent.length > MAX_CONTENT_LENGTH) {
      throw new ApiError(
        "The uploaded file contains too much data. Please try uploading a statement with fewer transactions (max 6 months recommended).",
        400
      );
    }

    // Process statement with AI (auto-selects best provider: Groq > Gemini > OpenAI)
    const transactions = await processStatementWithAI(fileContent, req.user._id);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    throw new ApiError(`Error processing statement: ${error.message}`, 500);
  }
});
