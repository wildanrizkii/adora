"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiLock } from "react-icons/fi";
import ProfileSettings from "@/components/Account/ProfileTab";
import PasswordChangeForm from "@/components/Account/PasswordTab";
import { LuUserRoundPen } from "react-icons/lu";
import { GoShieldLock } from "react-icons/go";
import { BsShop, BsShopWindow } from "react-icons/bs";
import MainStore from "@/components/Store/MainStore";
import BranchStore from "@/components/Store/BranchStore";

const tabs = [
  {
    id: "1",
    label: "Profile",
    icon: <LuUserRoundPen size={22} />,
    content: <ProfileSettings />,
  },
  {
    id: "2",
    label: "Security",
    icon: <GoShieldLock size={22} />,
    content: <PasswordChangeForm />,
  },
  {
    id: "3",
    label: "Store",
    icon: <BsShop size={22} />,
    content: <MainStore />,
  },
  {
    id: "4",
    label: "Branch Store",
    icon: <BsShopWindow size={22} />,
    content: <BranchStore />,
  },
];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6">
        {/* Tabs Header */}
        <div className="relative flex justify-start overflow-x-auto overflow-y-hidden border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 pb-3 px-4 text-sm md:text-lg font-normal text-nowrap transition-all ${
                activeTab === tab.id
                  ? "text-blue-500 hover:text-blue-600 dark:text-blue-400"
                  : "text-black hover:text-blue-500 dark:text-white hover:dark:text-blue-400"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-[2px] left-0 right-0 h-[5px] rounded-full bg-blue-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="mt-6 overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={activeTab === tab.id ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeTab === tab.id ? "block" : "hidden"}
            >
              <div className="min-w-max">{tab.content}</div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  );
};

export default AccountPage;
