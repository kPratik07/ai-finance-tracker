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
      const month = new Date(t.date).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {});

  const data = {
    labels: Object.keys(monthlyExpenses),
    datasets: [
      {
        label: "Monthly Expenses",
        data: Object.values(monthlyExpenses),
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};
