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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const ExpenseLineChart = ({ transactions }) => {
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      // Use full date to properly sort and group transactions
      const date = new Date(t.date);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[monthYear] = (acc[monthYear] || 0) + Number(t.amount);
      return acc;
    }, {});

  // Ensure we have all months represented with zero if no expenses
  const sortedMonths = Object.keys(monthlyExpenses).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Monthly Expenses",
        data: sortedMonths.map((month) => monthlyExpenses[month]),
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};
