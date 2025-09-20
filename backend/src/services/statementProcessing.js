import OpenAI from "openai";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/apiError.js";

// Ensure environment variables are loaded
dotenv.config();

// Verify API key is present
if (!process.env.OPENAI_API_KEY) {
  console.warn("OpenAI API key is missing. Please check your .env file.");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const processStatement = async (content, userId) => {
  try {
    // Check if content is valid
    if (!content || content.trim().length < 10) {
      throw new Error("Invalid or empty file content");
    }

    console.log("=== PROCESSING STATEMENT ===");
    console.log("Content length:", content.length);
    console.log("Content preview:", content.substring(0, 500));
    console.log("User ID:", userId);

    // Check if content contains bank statement keywords
    const hasBankKeywords =
      content.toLowerCase().includes("kotak") ||
      content.toLowerCase().includes("bank") ||
      content.toLowerCase().includes("upi") ||
      content.toLowerCase().includes("transaction");

    console.log("Contains bank keywords:", hasBankKeywords);

    if (!hasBankKeywords) {
      throw new Error("Content does not appear to be a bank statement");
    }

    // Improved prompt specifically for Indian bank statements
    const prompt = `Extract ALL transactions from this Indian bank statement. This appears to be a Kotak Mahindra Bank statement.

IMPORTANT RULES:
1. Extract ONLY real transactions from the statement (ignore headers, footers, account details)
2. Look for transaction rows with Date, Narration, Amount, and Balance columns
3. For UPI transactions: extract the merchant name from the narration (e.g., "UPI/LILA PITTURA DECO" -> "LILA PITTURA DECO")
4. For IMPS/NEFT: extract the sender/receiver name
5. Amounts: Use the "Withdrawal(Dr)/Deposit(Cr)" column values
6. Type: "income" for (Cr) credits, "expense" for (Dr) debits
7. Currency: INR (Indian Rupees)
8. Date: Use the exact date from the statement
9. Category: Categorize based on merchant/description:
   - UPI/Gaming apps -> "entertainment"
   - UPI/Food merchants -> "food" 
   - UPI/Transport -> "transport"
   - IMPS/NEFT transfers -> "other"
   - Salary/credits -> "salary"

Statement content:
${content}

Return ONLY a JSON array of transactions in this exact format:
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

    console.log("Calling OpenAI API...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a financial data extraction expert specializing in Indian bank statements. Extract transaction data accurately from Kotak, HDFC, SBI, ICICI and other Indian bank statements. Always return valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    console.log("OpenAI API call successful");

    // Parse GPT response
    let transactions;
    try {
      const responseContent = response.choices[0].message.content;
      console.log("AI Response length:", responseContent.length);
      console.log("AI Response preview:", responseContent.substring(0, 200));

      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        transactions = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying direct parse...");
        transactions = JSON.parse(responseContent);
      }

      console.log("Parsed transactions count:", transactions.length);
      console.log("First transaction:", transactions[0]);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Raw response:", response.choices[0].message.content);
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
    console.error("Error processing statement:", error);
    console.error("Error stack:", error.stack);
    throw new ApiError(`Failed to process statement: ${error.message}`, 500);
  }
};
