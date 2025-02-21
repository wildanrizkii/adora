import Cashier from "@/components/Cashier";
import DefaultLayout from "@/components/DefaultLayout";

export default function Home() {
  return <DefaultLayout title={"Cashier"} content={<Cashier />} />;
}
