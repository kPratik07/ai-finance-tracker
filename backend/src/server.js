import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import statementRoutes from "./routes/statements.js";
import { errorHandler } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// ES Module dirname setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.CORS_ORIGIN]
        : ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Static files setup
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "AI Finance Tracker API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/statements", statementRoutes);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
