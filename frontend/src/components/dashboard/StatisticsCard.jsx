import React from "react";
import { formatCurrency } from "../../utils/formatters";

export const StatisticsCard = ({ title, value, type, icon }) => {
  const getDefaultIcon = () => {
    switch (type) {
      case "income":
        return "↑";
      case "expense":
        return "↓";
      default:
        return "•";
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={`statistics-card ${type}`}>
      <div className="card-header">
        <div className="card-icon">{displayIcon}</div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body">
        <p className="card-value">
          {typeof value === "number" ? formatCurrency(value) : value}
        </p>
      </div>
    </div>
  );
};
