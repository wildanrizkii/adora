import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import ReportPage from "@/components/Reports";

const page = () => {
  return <DefaultLayout title={"Reports"} content={<ReportPage />} />;
};

export default page;
