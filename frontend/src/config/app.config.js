const isDevelopment = import.meta.env.MODE === "development";

export const APP_CONFIG = {
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FORMATS: [".pdf", ".csv", ".txt"],
    MIME_TYPES: ["application/pdf", "text/csv", "text/plain"],
  },
  CHART_COLORS: {
    primary: "#3498db",
    success: "#2ecc71",
    warning: "#f1c40f",
    danger: "#e74c3c",
    neutral: "#95a5a6",
  },
  DATE_FORMAT: {
    display: "MMM DD, YYYY",
    api: "YYYY-MM-DD",
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
};

export const ENVIRONMENT = {
  IS_DEVELOPMENT: import.meta.env.MODE === "development",
  IS_PRODUCTION: import.meta.env.MODE === "production",
  API_URL: import.meta.env.VITE_API_URL,
  DEBUG: import.meta.env.VITE_DEBUG === "true",
};
