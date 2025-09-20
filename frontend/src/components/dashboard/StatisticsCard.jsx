import React from "react";
import { formatCurrency } from "../../utils/formatters";

export const StatisticsCard = ({ title, value, type }) => {
  const getIcon = () => {
    switch (type) {
      case "income":
        return "↑";
      case "expense":
        return "↓";
      default:
        return "•";
    }
  };

  return (
    <div className={`statistics-card ${type}`}>
      <div className="card-icon">{getIcon()}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="value">
          {typeof value === "number" ? formatCurrency(value) : value}
        </p>
      </div>
    </div>
  );
};
