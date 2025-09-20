export const formatCurrency = (amount, currency = "INR") => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export const getCurrencySymbol = (currency) => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  return symbols[currency] || currency;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};
