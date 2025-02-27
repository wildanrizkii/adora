"use client";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import supabase from "@/app/utils/db";
import dayjs from "dayjs";
import "chart.js/auto";

const LoginChart = () => {
  const [loginData, setLoginData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (start, end) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("log_activity")
        .select("times")
        // Filter berdasarkan periode yang dipilih
        .gte("times", `${start}T00:00:00`)
        .lte("times", `${end}T23:59:59`);

      if (error) throw error;

      if (data.length === 0) {
        setLoginData([]);
        setIsLoading(false);
        return;
      }

      const loginCounts = {};
      data.forEach(({ times }) => {
        const hour = dayjs(times).format("H:00");
        loginCounts[hour] = (loginCounts[hour] || 0) + 1;
      });

      const result = Object.keys(loginCounts).map((hour) => ({
        hour,
        count: loginCounts[hour],
      }));

      setLoginData(result);
    } catch (error) {
      console.error("❌ Failed to retrieve login data:", error);
      setError("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Jika tanggal mulai lebih besar dari tanggal akhir, sesuaikan tanggal akhir
    if (dayjs(newStartDate).isAfter(dayjs(endDate))) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Jika tanggal akhir lebih kecil dari tanggal mulai, sesuaikan tanggal mulai
    if (dayjs(newEndDate).isBefore(dayjs(startDate))) {
      setStartDate(newEndDate);
    }
  };

  const handleTodayClick = () => {
    const today = dayjs().format("YYYY-MM-DD");
    setStartDate(today);
    setEndDate(today);
  };

  const handleLastWeekClick = () => {
    const today = dayjs();
    const lastWeek = today.subtract(6, "day");
    setStartDate(lastWeek.format("YYYY-MM-DD"));
    setEndDate(today.format("YYYY-MM-DD"));
  };

  const handleLastMonthClick = () => {
    const today = dayjs();
    const lastMonth = today.subtract(29, "day");
    setStartDate(lastMonth.format("YYYY-MM-DD"));
    setEndDate(today.format("YYYY-MM-DD"));
  };

  // Generate label untuk jam 00:00 - 23:00
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Konversi data ke dalam format grafik
  const dataCounts = hours.map((hour) => {
    const found = loginData.find((item) => item.hour === hour);
    return found ? found.count : 0;
  });

  // Create gradient fill for area chart
  const getGradient = (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) return null;

    const gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );

    gradient.addColorStop(0, "rgba(66, 133, 244, 0)");
    gradient.addColorStop(0.3, "rgba(66, 133, 244, 0.3)");
    gradient.addColorStop(1, "rgba(66, 133, 244, 0.7)");

    return gradient;
  };

  // Membuat label periode tanggal untuk judul chart
  const periodLabel =
    startDate === endDate
      ? `${dayjs(startDate).format("dddd, DD MMMM YYYY")}`
      : `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format(
          "DD MMM YYYY"
        )}`;

  const chartData = {
    labels: hours,
    datasets: [
      {
        label: `Login Activity (${periodLabel})`,
        data: dataCounts,
        fill: true,
        backgroundColor: function (context) {
          return getGradient(context);
        },
        borderColor: "rgba(66, 133, 244, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(66, 133, 244, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgba(66, 133, 244, 1)",
        pointHoverBorderColor: "#fff",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // legend: {
      //   labels: {
      //     font: {
      //       family: "'Poppins', sans-serif",
      //       size: 12,
      //     },
      //   },
      // },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 13,
        },
        bodyFont: {
          family: "'Poppins', sans-serif",
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Jumlah Login: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            family: "'Poppins', sans-serif",
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutQuad",
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-md transition-all">
      <div className="space-y-1">
        <h2 className="text-xl font-medium">User Login Activity</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Period {periodLabel}
        </div>
      </div>
      <div className="mb-4 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3">
          {/* Input tanggal */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium mb-1"
              >
                Dari Tanggal
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                max={dayjs().format("YYYY-MM-DD")}
                className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px] md:min-w-[150px]"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium mb-1"
              >
                Sampai Tanggal
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={handleEndDateChange}
                max={dayjs().format("YYYY-MM-DD")}
                className="px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[120px] md:min-w-[150px]"
              />
            </div>
          </div>

          {/* Tombol filter di ujung kanan */}
          <div className="flex flex-wrap md:flex-nowrap gap-1 md:gap-2 md:self-end">
            <button
              onClick={handleTodayClick}
              className="px-2 py-1 md:px-3 md:py-2 bg-blue-100 text-nowrap text-blue-700 text-sm md:text-sm rounded-md hover:bg-blue-200 transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={handleLastWeekClick}
              className="px-2 py-1 md:px-3 md:py-2 bg-blue-100 text-nowrap text-blue-700 text-sm md:text-sm rounded-md hover:bg-blue-200 transition-colors"
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={handleLastMonthClick}
              className="px-2 py-1 md:px-3 md:py-2 bg-blue-100 text-nowrap text-blue-700 text-sm md:text-sm rounded-md hover:bg-blue-200 transition-colors"
            >
              30 Hari Terakhir
            </button>
          </div>
        </div>
      </div>
      <div className="relative min-h-[380px] p-4 rounded-lg shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-70 z-10">
            <div className="loader w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {!isLoading && !error && loginData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500">
              Tidak ada data login untuk periode yang dipilih
            </div>
          </div>
        )}

        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LoginChart;
