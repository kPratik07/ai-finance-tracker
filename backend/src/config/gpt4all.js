import { GPT4All } from "gpt4all";

const gpt = new GPT4All("gpt4all-lora-quantized");

export const initGPT4All = async () => {
  try {
    await gpt.init();
    console.log("GPT4All model initialized successfully");
    return gpt;
  } catch (error) {
    console.error("Error initializing GPT4All:", error);
    throw error;
  }
};

export const generateResponse = async (prompt, options = {}) => {
  const defaultOptions = {
    maxTokens: 200,
    temperature: 0.7,
  };
  return await gpt.generate(prompt, { ...defaultOptions, ...options });
};
