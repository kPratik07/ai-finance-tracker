import React, { useState } from "react";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { validateTransaction } from "../../utils/validation";

export const TransactionEdit = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    date: new Date(transaction.date).toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateTransaction(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-edit-form">
      <div className="form-group">
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className={errors.description ? "error" : ""}
        />
        {errors.description && (
          <span className="error-text">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          step="0.01"
          className={errors.amount ? "error" : ""}
        />
        {errors.amount && <span className="error-text">{errors.amount}</span>}
      </div>

      <div className="form-group">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={errors.category ? "error" : ""}
        >
          <option value="">Select Category</option>
          {formData.type === "income"
            ? TRANSACTION_CATEGORIES.INCOME.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))
            : TRANSACTION_CATEGORIES.EXPENSES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
        </select>
        {errors.category && (
          <span className="error-text">{errors.category}</span>
        )}
      </div>

      <div className="form-group">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? "error" : ""}
        />
        {errors.date && <span className="error-text">{errors.date}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}
    </form>
  );
};
