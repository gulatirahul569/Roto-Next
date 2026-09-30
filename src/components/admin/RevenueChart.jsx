"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

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

export default function RevenueChart({ revenueChart = [] }) {
  const chartData = {
    labels: revenueChart.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: revenueChart.map((item) => item.revenue),
        borderColor: "#18181b",
        backgroundColor: "rgba(24, 24, 27, 0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#18181b",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#18181b",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label(context) {
            return `Revenue: ₹${Number(
              context.parsed.y || 0
            ).toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#71717a",
          font: {
            size: 11,
            weight: "600",
          },
        },
      },
      y: {
        grid: {
          color: "#f4f4f5",
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#71717a",
          font: {
            size: 11,
            weight: "600",
          },
          callback(value) {
            return `₹${Number(value).toLocaleString("en-IN")}`;
          },
        },
      },
    },
  };

  if (!revenueChart.length) {
    return (
      <div className="grid h-full min-h-64 place-items-center rounded-2xl bg-zinc-50 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-500">
          No revenue data is available yet.
        </p>
      </div>
    );
  }

  return <Line data={chartData} options={chartOptions} />;
}