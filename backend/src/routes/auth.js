import express from "express";
import { 
  register, 
  login, 
  getProfile,
  forgotPassword,
  resetPassword,
  sendResetOTP,
  verifyResetOTP
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// OTP-based password reset routes
router.post("/send-reset-otp", sendResetOTP);
router.post("/verify-reset-otp", verifyResetOTP);

// Protected routes
router.get("/profile", protect, getProfile);

export default router;
