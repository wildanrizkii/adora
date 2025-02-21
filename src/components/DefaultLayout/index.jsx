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
  FiLogOut,
} from "react-icons/fi";
import { unstableSetRender, Avatar, Space, Dropdown, Badge, Tabs } from "antd";
import { createRoot } from "react-dom/client";
import { AiOutlineProduct, AiOutlineLogout } from "react-icons/ai";
import { FaRegFileAlt, FaCloud } from "react-icons/fa";
import { WiStars } from "react-icons/wi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiMiniChevronUpDown } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

dayjs.locale("id");

unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

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
  const [showTheme, setShowTheme] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { resolvedTheme } = useTheme();

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

  const ringAnimation = {
    initial: { rotate: 0 },
    animate: isHovering
      ? {
          rotate: [0, -15, 15, -10, 10, -5, 5, 0], // Gerakan berdering ke kiri dan kanan
          transition: {
            duration: 0.8,
            ease: "easeInOut",
            repeat: 1, // Ulang sekali saat hover
          },
        }
      : {},
  };

  const iconColor = isHovering
    ? "#FACC15" // Kuning saat hover
    : resolvedTheme === "dark"
    ? "#D1D5DB" // Abu muda untuk dark theme (gray-300)
    : "#6B7280"; // Abu muda untuk light theme (gray-500)

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
        <div className="relative flex items-center space-x-3">
          {/* Dropdown */}
          <AnimatePresence>
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              arrow
              align={{
                offset: [3, 18], // Tetap sejajar dengan container
              }}
              className="text-zinc-700 cursor-pointer"
              dropdownRender={() => (
                <div
                  className="w-72 h-96 dark:bg-zinc-700 bg-white rounded-md p-4 shadow-lg border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-center mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-2 overflow-y-auto h-[calc(100%-40px)]">
                    <div className="bg-zinc-200 dark:bg-zinc-600 rounded-md p-2">
                      New message received
                    </div>
                    <div className="bg-zinc-200 dark:bg-zinc-600 rounded-md p-2">
                      Your balance is updated
                    </div>
                    <div className="bg-zinc-200 dark:bg-zinc-600 rounded-md p-2">
                      Reminder: Budget review
                    </div>
                  </div>
                </div>
              )}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {" "}
                {/* Container tetap */}
                <motion.div
                  className="cursor-pointer p-1 pt-1.5"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  {...ringAnimation}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 26 26"
                    fill={iconColor}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <path d="M12 24a2.5 2.5 0 0 1-2.5-2.5h5A2.5 2.5 0 0 1 12 24zm8.485-5H3.515c-.583 0-1.063-.448-1.116-1.026-.05-.55.288-1.05.821-1.212C4.057 15.56 5 14.07 5 12V9c0-3.614 2.499-6.641 6-7.412V1a1 1 0 0 1 2 0v.588C16.501 2.359 19 5.386 19 9v3c0 2.07.943 3.56 2.78 4.762.533.162.871.662.821 1.212-.053.578-.533 1.026-1.116 1.026z" />
                  </motion.svg>
                </motion.div>
              </div>
            </Dropdown>
          </AnimatePresence>

          <AnimatePresence>
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              arrow
              className="rounded-full shadow-lg"
              dropdownRender={() => {
                return (
                  <div
                    className="cursor-default dark:bg-zinc-700 rounded-md p-6 shadow-lg min-w-xs border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center mb-4">
                      {true?.user?.image ? (
                        <Avatar
                          shape="circle"
                          size={80}
                          src={
                            "https://api.dicebear.com/9.x/micah/svg?clip=true"
                          }
                          className="rounded-full bg-zinc-300 dark:bg-white shadow-md shadow-zinc-200 dark:shadow-zinc-800"
                        />
                      ) : (
                        <Avatar
                          shape="circle"
                          size={80}
                          src={
                            "https://api.dicebear.com/9.x/micah/svg?clip=true"
                          }
                          className="rounded-full bg-zinc-300 dark:bg-white shadow-md shadow-zinc-200 dark:shadow-zinc-800"
                        />
                      )}
                    </div>
                    <div className="space-y-8">
                      <div
                        className="cursor-default text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h1 className="font-semibold dark:text-white">
                          John Doe
                        </h1>
                        <h1 className="font-normal dark:text-white">Admin</h1>
                      </div>

                      <div className="flex space-x-2">
                        <Link href="/pengaturan/akun" className="flex-grow">
                          <div className="flex shadow-md justify-center items-center p-3 gap-1 border text-indigo-600 hover:text-white bg-indigo-600 border-indigo-600 hover:border-indigo-700 hover:bg-indigo-700 rounded-md cursor-pointer transition-colors h-full">
                            {/* <SettingOutlined /> */}
                            <h1 className="mb-0.5 text-white ">
                              Pengaturan Akun
                            </h1>
                          </div>
                        </Link>
                        <div
                          className="flex shadow-md w-14 justify-center items-center p-4 gap-1 text-white text-lg bg-red-500 hover:bg-red-600 rounded-md cursor-pointer transition-colors"
                          onClick={() => signOut()}
                        >
                          <FiLogOut />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            >
              <Avatar
                shape="circle"
                size={42}
                src={"https://api.dicebear.com/9.x/micah/svg?clip=true"}
                style={{ cursor: "pointer" }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-zinc-300 dark:bg-white shadow-md shadow-zinc-200 dark:shadow-zinc-800"
              />
            </Dropdown>
          </AnimatePresence>
          {/* <motion.div
            className="w-20 text-left overflow-hidden whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            John Doe
          </motion.div> */}
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
        {open && <span className="text-md font-medium pt-0.5">Hide</span>}
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
  const [isCooldown, setIsCooldown] = useState(false); // ✅ State untuk delay

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (isCooldown) return;

    setIsCooldown(true);
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

    setTimeout(() => {
      setIsCooldown(false);
    }, 1000);
  };

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
        boxShadow: "inset 4px 2px 4px rgba(0, 0, 0, 0.2)",
      }}
      onClick={handleClick}
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
