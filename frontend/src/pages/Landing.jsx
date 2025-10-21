import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="landing-content">
          <h1 className="landing-title">
            Welcome to <span className="brand-highlight">AI Finance Tracker</span>
          </h1>
          <p className="landing-subtitle">
            Smart financial management powered by AI. Track expenses, analyze spending patterns, 
            and take control of your finances with intelligent insights.
          </p>
          
          <div className="landing-features">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>AI-powered insights into your spending habits</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Statement Upload</h3>
              <p>Automatically extract transactions from bank statements</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Expense Tracking</h3>
              <p>Categorize and monitor all your transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
