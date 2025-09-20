import React, { useState } from "react";
import { TransactionEdit } from "./TransactionEdit";
import { formatCurrency, getCurrencySymbol } from "../../utils/formatters";
import { api } from "../../api/api";
import "../../styles/components.css";

export const TransactionList = ({ transactions = [], onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      setLoading(true);
      await api.transactions.delete(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-list">
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p className="no-data">No transactions found</p>
      ) : (
        <div className="transactions-container">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              {editingId === transaction._id ? (
                <TransactionEdit
                  transaction={transaction}
                  onSave={async (updatedData) => {
                    await api.transactions.update(transaction._id, updatedData);
                    setEditingId(null);
                    onUpdate();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="transaction-header">
                    <span className="date">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                    <span className={`amount ${transaction.type}`}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                  <p className="description">{transaction.description}</p>
                  <div className="transaction-footer">
                    <span className="category">{transaction.category}</span>
                    <div className="actions">
                      <button
                        onClick={() => setEditingId(transaction._id)}
                        className="btn btn-edit"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="btn btn-delete"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
