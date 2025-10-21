import React, { useEffect, useState } from "react";
import { StatisticsCard } from "../components/dashboard/StatisticsCard";
import { CategoryPieChart } from "../components/dashboard/CategoryPieChart";
import { ExpenseLineChart } from "../components/dashboard/ExpenseLineChart";
import { api } from "../api/api";
import "../styles/dashboard.css";

export const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.transactions.getAll();
      setTransactions(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const stats = calculateStatistics();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of your financial activity
        </p>
      </div>

      <div className="stats-grid">
        <StatisticsCard
          title="Total Income"
          value={stats.totalIncome}
          type="income"
          icon="💰"
        />
        <StatisticsCard
          title="Total Expenses"
          value={stats.totalExpenses}
          type="expense"
          icon="💸"
        />
        <StatisticsCard
          title="Current Balance"
          value={stats.balance}
          type={stats.balance >= 0 ? "income" : "expense"}
          icon={stats.balance >= 0 ? "✅" : "⚠️"}
        />
        <StatisticsCard
          title="Total Transactions"
          value={stats.transactionCount}
          type="neutral"
          icon="📊"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Expense Categories</h2>
            <p className="chart-subtitle">Distribution by category</p>
          </div>
          <div className="chart-content">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h2>Monthly Expenses</h2>
            <p className="chart-subtitle">Spending trends over time</p>
          </div>
          <div className="chart-content">
            <ExpenseLineChart transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};
