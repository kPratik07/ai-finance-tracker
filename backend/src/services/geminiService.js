import { GoogleGenerativeAI } from "@google/generative-ai";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get Gemini client instance
 */
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Process a bank statement using Google's Gemini AI
 * @param {string} content - The text content of the bank statement
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of processed transactions
 */
export const processStatementWithGemini = async (content, userId) => {
  try {
    if (!content || content.trim().length < 10) {
      throw new Error("Invalid or empty file content");
    }

    console.log("=== PROCESSING STATEMENT WITH GEMINI ===");
    console.log("Content length:", content.length);
    console.log("User ID:", userId);

    // Check if content contains bank statement keywords
    const hasBankKeywords =
      content.toLowerCase().includes("kotak") ||
      content.toLowerCase().includes("bank") ||
      content.toLowerCase().includes("upi") ||
      content.toLowerCase().includes("transaction");

    if (!hasBankKeywords) {
      throw new Error("Content does not appear to be a bank statement");
    }

    // Get Gemini client
    const geminiClient = getGeminiClient();
    if (!geminiClient) {
      throw new Error("Gemini API key not configured");
    }

    // Get the model
    const model = geminiClient.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      }
    });

    // Improved prompt for Indian bank statements
    const prompt = `Extract ALL transactions from this Indian bank statement. This appears to be a bank statement (Kotak/HDFC/SBI/ICICI).

IMPORTANT RULES:
1. Extract ONLY real transactions from the statement (ignore headers, footers, account details)
2. Look for transaction rows with Date, Narration, Amount, and Balance columns
3. For UPI transactions: extract the merchant name from the narration (e.g., "UPI/LILA PITTURA DECO" -> "LILA PITTURA DECO")
4. For IMPS/NEFT: extract the sender/receiver name
5. Amounts: Use the "Withdrawal(Dr)/Deposit(Cr)" column values
6. Type: "income" for (Cr) credits, "expense" for (Dr) debits
7. Currency: INR (Indian Rupees)
8. Date: Use the exact date from the statement (format: YYYY-MM-DD)
9. Category: Categorize based on merchant/description:
   - UPI/Gaming apps -> "entertainment"
   - UPI/Food merchants -> "food" 
   - UPI/Transport -> "transport"
   - IMPS/NEFT transfers -> "other"
   - Salary/credits -> "salary"
   - Shopping -> "shopping"
   - Bills/utilities -> "utilities"

Statement content:
${content}

Return ONLY a JSON array of transactions in this exact format (no markdown, no explanation):
[
  {
    "description": "Original transaction description from statement",
    "amount": 300.00,
    "type": "income",
    "category": "other",
    "date": "2023-09-06",
    "merchant": "LILA PITTURA DECO",
    "currency": "INR"
  }
]`;

    console.log("Calling Gemini API...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log("Gemini API call successful");

    // Parse response
    let transactions;
    try {
      console.log("AI Response length:", responseText.length);
      console.log("AI Response preview:", responseText.substring(0, 200));

      // Remove markdown code blocks if present
      let cleanedContent = responseText.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/```\n?/g, "");
      }

      // Try to extract JSON from the response
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        transactions = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying direct parse...");
        transactions = JSON.parse(cleanedContent);
      }

      console.log("Parsed transactions count:", transactions.length);
      if (transactions.length > 0) {
        console.log("First transaction:", transactions[0]);
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Raw response:", responseText);
      throw new Error(
        `Failed to parse AI response as JSON: ${parseError.message}`
      );
    }

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
      console.error("Transactions is not an array:", typeof transactions);
      throw new Error("AI response is not in expected array format");
    }

    if (transactions.length === 0) {
      throw new Error("No transactions found in AI response");
    }

    console.log("Validating and saving transactions...");

    // Validate and save transactions
    const savedTransactions = await Promise.all(
      transactions.map(async (transaction, index) => {
        console.log(`Processing transaction ${index + 1}:`, transaction);

        // Validate required fields
        if (
          !transaction.description ||
          transaction.amount === undefined ||
          !transaction.type
        ) {
          console.warn("Skipping invalid transaction:", transaction);
          return null;
        }

        const savedTransaction = await Transaction.create({
          ...transaction,
          user: userId,
          date: new Date(transaction.date || new Date()),
        });

        console.log("Saved transaction:", savedTransaction);
        return savedTransaction;
      })
    );

    // Filter out null transactions
    const validTransactions = savedTransactions.filter((t) => t !== null);

    if (validTransactions.length === 0) {
      throw new Error("No valid transactions found in the statement");
    }

    console.log(
      `Successfully processed ${validTransactions.length} real transactions`
    );
    return validTransactions;
  } catch (error) {
    console.error("Error processing statement with Gemini:", error);
    console.error("Error stack:", error.stack);
    throw new ApiError(`Failed to process statement: ${error.message}`, 500);
  }
};
