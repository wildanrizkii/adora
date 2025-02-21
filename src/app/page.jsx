import Dashboard from "@/components/Dashboard";
import DefaultLayout from "@/components/DefaultLayout";

export default function Home() {
  return <DefaultLayout title={"Dashboard"} content={<Dashboard />} />;
}
