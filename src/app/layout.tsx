import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC, Space_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import EntranceOverlay from "@/components/EntranceOverlay";
import SmoothScroll from "@/components/SmoothScroll";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

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
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body className="font-body paper-grain transition-colors duration-1000 bg-white text-[#111111] has-[[data-theme='dark']]:bg-[#0a0a0a] has-[[data-theme='dark']]:text-white has-[[data-theme='oriental']]:bg-[#f4f1ea] has-[[data-theme='oriental']]:text-[#2c2824] pb-[env(safe-area-inset-bottom)]">
        <ServiceWorkerRegister />
        <SmoothScroll>
          <EntranceOverlay />
          <CustomCursor />
          <ScrollProgress />
          <Sidebar />
          {/* Main content wrapper - scrollable area on mobile, standard layout on desktop */}
          <div className="md:ml-[220px] mt-16 md:mt-0 h-[calc(100vh-4rem)] md:h-auto md:min-h-screen overflow-y-auto md:overflow-y-visible" id="main-scroll-container">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
