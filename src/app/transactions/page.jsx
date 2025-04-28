import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import TransactionPage from "@/components/Transactions";

const page = () => {
  return <DefaultLayout title={"Transactions"} content={<TransactionPage />} />;
};

export default page;
