export const AI_CONFIG = {
  processingEndpoint: "/api/statements/process",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedFormats: [".txt", ".csv", ".pdf"],
  processingTimeout: 30000, // 30 seconds
};
