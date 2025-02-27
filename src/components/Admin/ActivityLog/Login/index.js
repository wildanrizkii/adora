"use client";
import supabase from "@/app/utils/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const logLoginActivity = async ({ idUser, role, action, detail }) => {
  try {
    // 🔹 Ambil Lokasi Pengguna
    const res = await fetch("https://ipinfo.io/json");
    const locationData = await res.json();
    const ip_address = locationData.ip;
    const location = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
    const getWIBTime = () => {
      return dayjs().tz("Asia/Jakarta").format("DD MMM YYYY HH:mm");
    };

    // 🔹 Ambil User Agent
    const userAgent = navigator?.userAgent || "Unknown";

    // 🔹 Simpan Log ke Database
    const { error } = await supabase.from("log_activity").insert([
      {
        id_user: idUser,
        role,
        action,
        detail,
        ip_address,
        location,
        user_agent: userAgent,
        times: getWIBTime(),
      },
    ]);

    if (error) throw error;
    console.log("✅ Log aktivitas berhasil disimpan:", {
      idUser,
      action,
      role,
      detail,
      ip_address,
      location,
    });
  } catch (logError) {
    console.error("❌ Gagal menyimpan log:", logError);
  }
};

export default logLoginActivity;
