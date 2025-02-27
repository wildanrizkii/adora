import supabase from "@/app/utils/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const logFailedLogin = async (email) => {
  const getWIBTime = () => {
    return dayjs().tz("Asia/Jakarta").format("DD MMM YYYY HH:mm");
  };

  try {
    const res = await fetch("https://ipinfo.io/json");
    const locationData = await res.json();
    const ipAddress = locationData.ip;
    const location = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
    const userAgent = navigator.userAgent;

    await supabase.from("log_attempt").insert([
      {
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        times: getWIBTime(),
        locations: location,
      },
    ]);
  } catch (error) {
    console.error("❌ Gagal menyimpan log percobaan login:", error);
  }
};

export default logFailedLogin;
