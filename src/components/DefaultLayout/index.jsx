"use client";
import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { usePathname } from "next/navigation";
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
  FiBox,
} from "react-icons/fi";
import { AiOutlineProduct, AiOutlineLogout } from "react-icons/ai";
import { FaRegFileAlt, FaCloud } from "react-icons/fa";
import { WiStars } from "react-icons/wi";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiMiniChevronUpDown } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

dayjs.locale("id");

const DefaultLayout = ({ title, content }) => {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(title);
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [open, setOpen] = useState(isDesktop);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(isDesktop);
  }, [isDesktop]);

  return (
    mounted && (
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar
          open={open}
          setOpen={setOpen}
          selected={selected}
          setSelected={setSelected}
        />
        <motion.div
          layout
          className="flex-1 flex flex-col"
          animate={{
            marginLeft: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
        >
          <Header title={title} />
          <motion.div
            layout
            className="flex-1 overflow-x-hidden"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Content content={content} />
          </motion.div>
          <Footer />
        </motion.div>
      </div>
    )
  );
};

const Header = () => {
  const theme = ThemeToggler();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowTheme(window.innerWidth >= 356);
    };

    handleResize(); // Jalankan saat komponen pertama kali dimuat
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getFormattedDate = () => {
    return dayjs().format("dddd, D MMMM YYYY");
  };

  return (
    <motion.header
      layout
      className="h-16 flex items-center justify-between px-6 pt-2 sticky top-0 z-10"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h1 className="font-medium text-xs sm:text-lg line-clamp-2">
        {getFormattedDate()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Animasi untuk tema */}
        <motion.span
          initial={{ opacity: 0.3, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="cursor-pointer"
          style={{ display: showTheme ? "inline" : "none" }}
        >
          {theme}
        </motion.span>

        {/* Animasi untuk profil */}
        <div className="relative">
          <motion.span
            className="cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            initial={{ opacity: 0.4, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            Admin
          </motion.span>

          {/* Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-3 w-48 rounded-lg border border-zinc-100 bg-white dark:border-transparent dark:bg-zinc-700 shadow-lg z-50"
              >
                <div className="p-4">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin
                  </p>
                  {/* Role */}
                </div>
                <hr className="border-gray-200 dark:border-zinc-600" />
                <div className="grid p-4 justify-center">
                  <button
                    className="flex gap-1 p-2 rounded-md items-center text-sm bg-red-500 text-white"
                    onClick={() => {
                      // Logika logout
                      console.log("Logged out");
                      setIsDropdownOpen(false); // Tutup dropdown setelah logout
                    }}
                  >
                    <AiOutlineLogout size={22} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

const menuItems = [
  {
    title: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/",
  },
  {
    title: "Cashier",
    icon: FiShoppingCart,
    path: "/cashier",
  },
  {
    title: "Products",
    icon: AiOutlineProduct,
    path: "/products",
    notifications: 3,
  },
  {
    title: "Suppliers",
    icon: FiBox,
    path: "/suppliers",
  },
  {
    title: "Transactions",
    icon: FiTag,
    path: "/transactions",
  },
  {
    title: "Report",
    icon: FaRegFileAlt,
    path: "/report",
  },
  {
    title: "Account",
    icon: FiUsers,
    path: "/account",
  },
];

const Sidebar = ({ open, setOpen, selected, setSelected }) => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentMenu = menuItems.find((item) => item.path === pathname);
    if (currentMenu) {
      setSelected(currentMenu.title);
    }
  }, [pathname, setSelected]);

  const sidebarClass = mounted
    ? `sticky top-0 min-h-screen shrink-0 ${
        resolvedTheme === "dark" ? "shadow-md shadow-zinc-800" : "shadow-lg"
      } p-3`
    : "sticky top-0 min-h-screen shrink-0 shadow-lg p-3";

  return (
    <motion.nav
      layout
      className={sidebarClass}
      style={{
        width: open ? "225px" : "fit-content",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <TitleSection open={open} />

      <div className="space-y-2">
        {menuItems.map((item) => (
          <Option
            key={item.path}
            Icon={item.icon}
            title={item.title}
            path={item.path}
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={item.notifications}
          />
        ))}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, path, selected, setSelected, open, notifs }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseClass =
    "relative flex h-12 w-full items-center rounded-md transition-colors";
  const selectedClass = "bg-indigo-100 text-indigo-800";
  const defaultHoverClass = mounted
    ? resolvedTheme === "dark"
      ? "hover:bg-slate-100 hover:text-indigo-800"
      : "hover:bg-indigo-100 hover:text-indigo-800"
    : "hover:bg-indigo-100 hover:text-indigo-800";

  const buttonClass = `${baseClass} ${
    selected === title ? selectedClass : `text-base ${defaultHoverClass}`
  }`;

  return (
    <Link href={path} onClick={() => setSelected(title)} className="block">
      <motion.div layout className={buttonClass}>
        <motion.div
          layout
          className="grid h-full w-10 place-content-center text-lg"
        >
          <Icon size={20} />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-md font-medium pt-0.5"
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
            className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white grid place-content-center"
          >
            {notifs}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

const TitleSection = ({ open }) => {
  const { resolvedTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hoverClass = mounted
    ? resolvedTheme === "dark"
      ? "hover:bg-indigo-100 hover:text-black"
      : "hover:bg-indigo-100"
    : "hover:bg-indigo-100";

  const branches = [
    { id: 1, name: "Adora Cigadung" },
    { id: 2, name: "Adora Cikutra" },
  ];

  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div
        className={`flex cursor-pointer items-center justify-between rounded-md transition-colors ${hoverClass}`}
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
              initial={{ opacity: 1, y: 0 }}
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
            <HiMiniChevronUpDown
              size={20}
              className={`transform transition-transform duration-200 ${
                isDropdownOpen ? "rotate-45" : ""
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
  return (
    <motion.img
      layout
      src="/images/logo-adora.png"
      alt="logo adora png"
      className="grid items-center justify-center size-10 shrink-0 place-content-center rounded-md bg-transparent"
    />
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((prev) => !prev)}
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
          <span className="text-md font-medium pt-0.5">Hide sidebar</span>
        )}
      </div>
    </motion.button>
  );
};

const Content = ({ content }) => {
  return (
    <div className="p-6">
      <div>{content}</div>
    </div>
  );
};

const ThemeToggler = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className={`w-16 h-8 rounded-full p-1 flex items-center cursor-pointer relative overflow-hidden 
                  ${
                    resolvedTheme === "dark"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "bg-gradient-to-r from-sky-400 to-blue-500"
                  }`}
      style={{
        boxShadow: "inset 4px 2px 4px rgba(0, 0, 0, 0.2)", // Inner shadow
      }}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      layout
    >
      {/* Latar belakang bintang (mode dark) */}
      {resolvedTheme === "dark" && (
        <motion.div
          initial={{ opacity: 0.2, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-start pl-1.5"
        >
          <WiStars size={24} className="text-white text-sm opacity-70" />
        </motion.div>
      )}

      {/* Latar belakang awan (mode light) */}
      {resolvedTheme === "light" && (
        <motion.div
          initial={{ opacity: 0.4, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-end pr-1 pb-0.5"
        >
          <FaCloud className="text-white text-sm opacity-80" />
          <FaCloud className="text-white text-sm opacity-80 pt-2" />
        </motion.div>
      )}

      {/* Tombol toggle */}
      <motion.div
        className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10"
        layout
        initial={{ x: resolvedTheme === "light" ? 32 : 0 }}
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

export default DefaultLayout;
