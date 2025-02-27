import supabase from "@/app/utils/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const getBrowserName = (userAgent) => {
  if (
    userAgent.includes("Chrome") &&
    !userAgent.includes("Edg") &&
    !userAgent.includes("OPR")
  ) {
    return "Google Chrome";
  } else if (userAgent.includes("Firefox")) {
    return "Mozilla Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "Apple Safari";
  } else if (userAgent.includes("Edg")) {
    return "Microsoft Edge";
  } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
    return "Opera";
  } else {
    return "Unrecognized Browser";
  }
};

const logFailedLogin = async (email, userAgent) => {
  const getWIBTime = () => {
    return dayjs().tz("Asia/Jakarta").format("DD MMM YYYY HH:mm");
  };

  try {
    const res = await fetch("https://ipinfo.io/json");
    const locationData = await res.json();
    const ipAddress = locationData.ip;
    const location = `${locationData.city}, ${locationData.region}, ${locationData.country}`;

    await supabase.from("log_attempt").insert([
      {
        email,
        ip_address: ipAddress,
        user_agent: getBrowserName(userAgent),
        times: getWIBTime(),
        locations: location,
      },
    ]);
  } catch (error) {
    console.error("❌ Failed to save log:", error);
  }
};

export default logFailedLogin;
