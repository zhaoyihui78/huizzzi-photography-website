import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC, Space_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import EntranceOverlay from "@/components/EntranceOverlay";

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
      className={`${playfair.variable} ${inter.variable} ${notoSansSC.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body paper-grain transition-colors duration-1000 bg-white text-[#111111] has-[[data-dark-mode='true']]:bg-[#0a0a0a] has-[[data-dark-mode='true']]:text-white">
        <EntranceOverlay />
        <CustomCursor />
        <ScrollProgress />
        <Sidebar />
        <div className="ml-[220px] min-h-full">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </body>
    </html>
  );
}
