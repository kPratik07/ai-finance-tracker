const SUPPORTED_FORMATS = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push("No file uploaded");
    return { isValid: false, errors };
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push("File size exceeds 5MB limit");
  }

  const fileType = file.mimetype;
  const fileExtension = "." + file.originalname.split(".").pop().toLowerCase();

  if (
    !SUPPORTED_FORMATS[fileType] ||
    !SUPPORTED_FORMATS[fileType].includes(fileExtension)
  ) {
    errors.push("Invalid file format. Supported formats: PDF, CSV, TXT");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidFileContent = (content) => {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: "File is empty",
    };
  }

  if (content.length < 10) {
    return {
      isValid: false,
      error: "File content too short to be a valid statement",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
