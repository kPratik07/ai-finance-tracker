import { processStatementWithGroq } from "./groqService.js";
import { processStatementWithGemini } from "./geminiService.js";
import { processStatement as processStatementWithOpenAI } from "./statementProcessing.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Unified AI Statement Processor
 * Automatically selects the best available AI provider based on configuration
 * Priority: Groq > Gemini > OpenAI
 */
export const processStatementWithAI = async (content, userId) => {
  const provider = process.env.AI_PROVIDER || "auto";

  console.log(`=== AI PROVIDER: ${provider} ===`);

  try {
    // Manual provider selection
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      console.log("Using Groq API");
      return await processStatementWithGroq(content, userId);
    }

    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      console.log("Using Gemini API");
      return await processStatementWithGemini(content, userId);
    }

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      console.log("Using OpenAI API");
      return await processStatementWithOpenAI(content, userId);
    }

    // Auto-selection based on available API keys
    if (provider === "auto") {
      // Try Groq first (fastest and most generous free tier)
      if (process.env.GROQ_API_KEY) {
        console.log("Auto-selected: Groq API");
        return await processStatementWithGroq(content, userId);
      }

      // Try Gemini second (good free tier)
      if (process.env.GEMINI_API_KEY) {
        console.log("Auto-selected: Gemini API");
        return await processStatementWithGemini(content, userId);
      }

      // Fall back to OpenAI
      if (process.env.OPENAI_API_KEY) {
        console.log("Auto-selected: OpenAI API");
        return await processStatementWithOpenAI(content, userId);
      }
    }

    throw new Error(
      "No AI provider configured. Please set up GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in your .env file"
    );
  } catch (error) {
    console.error(`Error with ${provider} provider:`, error.message);

    // Check if it's a rate limit error
    const isRateLimitError = error.message && (
      error.message.includes("rate_limit_exceeded") || 
      error.message.includes("429") ||
      error.message.includes("Rate limit")
    );

    // Fallback mechanism - try other providers if the selected one fails
    console.log("Attempting fallback to other providers...");

    try {
      // Try Gemini if Groq failed
      if (process.env.GEMINI_API_KEY && provider !== "gemini") {
        console.log("Fallback: Trying Gemini API");
        return await processStatementWithGemini(content, userId);
      }

      // Try OpenAI if others failed
      if (process.env.OPENAI_API_KEY && provider !== "openai") {
        console.log("Fallback: Trying OpenAI API");
        return await processStatementWithOpenAI(content, userId);
      }

      // Try Groq as last resort if it wasn't the original provider
      if (process.env.GROQ_API_KEY && provider !== "groq" && !isRateLimitError) {
        console.log("Fallback: Trying Groq API");
        return await processStatementWithGroq(content, userId);
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);
    }

    throw error;
  }
};

/**
 * Get information about available AI providers
 */
export const getAvailableProviders = () => {
  const providers = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: "groq",
      model: "llama-3.1-70b-versatile",
      status: "available",
      freeLimit: "14,400 requests/day",
    });
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "gemini",
      model: "gemini-1.5-flash",
      status: "available",
      freeLimit: "15 requests/min, 1M tokens/day",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: "openai",
      model: "gpt-3.5-turbo",
      status: "available",
      freeLimit: "Pay-per-use",
    });
  }

  return providers;
};
