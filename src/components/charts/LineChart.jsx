import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Filler,
);

const ALL_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const mapDataToMonths = (data = []) => {
  const map = {};
  data.forEach((item) => {
    const monthIndex = parseInt(item.month.split("-")[1], 10) - 1;
    map[monthIndex] = item.total;
  });
  return ALL_MONTHS.map((_, i) => map[i] || 0);
};

export const LineChart = ({ data = [], label = "Users" }) => {
  const normalized = mapDataToMonths(data);

  const chartData = {
    labels: ALL_MONTHS,
    datasets: [
      {
        label,
        data: normalized,
        borderColor: "rgba(79, 70, 229, 1)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(79, 70, 229, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${label}: ${ctx.raw || 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: false },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          callback: (value) =>
            Number.isInteger(value) ? value.toLocaleString() : "",
        },
      },
    },
  };

  return (
    <div style={{ height: "220px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
