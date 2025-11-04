import Groq from "groq-sdk";
import dotenv from "dotenv";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/apiError.js";

dotenv.config();

// Lazy initialization - only create client when needed
let groq = null;

const getGroqClient = () => {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

// Helper function to estimate tokens (rough approximation: 1 token ≈ 4 characters)
const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

// Helper function to split content into chunks based on token limit
const chunkContent = (content, maxTokensPerChunk = 6000) => {
  const chunks = [];
  
  // Reserve tokens for prompt and response (system message + instructions)
  const reservedTokens = 2000;
  const effectiveMaxTokens = maxTokensPerChunk - reservedTokens;
  const maxCharsPerChunk = effectiveMaxTokens * 4; // 1 token ≈ 4 characters
  
  // Split by lines first
  const lines = content.split('\n');
  let currentChunk = [];
  let currentLength = 0;
  
  for (const line of lines) {
    const lineLength = line.length;
    
    // If adding this line would exceed the limit, save current chunk
    if (currentLength + lineLength > maxCharsPerChunk && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      currentLength = 0;
    }
    
    // If a single line is too long, split it by character count
    if (lineLength > maxCharsPerChunk) {
      // Save current chunk if it has content
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentLength = 0;
      }
      
      // Split the long line into smaller pieces
      for (let i = 0; i < lineLength; i += maxCharsPerChunk) {
        chunks.push(line.substring(i, i + maxCharsPerChunk));
      }
    } else {
      currentChunk.push(line);
      currentLength += lineLength;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }
  
  console.log(`Created ${chunks.length} chunks with sizes:`, chunks.map(c => `${c.length} chars (~${estimateTokens(c)} tokens)`));
  
  return chunks;
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processStatementWithGroq = async (content, userId) => {
  try {
    // Validate content
    if (!content || content.trim().length < 10) {
      throw new Error("Invalid or empty file content");
    }

    console.log("=== PROCESSING STATEMENT WITH GROQ ===");
    console.log("Content length:", content.length);
    console.log("Estimated tokens:", estimateTokens(content));
    console.log("User ID:", userId);

    // Clear all existing transactions for this user before processing new statement
    const deletedCount = await Transaction.deleteMany({ user: userId });
    console.log(`Cleared ${deletedCount.deletedCount} existing transactions for user`);

    // Enhanced validation: Check if content contains bank statement keywords
    const contentLower = content.toLowerCase();
    const hasBankKeywords =
      contentLower.includes("kotak") ||
      contentLower.includes("hdfc") ||
      contentLower.includes("icici") ||
      contentLower.includes("sbi") ||
      contentLower.includes("axis") ||
      contentLower.includes("bank") ||
      contentLower.includes("upi") ||
      contentLower.includes("transaction") ||
      contentLower.includes("statement") ||
      contentLower.includes("account") ||
      contentLower.includes("balance") ||
      contentLower.includes("credit") ||
      contentLower.includes("debit");

    if (!hasBankKeywords) {
      throw new Error("⚠️ Invalid File: This does not appear to be a bank statement. Please upload a valid bank statement (PDF, CSV, or TXT) containing transaction details.");
    }

    // Check if content needs to be chunked
    const estimatedTokens = estimateTokens(content);
    const MAX_TOKENS_PER_REQUEST = 8000; // Optimized limit for better performance
    
    if (estimatedTokens > MAX_TOKENS_PER_REQUEST) {
      console.log(`Content is large (${estimatedTokens} tokens), splitting into chunks...`);
      return await processLargeStatementInChunks(content, userId);
    }

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

Return ONLY a valid JSON array. Keep descriptions SHORT (max 50 chars). Format:
[{"description":"UPI/MERCHANT","amount":300,"type":"expense","category":"food","date":"2023-09-06","merchant":"MERCHANT","currency":"INR"}]

CRITICAL: Ensure valid JSON - no line breaks in strings, proper escaping, complete array.`;

    console.log("Calling Groq API...");

    const groqClient = getGroqClient();
    if (!groqClient) {
      throw new Error("Groq API key not configured");
    }

    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Latest supported model
      messages: [
        {
          role: "system",
          content:
            "You are a financial data extraction expert specializing in Indian bank statements. Extract transaction data accurately from Kotak, HDFC, SBI, ICICI and other Indian bank statements. Always return valid JSON format without markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 8000, // Increased to handle large statements
    });

    console.log("Groq API call successful");

    // Parse response
    let transactions;
    try {
      const responseContent = response.choices[0].message.content;
      console.log("AI Response length:", responseContent.length);
      console.log("AI Response preview:", responseContent.substring(0, 200));

      // Remove markdown code blocks if present
      let cleanedContent = responseContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/```\n?/g, "");
      }

      // Try to extract JSON array from the response
      let jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      
      // If no match, try to find the last complete array
      if (!jsonMatch) {
        const lastBracket = cleanedContent.lastIndexOf(']');
        const firstBracket = cleanedContent.indexOf('[');
        if (firstBracket !== -1 && lastBracket !== -1) {
          cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1);
          jsonMatch = [cleanedContent];
        }
      }

      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        let jsonString = jsonMatch[0];
        
        try {
          transactions = JSON.parse(jsonString);
        } catch (e) {
          // If parsing fails, try to fix truncated JSON
          console.log("First parse failed, attempting to fix truncated JSON...");
          console.log("Error:", e.message);
          
          // Find the last complete transaction object
          let fixedJson = jsonString;
          
          // Find all complete transaction objects
          const objectPattern = /\{[^{}]*"description"[^{}]*"amount"[^{}]*"type"[^{}]*\}/g;
          const completeObjects = jsonString.match(objectPattern) || [];
          
          if (completeObjects.length > 0) {
            console.log(`Found ${completeObjects.length} complete transaction objects`);
            // Reconstruct array with only complete objects
            fixedJson = '[' + completeObjects.join(',') + ']';
            transactions = JSON.parse(fixedJson);
          } else {
            // Fallback: try to find last complete closing brace
            const lastCompleteBrace = jsonString.lastIndexOf('}');
            if (lastCompleteBrace !== -1) {
              fixedJson = jsonString.substring(0, lastCompleteBrace + 1) + ']';
              transactions = JSON.parse(fixedJson);
            } else {
              throw e; // Re-throw if we can't fix it
            }
          }
        }
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
      console.log("Raw response (first 500 chars):", response.choices[0].message.content.substring(0, 500));
      console.log("Raw response (last 500 chars):", response.choices[0].message.content.substring(response.choices[0].message.content.length - 500));
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
    console.error("Error processing statement with Groq:", error);
    console.error("Error stack:", error.stack);
    throw new ApiError(`Failed to process statement: ${error.message}`, 500);
  }
};

