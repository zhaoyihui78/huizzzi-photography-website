'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { seriesList } from '@/data/series';
import { playPaperRustle } from '@/utils/audio';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme resolution
  let theme: 'default' | 'dark' | 'oriental' = 'default';
  if (pathname === '/series/film-life' || pathname === '/series/film-life/') {
    theme = 'dark';
  } else if (pathname === '/series/seasons-of-beijing' || pathname === '/series/seasons-of-beijing/') {
    theme = 'oriental';
  }

  const isDarkMode = theme === 'dark';
  const isOriental = theme === 'oriental';

  // Play subtle paper sound when navigating to an Oriental theme
  useEffect(() => {
    if (isOriental) {
      playPaperRustle();
    }
  }, [isOriental, pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const categories = seriesList.reduce((acc, series) => {
    if (!acc[series.category]) acc[series.category] = [];
    acc[series.category].push(series);
    return acc;
  }, {} as Record<string, typeof seriesList>);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className={`md:hidden fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 border-b transition-colors duration-1000 ${
        isDarkMode ? 'bg-[#0a0a0a]/95 border-[#1a1a1a] text-white' : isOriental ? 'bg-[#f4f1ea]/95 border-[#e8e4d9] text-[#2c2824]' : 'bg-[#ffffff]/95 border-[#f0f0f0] text-[#111111]'
      } backdrop-blur-md`}>
        <Link href="/" className={`font-heading text-[15px] font-medium tracking-[0.08em] ${isDarkMode ? 'text-[#e8d088]' : isOriental ? 'text-[#8c3b31]' : 'text-[#111111]'}`}>
          HUI ZZZI
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 outline-none">
          <div className="w-5 flex flex-col gap-[5px]">
             <span className={`block h-[1px] w-full transition-transform duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
             <span className={`block h-[1px] w-full transition-opacity duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
             <span className={`block h-[1px] w-full transition-transform duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </div>
        </button>
      </header>

      {/* Sidebar / Mobile Menu */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[220px] z-40 flex flex-col px-8 pt-24 md:pt-12 pb-12 overflow-y-auto border-r transition-transform duration-500 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode
            ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white'
            : isOriental
            ? 'bg-[#f4f1ea] border-[#e8e4d9] text-[#2c2824]'
            : 'bg-[#ffffff] border-[#f0f0f0] text-[#111111]'
        }`}
      >
        <Link
          href="/"
          className={`hidden md:block font-heading text-[15px] font-medium tracking-[0.08em] mb-14 hover:opacity-50 transition-all duration-1000 ${
            isDarkMode ? 'text-[#e8d088]' : isOriental ? 'text-[#8c3b31]' : 'text-[#111111]'
          }`}
        >
          HUI ZZZI
        </Link>

        <nav className="flex flex-col gap-8">
          {Object.entries(categories).map(([category, items]) => (
            <motion.div
              key={category}
              className="flex flex-col gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            >
              <span
                className={`font-mono text-[9px] font-normal uppercase tracking-[0.25em] transition-colors duration-1000 ${
                  isDarkMode ? 'text-[#555555]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'
                }`}
              >
                {category}
              </span>
              {items.map((series) => {
                const href = `/series/${series.slug}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={series.slug}
                    href={href}
                    className={`group relative text-[11px] leading-relaxed transition-colors duration-1000 w-fit tracking-wide ${
                      isActive
                        ? isDarkMode
                          ? 'text-white font-normal'
                          : isOriental
                          ? 'text-[#2c2824] font-medium'
                          : 'text-[#111111] font-normal'
                        : isDarkMode
                        ? 'text-[#666666] hover:text-[#aaaaaa]'
                        : isOriental
                        ? 'text-[#8c8577] hover:text-[#2c2824]'
                        : 'text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    {series.title}
                    <span
                      className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                        isDarkMode ? 'bg-white' : isOriental ? 'bg-[#8c3b31]' : 'bg-[#111111]'
                      } ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                    />
                  </Link>
                );
              })}
            </motion.div>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/about"
              className={`group relative text-[11px] tracking-wide transition-colors duration-1000 w-fit ${
                pathname === '/about'
                  ? isDarkMode
                    ? 'text-white font-normal'
                    : isOriental
                    ? 'text-[#2c2824] font-medium'
                    : 'text-[#111111] font-normal'
                  : isDarkMode
                  ? 'text-[#666666] hover:text-[#aaaaaa]'
                  : isOriental
                  ? 'text-[#8c8577] hover:text-[#2c2824]'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              About
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                  isDarkMode ? 'bg-white' : isOriental ? 'bg-[#8c3b31]' : 'bg-[#111111]'
                } ${pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}
              />
            </Link>
            <Link
              href="/guestbook"
              className={`group relative text-[11px] tracking-wide transition-colors duration-1000 w-fit ${
                pathname === '/guestbook'
                  ? isDarkMode
                    ? 'text-white font-normal'
                    : isOriental
                    ? 'text-[#2c2824] font-medium'
                    : 'text-[#111111] font-normal'
                  : isDarkMode
                  ? 'text-[#666666] hover:text-[#aaaaaa]'
                  : isOriental
                  ? 'text-[#8c8577] hover:text-[#2c2824]'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              Guestbook
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                  isDarkMode ? 'bg-white' : isOriental ? 'bg-[#8c3b31]' : 'bg-[#111111]'
                } ${pathname === '/guestbook' ? 'w-full' : 'w-0 group-hover:w-full'}`}
              />
            </Link>
            <Link
              href="/map"
              className={`group relative text-[11px] tracking-wide transition-colors duration-1000 w-fit ${
                pathname === '/map'
                  ? isDarkMode
                    ? 'text-white font-normal'
                    : isOriental
                    ? 'text-[#2c2824] font-medium'
                    : 'text-[#111111] font-normal'
                  : isDarkMode
                  ? 'text-[#666666] hover:text-[#aaaaaa]'
                  : isOriental
                  ? 'text-[#8c8577] hover:text-[#2c2824]'
                  : 'text-[#888888] hover:text-[#111111]'
              }`}
            >
              Map
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                  isDarkMode ? 'bg-white' : isOriental ? 'bg-[#8c3b31]' : 'bg-[#111111]'
                } ${pathname === '/map' ? 'w-full' : 'w-0 group-hover:w-full'}`}
              />
            </Link>
          </div>
        </nav>

        <div className="mt-auto pt-10">
          <Clock theme={theme} />
          <p
            className={`font-mono text-[8px] tracking-[0.2em] uppercase mt-2 transition-colors duration-1000 ${
              isDarkMode ? 'text-[#444444]' : isOriental ? 'text-[#b8b3a5]' : 'text-[#dddddd]'
            }`}
          >
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Mobile Menu Overlay backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

function Clock({ theme }: { theme?: 'default' | 'dark' | 'oriental' }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m} CST`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className={`font-mono text-[9px] tracking-[0.15em] transition-colors duration-1000 ${
        theme === 'dark' ? 'text-[#666666]' : theme === 'oriental' ? 'text-[#a6a092]' : 'text-[#cccccc]'
      }`}
    >
      {time}
    </p>
  );
}
