import multer from "multer";
import ApiError from "../utils/apiError.js";
import { validateFile } from "../utils/formatValidation.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const validation = validateFile(file);
  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new ApiError(validation.errors.join(", "), 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
