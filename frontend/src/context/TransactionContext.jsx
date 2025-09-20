// filepath: c:\Users\kprat\Desktop\ai-finance-tracker\ai-finance-tracker\frontend\src\context\TransactionContext.js
import React, { createContext, useContext } from "react";
import { useTransactions } from "../hooks/useTransactions";

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const calculateTotals = () => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        acc.balance = acc.income - acc.expenses;
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  };

  const getCategoryTotals = () => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  };

  const getMonthlyTotals = () => {
    return transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === "income") {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {});
  };

  const value = {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    calculateTotals,
    getCategoryTotals,
    getMonthlyTotals,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
}
