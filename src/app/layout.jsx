import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ConfigProvider } from "antd";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Adora",
  description: "Apotek Adora",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const theme = {
  token: {
    colorPrimary: "#8a2be2", // Ungu
    colorPrimaryHover: "#7a22c9",
    colorPrimaryActive: "#6b1faf",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ConfigProvider theme={theme}>{children}</ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
