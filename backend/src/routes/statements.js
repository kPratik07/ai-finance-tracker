import express from "express";
import multer from "multer";
import { uploadStatement } from "../controllers/statementController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Apply authentication middleware to all statement routes
router.use(protect);

router.post("/upload", upload.single("statement"), uploadStatement);

export default router;
