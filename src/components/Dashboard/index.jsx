"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiMail, FiMapPin } from "react-icons/fi";
import { SiGithub, SiTiktok, SiYoutube } from "react-icons/si";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  let { data: session } = useSession();

  console.log(session);
  return (
    <div className="h-screen rounded-md bg-zinc-100 dark:bg-zinc-600">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        className="mx-auto grid grid-flow-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {/* Item 1 */}
        <motion.div
          className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-md"
          variants={itemVariants}
        >
          Konten 1
        </motion.div>

        {/* Item 2 */}
        <motion.div
          className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-md"
          variants={itemVariants}
        >
          Konten 2
        </motion.div>

        {/* Item 3 */}
        <motion.div
          className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-md"
          variants={itemVariants}
        >
          Konten 3
        </motion.div>

        {/* Item 4 */}
        <motion.div
          className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-md"
          variants={itemVariants}
        >
          Konten 4
        </motion.div>

        {/* Tambahkan lebih banyak item sesuai kebutuhan */}
      </motion.div>
    </div>
  );
};

const Logo = () => {
  // Temp logo from https://logoipsum.com/
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 50 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-12 fill-zinc-50"
    >
      <path
        d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z"
        stopColor="#000000"
      ></path>
      <path
        d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z"
        stopColor="#000000"
      ></path>
    </svg>
  );
};

export default Dashboard;
