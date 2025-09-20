export const TRANSACTION_CATEGORIES = {
  INCOME: [
    { id: "salary", label: "Salary", icon: "💰" },
    { id: "freelance", label: "Freelance", icon: "💻" },
    { id: "investments", label: "Investments", icon: "📈" },
    { id: "other_income", label: "Other Income", icon: "💵" },
  ],
  EXPENSES: [
    { id: "food", label: "Food & Dining", icon: "🍽️" },
    { id: "transport", label: "Transportation", icon: "🚗" },
    { id: "utilities", label: "Utilities", icon: "💡" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "other", label: "Other", icon: "📌" },
  ],
};

export const getCategoryIcon = (categoryId) => {
  const allCategories = [
    ...TRANSACTION_CATEGORIES.INCOME,
    ...TRANSACTION_CATEGORIES.EXPENSES,
  ];
  return allCategories.find((cat) => cat.id === categoryId)?.icon || "📌";
};

export const getCategoryLabel = (categoryId) => {
  const allCategories = [
    ...TRANSACTION_CATEGORIES.INCOME,
    ...TRANSACTION_CATEGORIES.EXPENSES,
  ];
  return allCategories.find((cat) => cat.id === categoryId)?.label || "Other";
};
