'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { seriesList } from '@/data/series';

export default function Sidebar() {
  const pathname = usePathname();

  const categories = seriesList.reduce((acc, series) => {
    if (!acc[series.category]) acc[series.category] = [];
    acc[series.category].push(series);
    return acc;
  }, {} as Record<string, typeof seriesList>);

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-[#ffffff]/95 backdrop-blur-sm z-50 flex flex-col px-8 py-12 overflow-y-auto border-r border-[#f0f0f0]">
      <Link
        href="/"
        className="font-heading text-[15px] font-medium tracking-[0.08em] text-[#111111] mb-14 hover:opacity-50 transition-opacity duration-500"
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
            <span className="font-mono text-[9px] font-normal text-[#cccccc] uppercase tracking-[0.25em]">
              {category}
            </span>
            {items.map((series) => {
              const href = `/series/${series.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={series.slug}
                  href={href}
                  className={`group relative text-[11px] leading-relaxed transition-colors duration-300 w-fit tracking-wide ${
                    isActive
                      ? 'text-[#111111] font-normal'
                      : 'text-[#888888] hover:text-[#111111]'
                  }`}
                >
                  {series.title}
                  <span
                    className={`absolute -bottom-[3px] left-0 h-[1px] bg-[#111111] transition-all duration-500 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </motion.div>
        ))}

        <div className="mt-6">
          <Link
            href="/about"
            className={`group relative text-[11px] tracking-wide transition-colors duration-300 w-fit ${
              pathname === '/about'
                ? 'text-[#111111] font-normal'
                : 'text-[#888888] hover:text-[#111111]'
            }`}
          >
            About
            <span
              className={`absolute -bottom-[3px] left-0 h-[1px] bg-[#111111] transition-all duration-500 ease-out ${
                pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>
        </div>
      </nav>

      <div className="mt-auto pt-10">
        <p className="font-mono text-[8px] text-[#dddddd] tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