// Process large statements by splitting into chunks
const processLargeStatementInChunks = async (content, userId) => {
  try {
    const chunks = chunkContent(content, 8000);
    console.log(`Split content into ${chunks.length} chunks`);
    
    const allTransactions = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`\nProcessing chunk ${i + 1}/${chunks.length}...`);
      console.log(`Chunk ${i + 1} length:`, chunks[i].length);
      console.log(`Chunk ${i + 1} estimated tokens:`, estimateTokens(chunks[i]));
      
      try {
        const chunkTransactions = await processChunk(chunks[i], i + 1, chunks.length);
        console.log(`Chunk ${i + 1} extracted ${chunkTransactions.length} transactions`);
        allTransactions.push(...chunkTransactions);
        
        // Add minimal delay between chunks to respect rate limits
        // Wait 1 second between chunks for better UX
        if (i < chunks.length - 1) {
          console.log('Waiting 1 second before next chunk...');
          await delay(1000);
        }
      } catch (chunkError) {
        console.error(`Error processing chunk ${i + 1}:`, chunkError.message);
        // Continue with other chunks even if one fails
        if (chunkError.message.includes('rate_limit')) {
          console.log('Rate limit hit, waiting 10 seconds before retry...');
          await delay(10000);
          // Retry this chunk
          try {
            const chunkTransactions = await processChunk(chunks[i], i + 1, chunks.length);
            console.log(`Chunk ${i + 1} extracted ${chunkTransactions.length} transactions (retry successful)`);
            allTransactions.push(...chunkTransactions);
          } catch (retryError) {
            console.error(`Retry failed for chunk ${i + 1}:`, retryError.message);
            // Continue to next chunk
          }
        }
      }
    }
    
    if (allTransactions.length === 0) {
      throw new Error('No transactions found in any chunk');
    }
    
    console.log(`\nTotal transactions extracted from all chunks: ${allTransactions.length}`);
    
    // Remove duplicates based on date, description, and amount
    const uniqueTransactions = removeDuplicateTransactions(allTransactions);
    console.log(`Unique transactions after deduplication: ${uniqueTransactions.length}`);
    
    // Save all transactions to database
    const savedTransactions = await Promise.all(
      uniqueTransactions.map(async (transaction) => {
        // Validate required fields
        if (
          !transaction.description ||
          transaction.amount === undefined ||
          !transaction.type
        ) {
          console.warn('Skipping invalid transaction:', transaction);
          return null;
        }

        const savedTransaction = await Transaction.create({
          ...transaction,
          user: userId,
          date: new Date(transaction.date || new Date()),
        });

        return savedTransaction;
      })
    );
    
    const validTransactions = savedTransactions.filter((t) => t !== null);
    
    if (validTransactions.length === 0) {
      throw new Error('No valid transactions found in the statement');
    }
    
    console.log(`Successfully saved ${validTransactions.length} transactions`);
    return validTransactions;
  } catch (error) {
    console.error('Error processing large statement:', error);
    throw error;
  }
};

