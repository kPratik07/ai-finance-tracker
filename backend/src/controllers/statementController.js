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
    // Increased to 500000 to handle large statements with chunking support
    const MAX_CONTENT_LENGTH = 500000;
    if (fileContent.length > MAX_CONTENT_LENGTH) {
      throw new ApiError(
        "The uploaded file is too large. Please try uploading a statement with fewer transactions (max 24 months recommended).",
        400
      );
    }

    // Process statement with AI (auto-selects best provider: Groq > Gemini > OpenAI)
    // Large statements will be automatically chunked and processed in batches
    const transactions = await processStatementWithAI(fileContent, req.user._id);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      message: transactions.length > 0 
        ? `Successfully processed ${transactions.length} transactions` 
        : 'No transactions found in the statement',
    });
  } catch (error) {
    console.error('Statement upload error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('rate_limit') || error.message.includes('429')) {
      errorMessage = '⏳ Rate Limit: The AI service is currently busy. Please try again in a few moments.';
      statusCode = 429;
    } else if (error.message.includes('Invalid or empty file')) {
      errorMessage = '❌ Invalid File: The uploaded file appears to be empty or corrupted. Please try a different file.';
      statusCode = 400;
    } else if (error.message.includes('does not appear to be a bank statement') || error.message.includes('Invalid File')) {
      errorMessage = '⚠️ Not a Bank Statement: The uploaded file does not contain bank statement data. Please upload a valid bank statement (PDF, CSV, or TXT) with transaction details from banks like Kotak, HDFC, ICICI, SBI, Axis, etc.';
      statusCode = 400;
    } else if (error.message.includes('No transactions found')) {
      errorMessage = '📭 No Transactions: No valid transactions were found in the statement. Please ensure the file contains transaction data with dates, amounts, and descriptions.';
      statusCode = 400;
    }
    
    throw new ApiError(errorMessage, statusCode);
  }
});
