import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api.js";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.transactions.getAll();
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      // Don't set error for token expiry (handled by API)
      if (!err.message.includes("Session expired")) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = async (transaction) => {
    try {
      setLoading(true);
      const response = await api.transactions.create(transaction);
      setTransactions((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      // Don't set error for token expiry (handled by API)
      if (!err.message.includes("Session expired")) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      setLoading(true);
      const response = await api.transactions.update(id, updates);
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      );
      return response.data;
    } catch (err) {
      // Don't set error for token expiry (handled by API)
      if (!err.message.includes("Session expired")) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      await api.transactions.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      // Don't set error for token expiry (handled by API)
      if (!err.message.includes("Session expired")) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
