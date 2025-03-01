import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import ManageAccount from "@/components/Admin/Account";

const page = () => {
  return <DefaultLayout title={"Account"} content={<ManageAccount />} />;
};

export default page;
