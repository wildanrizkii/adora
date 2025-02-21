"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ItemList from "@/components/Products/Contents/ItemList";

const tabs = [
  { id: "1", label: "Item List", content: <ItemList /> },
  { id: "2", label: "Item Type", content: "This is the content of Item Type" },
  { id: "3", label: "Item Unit", content: "This is the content of Item Unit" },
  { id: "4", label: "Rack", content: "This is the content of Rack" },
];

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <div className="w-full  mx-auto">
        {/* Tabs Header */}
        <div className="relative flex justify-center space-x-4 border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 px-6 text-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  : "text-black hover:text-blue-500 dark:text-white hover:dark:text-blue-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-[2px] left-0 right-0 h-[3px] rounded-full bg-blue-400"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="mt-6 p-4 rounded-lg border border-gray-200 shadow-sm">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={activeTab === tab.id ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeTab === tab.id ? "block" : "hidden"}
            >
              {/* <h3 className="text-xl font-semibold mb-2 text-blue-600">
                {tab.label}
              </h3> */}
              <div className="text-gray-700">{tab.content}</div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  );
};

export default ProductPage;
