import React from "react";
import DefaultLayout from "@/components/DefaultLayout";
import ProductPage from "@/components/Products";

const page = () => {
  return <DefaultLayout title={"Products"} content={<ProductPage />} />;
};

export default page;
