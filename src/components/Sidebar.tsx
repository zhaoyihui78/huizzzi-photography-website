'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { seriesList } from '@/data/series';

export default function Sidebar() {
  const pathname = usePathname();
  // Handle both with and without trailing slash
  const isDarkMode = pathname === '/series/film-life' || pathname === '/series/film-life/';

  const categories = seriesList.reduce((acc, series) => {
    if (!acc[series.category]) acc[series.category] = [];
    acc[series.category].push(series);
    return acc;
  }, {} as Record<string, typeof seriesList>);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[220px] backdrop-blur-sm z-50 flex flex-col px-8 py-12 overflow-y-auto border-r transition-colors duration-1000 ease-in-out ${
        isDarkMode
          ? 'bg-[#0a0a0a]/95 border-[#1a1a1a] text-white'
          : 'bg-[#ffffff]/95 border-[#f0f0f0] text-[#111111]'
      }`}
    >
      <Link
        href="/"
        className={`font-heading text-[15px] font-medium tracking-[0.08em] mb-14 hover:opacity-50 transition-all duration-1000 ${
          isDarkMode ? 'text-[#e8d088]' : 'text-[#111111]'
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
                isDarkMode ? 'text-[#555555]' : 'text-[#cccccc]'
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
                        : 'text-[#111111] font-normal'
                      : isDarkMode
                      ? 'text-[#666666] hover:text-[#aaaaaa]'
                      : 'text-[#888888] hover:text-[#111111]'
                  }`}
                >
                  {series.title}
                  <span
                    className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                      isDarkMode ? 'bg-white' : 'bg-[#111111]'
                    } ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </Link>
              );
            })}
          </motion.div>
        ))}

        <div className="mt-6">
          <Link
            href="/about"
            className={`group relative text-[11px] tracking-wide transition-colors duration-1000 w-fit ${
              pathname === '/about'
                ? isDarkMode
                  ? 'text-white font-normal'
                  : 'text-[#111111] font-normal'
                : isDarkMode
                ? 'text-[#666666] hover:text-[#aaaaaa]'
                : 'text-[#888888] hover:text-[#111111]'
            }`}
          >
            About
            <span
              className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${
                isDarkMode ? 'bg-white' : 'bg-[#111111]'
              } ${pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}
            />
          </Link>
        </div>
      </nav>

      <div className="mt-auto pt-10">
        <Clock isDarkMode={isDarkMode} />
        <p
          className={`font-mono text-[8px] tracking-[0.2em] uppercase mt-2 transition-colors duration-1000 ${
            isDarkMode ? 'text-[#444444]' : 'text-[#dddddd]'
          }`}
        >
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}

function Clock({ isDarkMode }: { isDarkMode?: boolean }) {
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
        isDarkMode ? 'text-[#666666]' : 'text-[#cccccc]'
      }`}
    >
      {time}
    </p>
  );
}
