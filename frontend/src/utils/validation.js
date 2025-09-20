export const validateTransaction = (transaction) => {
  const errors = {};

  if (!transaction.description?.trim()) {
    errors.description = "Description is required";
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  if (!transaction.category) {
    errors.category = "Category is required";
  }

  if (!transaction.type || !["income", "expense"].includes(transaction.type)) {
    errors.type = "Invalid transaction type";
  }

  if (!transaction.date) {
    errors.date = "Date is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFileUpload = (file) => {
  const errors = {};
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["application/pdf", "text/csv", "text/plain"];

  if (!file) {
    errors.file = "Please select a file";
  } else {
    if (file.size > maxSize) {
      errors.size = "File size must be less than 5MB";
    }

    if (!allowedTypes.includes(file.type)) {
      errors.type = "File type not supported. Use PDF, CSV, or TXT";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
