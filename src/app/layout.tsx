import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC, Space_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import EntranceOverlay from "@/components/EntranceOverlay";
import SmoothScroll from "@/components/SmoothScroll";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HUI ZZZI | Photography Portfolio",
  description: "Personal photography portfolio of HUI ZZZI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${playfair.variable} ${inter.variable} ${notoSansSC.variable} ${spaceMono.variable} antialiased`}
    >
      <body className="font-body paper-grain transition-colors duration-1000 bg-white text-[#111111] has-[[data-theme='dark']]:bg-[#0a0a0a] has-[[data-theme='dark']]:text-white has-[[data-theme='oriental']]:bg-[#f4f1ea] has-[[data-theme='oriental']]:text-[#2c2824]">
        <SmoothScroll>
          <EntranceOverlay />
          <CustomCursor />
          <ScrollProgress />
          <Sidebar />
          <div className="ml-[220px] min-h-screen">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