// Process a single chunk
const processChunk = async (chunkContent, chunkNumber, totalChunks) => {
  const prompt = `Extract ALL transactions from this Indian bank statement chunk (Part ${chunkNumber}/${totalChunks}).

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

Statement chunk:
${chunkContent}

Return ONLY a valid JSON array. Keep descriptions SHORT (max 50 chars). Format:
[{"description":"UPI/MERCHANT","amount":300,"type":"expense","category":"food","date":"2023-09-06","merchant":"MERCHANT","currency":"INR"}]

CRITICAL: Ensure valid JSON - no line breaks in strings, proper escaping, complete array.`;

  const groqClient = getGroqClient();
  if (!groqClient) {
    throw new Error('Groq API key not configured');
  }

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a financial data extraction expert specializing in Indian bank statements. Extract transaction data accurately from Kotak, HDFC, SBI, ICICI and other Indian bank statements. Always return valid JSON format without markdown formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 8000,
  });

  const responseContent = response.choices[0].message.content;
  
  // Parse response
  let cleanedContent = responseContent.trim();
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.replace(/```\n?/g, '');
  }

  let jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    const lastBracket = cleanedContent.lastIndexOf(']');
    const firstBracket = cleanedContent.indexOf('[');
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1);
      jsonMatch = [cleanedContent];
    }
  }

  let transactions = [];
  if (jsonMatch) {
    let jsonString = jsonMatch[0];
    
    try {
      transactions = JSON.parse(jsonString);
    } catch (e) {
      // Try to fix truncated JSON
      const objectPattern = /\{[^{}]*"description"[^{}]*"amount"[^{}]*"type"[^{}]*\}/g;
      const completeObjects = jsonString.match(objectPattern) || [];
      
      if (completeObjects.length > 0) {
        const fixedJson = '[' + completeObjects.join(',') + ']';
        transactions = JSON.parse(fixedJson);
      } else {
        console.warn(`Could not parse chunk ${chunkNumber}, skipping`);
        return [];
      }
    }
  }

  return Array.isArray(transactions) ? transactions : [];
};

// Remove duplicate transactions
const removeDuplicateTransactions = (transactions) => {
  const seen = new Set();
  return transactions.filter((transaction) => {
    const key = `${transaction.date}-${transaction.description}-${transaction.amount}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
