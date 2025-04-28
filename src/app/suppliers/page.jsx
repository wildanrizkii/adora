import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import SupplierPage from "@/components/Suppliers";

const page = () => {
  return <DefaultLayout title={"Suppliers"} content={<SupplierPage />} />;
};

export default page;
