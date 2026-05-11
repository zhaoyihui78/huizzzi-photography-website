'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { seriesList } from '@/data/series';

export default function Sidebar() {
  const pathname = usePathname();

  // Group series by category
  const categories = seriesList.reduce((acc, series) => {
    if (!acc[series.category]) acc[series.category] = [];
    acc[series.category].push(series);
    return acc;
  }, {} as Record<string, typeof seriesList>);

  return (
    <aside className="fixed top-0 left-0 h-screen w-[200px] bg-white/95 backdrop-blur-sm z-50 flex flex-col px-6 py-10 overflow-y-auto border-r border-gray-50">
      <Link href="/" className="text-sm font-bold tracking-tight text-black mb-10 hover:opacity-60 transition-opacity duration-500">
        HUI ZZZI
      </Link>

      <nav className="flex flex-col gap-6">
        {Object.entries(categories).map(([category, items]) => (
          <motion.div
            key={category}
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
              {category}
            </span>
            {items.map((series) => {
              const href = `/series/${series.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={series.slug}
                  href={href}
                  className={`group relative text-[12px] leading-relaxed transition-colors duration-300 w-fit ${
                    isActive
                      ? 'text-black font-medium'
                      : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {series.title}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-black transition-all duration-500 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </motion.div>
        ))}

        <div className="mt-4">
          <Link
            href="/about"
            className={`group relative text-[12px] transition-colors duration-300 w-fit ${
              pathname === '/about'
                ? 'text-black font-medium'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            About
            <span
              className={`absolute -bottom-0.5 left-0 h-px bg-black transition-all duration-500 ease-out ${
                pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}
            />
          </Link>
        </div>
      </nav>
    </aside>
  );
}
