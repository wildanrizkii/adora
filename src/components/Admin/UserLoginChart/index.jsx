"use client";

import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import supabase from "@/app/utils/db";
import dayjs from "dayjs";
import "chart.js/auto";

const LoginChart = () => {
  const [loginData, setLoginData] = useState([]);
  const [currentDate, setCurrentDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
        const today = dayjs().format("YYYY-MM-DD");

        const { data, error } = await supabase
          .from("log_activity")
          .select("times")
          // Filter hanya untuk aktivitas login hari ini
          .gte("times", `${today}T00:00:00`)
          .lte("times", `${today}T23:59:59`);

        if (error) throw error;

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
        setCurrentDate(today);
      } catch (error) {
        console.error("❌ Gagal mengambil data login:", error);
      }
    };

    fetchData();

    // Fungsi untuk memeriksa perubahan hari dan mereset data
    const checkDayChange = () => {
      const today = dayjs().format("YYYY-MM-DD");
      if (today !== currentDate) {
        setLoginData([]);
        setCurrentDate(today);
        fetchData(); // Ambil data baru untuk hari ini
      }
    };

    // Jalankan pengecekan setiap menit
    const intervalId = setInterval(checkDayChange, 60000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, [currentDate]);

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

  const chartData = {
    labels: hours,
    datasets: [
      {
        label: `Login Activity (${dayjs(currentDate).format(
          "dddd, DD MMMM YYYY"
        )})`,
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
      legend: {
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
        },
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
      <div className="relative min-h-[380px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LoginChart;
