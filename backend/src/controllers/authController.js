import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import sendEmail from "../utils/sendEmail.js";
import sendEmailBrevo from "../utils/sendEmailBrevo.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError("User already exists", 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    throw new ApiError("Invalid user data", 400);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    throw new ApiError("Invalid credentials", 401);
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json(user);
  } else {
    throw new ApiError("User not found", 404);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found with this email", 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (1 hour)
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  await user.save();

  // Create reset URL (use frontend URL)
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  // Email HTML template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password for your AI Finance Tracker account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Finance Tracker. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Try Brevo first, then fallback to SMTP
    if (process.env.BREVO_API_KEY) {
      await sendEmailBrevo({
        email: user.email,
        subject: "Password Reset Request - AI Finance Tracker",
        html: emailHtml,
      });
    } else {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request - AI Finance Tracker",
        html: emailHtml,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    // If email fails, clear the reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    console.error("Email send error:", error);
    
    // For development, still return the token if email fails
    if (process.env.NODE_ENV === "development") {
      console.log("Password Reset Token:", resetToken);
      console.log("Reset URL:", resetUrl);
      
      return res.status(200).json({
        success: true,
        message: "Email service unavailable. Reset token logged to console.",
        resetToken, // Only in development
      });
    }

    throw new ApiError("Email could not be sent. Please try again later.", 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Hash the token from URL
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user by token and check if not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Clear reset token fields
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-reset-otp
// @access  Public
export const sendResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found with this email", 404);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before storing
  user.resetPasswordOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Set expire time (10 minutes)
  user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Email HTML template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset OTP</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password for your AI Finance Tracker account.</p>
          <p>Use the following OTP to reset your password:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="warning">
            <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes for security reasons.
          </div>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Finance Tracker. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Try Brevo first, then fallback to SMTP
    if (process.env.BREVO_API_KEY) {
      await sendEmailBrevo({
        email: user.email,
        subject: "Password Reset OTP - AI Finance Tracker",
        html: emailHtml,
      });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP - AI Finance Tracker",
        html: emailHtml,
      });
    } else {
      // No email service configured
      throw new Error("Email service not configured");
    }

    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Email send error:", error);

    // For development, still allow password reset even if email fails
    if (process.env.NODE_ENV === "development") {
      console.log("=".repeat(50));
      console.log("PASSWORD RESET OTP (Development Mode)");
      console.log("Email:", user.email);
      console.log("OTP:", otp);
      console.log("Valid for: 10 minutes");
      console.log("=".repeat(50));

      return res.status(200).json({
        success: true,
        message: "Email service unavailable. Check server console for OTP.",
        otp, // Only in development
      });
    }

    // In production, clear the OTP if email fails
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;
    await user.save();

    throw new ApiError("Email could not be sent. Please try again later.", 500);
  }
});

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError("Please provide email, OTP, and new password", 400);
  }

  // Hash the OTP
  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Find user by email, OTP, and check if not expired
  const user = await User.findOne({
    email,
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear OTP fields
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};
