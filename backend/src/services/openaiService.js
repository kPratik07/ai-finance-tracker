import openai from "../config/openai.js";
import ApiError from "../utils/apiError.js";
import { initGPT4All, generateResponse } from "../config/gpt4all.js";

let gptModel = null;

const ensureModelInitialized = async () => {
  if (!gptModel) {
    gptModel = await initGPT4All();
  }
  return gptModel;
};

export const analyzeStatement = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Extract transaction data from bank statements. Return JSON format.",
        },
        {
          role: "user",
          content: `Extract transactions from: ${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new ApiError(500, "Failed to analyze statement with AI");
  }
};

export const analyzeTransaction = async (text) => {
  try {
    await ensureModelInitialized();

    const prompt = `
            Analyze this bank transaction and format as JSON:
            Transaction: ${text}
            Required format:
            {
                "description": "original text",
                "amount": numeric value,
                "type": "expense/income/transfer",
                "category": "food/utilities/entertainment/income/transfer/other",
                "merchant": "extracted merchant name"
            }
        `;

    const response = await generateResponse(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        description: text,
        amount: 0,
        type: "expense",
        category: "other",
        merchant: "unknown",
      };
    }
  } catch (error) {
    console.error("Error analyzing transaction:", error);
    throw error;
  }
};
