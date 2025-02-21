"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Info,
  Briefcase,
  Phone,
  ArrowRightFromLine,
} from "lucide-react";
import { DefaultLayout } from "../DefaultLayout";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const { forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const disabled = !!forcedTheme;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <div>Dashboard</div>
    </div>
  );
};

export default Dashboard;
