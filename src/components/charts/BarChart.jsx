import { useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
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

const mapDataToMonths = (months, data = []) => {
  const map = {};
  data.forEach((item) => {
    const monthIndex = parseInt(item.month.split("-")[1], 10) - 1;
    map[monthIndex] = item.total;
  });
  return months.map((_, i) => map[i] || 0);
};

export const BarChart = ({ websitesData = [] }) => {
  const labels = ALL_MONTHS;
  const chartRef = useRef(null);

  const normalizedWebsites = mapDataToMonths(labels, websitesData);

  const data = {
    labels,
    datasets: [
      {
        label: "Websites",
        backgroundColor: "rgba(79, 70, 229, 0.75)",
        borderSkipped: false,
        borderRadius: {
          topLeft: 6,
          topRight: 6,
          bottomLeft: 0,
          bottomRight: 0,
        },
        data: normalizedWebsites,
        barPercentage: 0.4,
        categoryPercentage: 0.9,
      },
    ],
  };

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 280);
      gradient.addColorStop(0, "rgba(139, 92, 246, 1)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 1)");
      chartRef.current.data.datasets[0].backgroundColor = gradient;
      chartRef.current.update();
    }
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw || 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 },
          maxRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          stepSize: 100,
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <div
          style={{
            height: "280px",
            minWidth: "600px",
          }}
        >
          <Bar data={data} options={options} ref={chartRef} />
        </div>
      </div>
    </div>
  );
};
