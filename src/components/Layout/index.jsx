"use client";
import React, { useState, useEffect } from "react";
import {
  FiBarChart,
  FiChevronDown,
  FiChevronsRight,
  FiDollarSign,
  FiHome,
  FiMonitor,
  FiShoppingCart,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export const DefaultLayout = ({ title }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar
        open={open}
        setOpen={setOpen}
        selected={selected}
        setSelected={setSelected}
      />
      <motion.div
        layout
        className="flex-1"
        animate={{
          marginLeft: 0,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <motion.div
          layout
          className="flex flex-col min-h-screen overflow-x-hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Header title={"Dashboard"} />
          <Content />
          <Footer />
        </motion.div>
      </motion.div>
    </div>
  );
};

const Header = ({ title }) => {
  const theme = ThemeToggler();
  return (
    <motion.header
      layout
      className="h-16 flex items-center justify-between px-6 pt-2 sticky top-0 z-10"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h1 className="font-semibold text-2xl">{title}</h1>

      <div className="flex items-center gap-4">
        <span className="cursor-pointer">{theme}</span>
        <span className="cursor-pointer">Profile</span>
      </div>
    </motion.header>
  );
};

const Footer = () => {
  return (
    <motion.footer
      layout
      className="h-14 bg-transparent shadow-sm flex items-center justify-center mt-auto"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <p className="text-xs">
        &copy; 2025 Adora Pharmacy. All rights reserved.
      </p>
    </motion.footer>
  );
};

const Sidebar = ({ open, setOpen, selected, setSelected }) => {
  const { resolvedTheme } = useTheme();
  return (
    <motion.nav
      layout
      className={`sticky top-0 h-screen shrink-0 ${
        resolvedTheme === "dark" ? "shadow-md shadow-zinc-800" : "shadow-lg"
      }  p-3`}
      style={{
        width: open ? "225px" : "fit-content",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <TitleSection open={open} />

      <div className="space-y-2">
        <Option
          Icon={FiHome}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiShoppingCart}
          title="Cashier"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiDollarSign}
          title="Sales"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={FiMonitor}
          title="View Site"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiTag}
          title="Tags"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiBarChart}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiUsers}
          title="Members"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  const { resolvedTheme } = useTheme();
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-12 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800"
          : `text-base ${
              resolvedTheme === "dark"
                ? "hover:bg-slate-100 hover:text-indigo-800"
                : "hover:bg-indigo-100 hover:text-indigo-800"
            }`
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-md font-medium"
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open }) => {
  const { resolvedTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const branches = [
    { id: 1, name: "Adora Cigadung" },
    { id: 2, name: "Adora Cikutra" },
  ];

  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div
        className={`flex cursor-pointer items-center justify-between rounded-md transition-colors ${
          resolvedTheme === "dark"
            ? "hover:bg-indigo-100 hover:text-black"
            : "hover:bg-indigo-100"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-sm font-semibold">Adora</span>
              <span className="block text-xs">Cigadung</span>
            </motion.div>
          )}
        </div>
        {open && (
          <motion.div className="mr-2">
            <FiChevronDown
              className={`transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </motion.div>
        )}
      </div>

      {/* Dropdown Menu */}
      {open && isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`absolute left-0 mt-2 w-52 mx-2 rounded-lg ${
            resolvedTheme === "dark" ? "bg-zinc-700" : "bg-indigo-100 shadow-md"
          } shadow-lg py-1 z-50`}
        >
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              className={`px-4 py-4 my-2 mx-2.5 text-left text-sm cursor-pointer rounded-md ${
                resolvedTheme === "dark"
                  ? "text-white hover:bg-indigo-400"
                  : "text-base hover:bg-indigo-400"
              }`}
            >
              {branch.name}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const Logo = () => {
  // Temp logo from https://logoipsum.com/
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600"
    >
      <svg
        width="24"
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-slate-50"
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
    </motion.div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 transition-colors"
    >
      <div className="flex items-center p-5">
        <motion.div
          layout
          className="grid size-12 place-content-center text-lg"
        >
          <FiChevronsRight
            size={24}
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-md font-medium pt-0.5"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

const Content = () => {
  return (
    <div className="p-6">
      <div>Content</div>
    </div>
  );
};

const ThemeToggler = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Untuk memastikan komponen hanya dirender di client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <motion.div
      className={`w-16 h-8 rounded-full p-1 flex items-center cursor-pointer 
                  ${
                    resolvedTheme === "dark"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "bg-gradient-to-r from-sky-400 to-blue-500"
                  }`}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      layout
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
        layout
        animate={{ x: resolvedTheme === "dark" ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="text-indigo-700" size={16} />
        ) : (
          <Sun className="text-amber-500" size={16} />
        )}
      </motion.div>
    </motion.div>
  );
};
