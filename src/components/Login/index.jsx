"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Divider, Input, Form, notification, Row, Col, Button } from "antd";
import { signIn, useSession } from "next-auth/react";
import bcrypt from "bcryptjs";
import { useTheme } from "next-themes";
import {
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import supabase from "@/app/utils/db";
import { redirect } from "next/navigation";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { CgLock } from "react-icons/cg";

const ShuffleHero = () => {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setTheme, resolvedTheme } = useTheme();

  let { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "light");
  }, []);

  const handleSubmit = async () => {
    try {
      if (email.length >= 4 && password.length >= 4) {
        const response = await signIn("credentials", {
          email: email,
          password: password,
          redirect: false,
        });

        if (response?.error) {
          notification.error({
            message: "Error",
            description: "Email atau password yang Anda masukan salah!",
            placement: "top",
            duration: 3,
          });
        }
      } else {
        notification.error({
          message: "Error",
          description: "Harap isi email dan password dengan benar!",
          placement: "top",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error on routes", error);
    }
  };

  const handleCheck = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      console.log(data);

      const hash = await bcrypt.hash("adora2025", 10);
      console.log(hash);
    } catch (error) {
      console.error("Error on routes", error);
    }
  };

  return mounted ? (
    !session ? (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-10">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="relative hidden md:block p-8">
            <ShuffleGrid />
          </div>
          <div className="px-8 sm:px-10 md:px-8 py-10 md:py-16">
            <div className="text-center mb-6">
              <img
                src="/images/logo-adora.png"
                alt="Apotek Adora Logo"
                className="w-16 h-16 mx-auto mb-2"
              />
              <span className="text-3xl font-bold text-emerald-600">
                Adora Pharmacy
              </span>
              <p className="text-gray-500 pt-4">Please enter your details</p>
            </div>

            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: false,
                    message: "Isi field ini terlebih dahulu!",
                  },
                ]}
              >
                <Input
                  autoComplete="false"
                  type="text"
                  id="email"
                  placeholder="Email / Username"
                  style={{ minHeight: 40 }}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                  prefix={
                    <span style={{ fontSize: 18, width: 20, color: "#ababab" }}>
                      <MdOutlineAlternateEmail />
                    </span>
                  }
                  size="middle"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: false,
                    message: "Isi field ini terlebih dahulu!",
                  },
                ]}
              >
                <Input.Password
                  autoComplete="false"
                  type="password"
                  id="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ minHeight: 40 }}
                  className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                  prefix={
                    <span style={{ fontSize: 18, width: 20, color: "#ababab" }}>
                      <CgLock />
                    </span>
                  }
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined style={{ fontSize: 18 }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ fontSize: 18 }} />
                    )
                  }
                  size="middle"
                />
              </Form.Item>
              {/* <div className="flex float-end justify-between items-center text-xs">
          <a href="#" className="text-indigo-500 hover:underline">
            Forgot password?
          </a>
        </div> */}
              <button
                type="submit"
                className="w-full h-10 bg-emerald-700 text-white py-2 rounded-md text-sm hover:bg-emerald-800 transition-all"
              >
                Log in
              </button>
            </Form>
            <div className="mt-6 text-center text-gray-400">
              <Divider plain={true} style={{ borderColor: "#dedede" }}>
                or
              </Divider>
            </div>
            <Button
              type="button"
              //   onClick={handleCheck}
              className="w-full h-10 border py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <img
                src="/images/google-logo.png"
                alt="Google"
                className="w-4 h-4"
              />
              <span className="pb-0.5">Log in with Google</span>
            </Button>
            <Footer />
          </div>
        </div>
      </div>
    ) : (
      redirect("/")
    )
  ) : null;
};

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

let squareData = [];

const fetchUnsplashImages = async () => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=pharmacy&per_page=16&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
    );
    const data = await response.json();
    squareData = data.results.map((item, index) => ({
      id: index + 1,
      src: item.urls.regular,
    }));
    return squareData;
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return [];
  }
};

const generateSquares = (data) => {
  return shuffle(data).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState([]);
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    const initializeImages = async () => {
      const images = await fetchUnsplashImages();
      setImageData(images);
      setSquares(generateSquares(images));
    };

    initializeImages();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (imageData.length > 0) {
      shuffleSquares();
    }
  }, [imageData]);

  const shuffleSquares = () => {
    setSquares(generateSquares(imageData));
    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-1">
      {squares}
    </div>
  );
};

const Footer = () => {
  return (
    <motion.footer
      layout
      className="grid h-6 pt-6 bg-transparent items-center justify-center"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <p className="text-xs">
        &copy; 2025 Adora Pharmacy. All rights reserved.
      </p>
    </motion.footer>
  );
};

export default ShuffleHero;
