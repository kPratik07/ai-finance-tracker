import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ExpenseLineChart = ({ transactions }) => {
  // Process monthly data
  const monthlyData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          total: 0,
          count: 0,
          date: date,
        };
      }
      
      acc[monthYear].total += Number(t.amount);
      acc[monthYear].count += 1;
      return acc;
    }, {});

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    return monthlyData[a].date - monthlyData[b].date;
  });

  // Calculate statistics
  const expenses = sortedMonths.map((month) => monthlyData[month].total);
  const totalExpense = expenses.reduce((sum, val) => sum + val, 0);
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
  const maxExpense = Math.max(...expenses, 0);
  const minExpense = expenses.length > 0 ? Math.min(...expenses) : 0;

  // Calculate trend
  const trend = expenses.length >= 2 
    ? ((expenses[expenses.length - 1] - expenses[0]) / expenses[0] * 100).toFixed(1)
    : 0;

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Monthly Expenses",
        data: expenses,
        borderColor: "#dc3545",
        backgroundColor: "rgba(220, 53, 69, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#dc3545",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#dc3545",
        pointHoverBorderWidth: 3,
      },
      {
        label: "Average",
        data: new Array(sortedMonths.length).fill(avgExpense),
        borderColor: "#ffc107",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (context) => {
            const month = context[0].label;
            return `${month}`;
          },
          label: (context) => {
            const value = context.raw;
            const month = context.label;
            const count = monthlyData[month]?.count || 0;
            
            if (context.datasetIndex === 0) {
              return [
                `Total: ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
                `Transactions: ${count}`,
                `Avg per transaction: ₹${(value / count).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
              ];
            } else {
              return `Average: ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
            }
          },
          footer: (context) => {
            if (context[0].datasetIndex === 0) {
              const value = context[0].raw;
              const diff = value - avgExpense;
              const percentage = ((diff / avgExpense) * 100).toFixed(1);
              
              if (diff > 0) {
                return `↑ ${percentage}% above average`;
              } else if (diff < 0) {
                return `↓ ${Math.abs(percentage)}% below average`;
              } else {
                return '= At average';
              }
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => `₹${value.toLocaleString('en-IN')}`,
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="expense-chart-container">
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
      
      <div className="chart-insights">
        <div className="insight-card">
          <span className="insight-label">Total Spent</span>
          <span className="insight-value expense">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="insight-card">
          <span className="insight-label">Monthly Average</span>
          <span className="insight-value">₹{avgExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="insight-card">
          <span className="insight-label">Highest Month</span>
          <span className="insight-value warning">₹{maxExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="insight-card">
          <span className="insight-label">Trend</span>
          <span className={`insight-value ${trend > 0 ? 'expense' : 'income'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        </div>
      </div>
    </div>
  );
};
