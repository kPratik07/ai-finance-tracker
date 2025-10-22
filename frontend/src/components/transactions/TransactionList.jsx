import React, { useState } from "react";
import { TransactionEdit } from "./TransactionEdit";
import { ConfirmModal } from "../common/ConfirmModal";
import { formatCurrency, getCurrencySymbol } from "../../utils/formatters";
import { api } from "../../api/api";
import "../../styles/components.css";

export const TransactionList = ({ transactions = [], onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, transactionId: null });

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, transactionId: id });
  };

  const handleDeleteConfirm = async () => {
    const { transactionId } = deleteModal;
    setDeleteModal({ isOpen: false, transactionId: null });

    try {
      setLoading(true);
      await api.transactions.delete(transactionId);
      onUpdate();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, transactionId: null });
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
                    <div className="transaction-date-type">
                      <span className="date">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type === 'income' ? '↓ Income' : '↑ Expense'}
                      </span>
                    </div>
                    <span className={`amount ${transaction.type}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                  
                  <div className="transaction-body">
                    <div className="transaction-details">
                      <p className="description">{transaction.description}</p>
                      {transaction.merchant && transaction.merchant !== 'unknown' && (
                        <p className="merchant">
                          <span className="merchant-icon">🏪</span>
                          {transaction.merchant}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="transaction-footer">
                    <div className="transaction-meta">
                      <span className={`category-badge ${transaction.category}`}>
                        {transaction.category}
                      </span>
                      {transaction.currency && transaction.currency !== 'INR' && (
                        <span className="currency-badge">{transaction.currency}</span>
                      )}
                    </div>
                    <div className="actions">
                      <button
                        onClick={() => setEditingId(transaction._id)}
                        className="btn btn-edit"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(transaction._id)}
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
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="AI Finance Tracker"
        message="Are you sure you want to delete this transaction?"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};
