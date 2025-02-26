import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import ManageAccount from "@/components/Admin/Account";

const page = () => {
  return <DefaultLayout title={"Accounts"} content={<ManageAccount />} />;
};

export default page;
