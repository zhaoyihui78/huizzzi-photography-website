'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { seriesList } from '@/data/series';

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/we/login' || pathname === '/we/login/') {
    return <PrivateEntrySidebar />;
  }

  if (pathname.startsWith('/we')) {
    return <PrivateSidebar pathname={pathname} />;
  }

  return <PublicSidebar pathname={pathname} />;
}

function PublicSidebar({ pathname }: { pathname: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  
  // Theme resolution
  let theme: 'default' | 'dark' | 'oriental' = 'default';
  if (pathname === '/series/film-life' || pathname === '/series/film-life/') {
    theme = 'dark';
  } else if (pathname === '/series/seasons-of-beijing' || pathname === '/series/seasons-of-beijing/') {
    theme = 'oriental';
  }

  const isDarkMode = theme === 'dark';
  const isOriental = theme === 'oriental';

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const stored = window.localStorage.getItem('sidebar-collapsed');
    if (stored === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDesktopCollapsed(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const width = desktopCollapsed ? '84px' : '220px';
    document.documentElement.style.setProperty('--sidebar-w', width);
    window.localStorage.setItem('sidebar-collapsed', desktopCollapsed ? '1' : '0');
    return () => {
      document.documentElement.style.setProperty('--sidebar-w', '220px');
    };
  }, [desktopCollapsed]);

  const categories = seriesList.reduce((acc, series) => {
    if (!acc[series.category]) acc[series.category] = [];
    acc[series.category].push(series);
    return acc;
  }, {} as Record<string, typeof seriesList>);

  const aboutActive = pathname === '/about' || pathname === '/about/';
  const guestbookActive = pathname === '/guestbook' || pathname === '/guestbook/';
  const mapActive = pathname === '/map' || pathname === '/map/';
  const notesActive = pathname.startsWith('/notes');
  const isCollapsed = hydrated && desktopCollapsed;
  const collapsedCategoryLabels: Record<string, string> = {
    CITY: 'CTY',
    NATURE: 'NAT',
    ARCHITECTURE: 'ARC',
    FILM: 'FLM',
    LIFE: 'LIF',
  };

  const lineColor = isDarkMode ? 'bg-white' : isOriental ? 'bg-[#8c3b31]' : 'bg-[#111111]';
  const mutedText = isDarkMode ? 'text-[#666666] hover:text-[#aaaaaa]' : isOriental ? 'text-[#8c8577] hover:text-[#2c2824]' : 'text-[#888888] hover:text-[#111111]';
  const activeText = isDarkMode ? 'text-white font-normal' : isOriental ? 'text-[#2c2824] font-medium' : 'text-[#111111] font-normal';
  const accentText = isDarkMode ? 'text-[#e8d088]' : isOriental ? 'text-[#8c3b31]' : 'text-[#111111]';
  const accentBorder = isDarkMode ? 'border-[#3a3424]' : isOriental ? 'border-[#d6ceb8]' : 'border-[#e5e5e5]';
  const accentSurface = isDarkMode ? 'bg-[#111111]/96' : isOriental ? 'bg-[#f4f1ea]/96' : 'bg-[rgba(255,255,255,0.96)]';

  return (
    <>
      {/* Mobile Top Bar */}
      <header className={`md:hidden fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 border-b transition-colors duration-1000 ${
        isDarkMode ? 'bg-[#0a0a0a]/95 border-[#1a1a1a] text-white' : isOriental ? 'bg-[#f4f1ea]/95 border-[#e8e4d9] text-[#2c2824]' : 'bg-[#ffffff]/95 border-[#f0f0f0] text-[#111111]'
      } backdrop-blur-md`}>
        <Link href="/" className={`font-heading text-[15px] font-medium tracking-[0.08em] ${isDarkMode ? 'text-[#e8d088]' : isOriental ? 'text-[#8c3b31]' : 'text-[#111111]'}`}>
          HUI ZZZI
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-3 -mr-2 outline-none min-h-[44px] min-w-[44px] flex items-center justify-center">
          <div className="w-5 flex flex-col gap-[5px]">
             <span className={`block h-[1px] w-full transition-transform duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
             <span className={`block h-[1px] w-full transition-opacity duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
             <span className={`block h-[1px] w-full transition-transform duration-300 ${isDarkMode ? 'bg-white' : 'bg-[#111111]'} ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </div>
        </button>
      </header>

      {/* Sidebar / Mobile Menu */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[220px] md:w-[var(--sidebar-w,220px)] z-40 flex flex-col pt-24 md:pt-12 pb-12 overflow-y-auto border-r transition-[width,transform,padding] duration-700 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode
            ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white'
            : isOriental
            ? 'bg-[#f4f1ea] border-[#e8e4d9] text-[#2c2824]'
            : 'bg-[#ffffff] border-[#f0f0f0] text-[#111111]'
        } ${isCollapsed ? 'md:px-4' : 'px-8'}`}
      >
        <div className={`pointer-events-none absolute inset-0 ${
          isDarkMode
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(232,208,136,0.04),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.015))]'
            : isOriental
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(140,59,49,0.05),transparent_28%),linear-gradient(to_bottom,rgba(201,169,110,0.04),transparent_22%,transparent_78%,rgba(201,169,110,0.03))]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.035),transparent_24%),linear-gradient(to_bottom,rgba(0,0,0,0.015),transparent_20%,transparent_80%,rgba(0,0,0,0.012))]'
        }`} />
        <div className={`pointer-events-none absolute top-0 bottom-0 right-0 w-px ${isDarkMode ? 'bg-white/5' : isOriental ? 'bg-[#d6ceb8]' : 'bg-black/[0.04]'}`} />

        <button
          type="button"
          onClick={() => setDesktopCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          className={`hidden md:flex absolute top-1/2 right-[2px] -translate-y-1/2 z-20 h-32 w-6 items-center justify-center group`}
        >
          <div className={`absolute inset-0 rounded-full ${
            isDarkMode
              ? 'bg-white/[0.02] group-hover:bg-white/[0.04]'
              : isOriental
              ? 'bg-[#8c3b31]/[0.02] group-hover:bg-[#8c3b31]/[0.05]'
              : 'bg-black/[0.015] group-hover:bg-black/[0.03]'
          } transition-colors duration-500`} />
          <motion.div
            className={`flex flex-col items-center justify-center opacity-40 transition-all duration-500 group-hover:opacity-100 ${accentText}`}
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <svg width="10" height="60" viewBox="0 0 10 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1 L3 30 L8 59" />
            </svg>
          </motion.div>
        </button>

        <Link href="/" className="hidden md:block mb-14 transition-opacity duration-700 hover:opacity-70">
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="brand-collapsed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mx-auto flex h-12 w-12 items-center justify-center border ${accentBorder} ${accentSurface} shadow-sm`}
              >
                <span className={`font-heading text-[13px] tracking-[0.16em] ${accentText}`}>HZ</span>
              </motion.div>
            ) : (
              <motion.div
                key="brand-expanded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className={`font-heading text-[15px] font-medium tracking-[0.12em] ${accentText}`}>
                  HUI ZZZI
                </p>
                <p className={`font-mono text-[8px] uppercase tracking-[0.28em] ${
                  isDarkMode ? 'text-[#666666]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'
                }`}>
                  Curated Sequence
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <nav className={`relative flex flex-col ${isCollapsed ? 'gap-6' : 'gap-8'}`}>
          {Object.entries(categories).map(([category, items]) => (
            <motion.div
              key={category}
              className={`flex flex-col ${isCollapsed ? 'items-center gap-3' : 'gap-2.5'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isCollapsed ? (
                  <motion.span
                    key={`${category}-collapsed`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`font-mono text-[8px] font-normal uppercase tracking-[0.24em] text-center transition-colors duration-1000 ${
                      isDarkMode ? 'text-[#555555]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'
                    }`}
                  >
                    {collapsedCategoryLabels[category] ?? category.slice(0, 3)}
                  </motion.span>
                ) : (
                  <motion.span
                    key={`${category}-expanded`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`font-mono text-[9px] font-normal uppercase tracking-[0.25em] transition-colors duration-1000 ${
                      isDarkMode ? 'text-[#555555]' : isOriental ? 'text-[#a6a092]' : 'text-[#cccccc]'
                    }`}
                  >
                    {category}
                  </motion.span>
                )}
              </AnimatePresence>
              {items.map((series) => {
                const href = `/series/${series.slug}`;
                const isActive = pathname === href || pathname === `${href}/`;
                return (
                  <Link
                    key={series.slug}
                    href={href}
                    aria-label={series.title}
                    title={isCollapsed ? series.title : undefined}
                    className={`group relative leading-relaxed transition-colors duration-1000 tracking-wide ${
                      isCollapsed ? 'w-9 text-center text-[10px]' : 'w-fit text-[11px]'
                    } ${isActive ? activeText : mutedText}`}
                  >
                    {isCollapsed ? (
                      <>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition-all duration-500 group-hover:border-current/20">
                          <span className={`block rounded-full transition-all duration-500 ${isActive ? `h-2.5 w-2.5 ${lineColor}` : isDarkMode ? 'h-1.5 w-1.5 bg-[#444444]' : isOriental ? 'h-1.5 w-1.5 bg-[#c9bca1]' : 'h-1.5 w-1.5 bg-[#d9d9d9]'}`} />
                        </span>
                        <span className={`pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.24em] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${accentBorder} ${accentSurface} ${accentText}`}>
                          {series.title}
                        </span>
                      </>
                    ) : (
                      series.title
                    )}
                    <span
                      className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${lineColor} ${
                        isCollapsed ? 'opacity-0' : isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}
            </motion.div>
          ))}

          <div className={`mt-6 flex flex-col ${isCollapsed ? 'items-center gap-4' : 'gap-3'}`}>
            <Link
              href="/about"
              aria-label="About"
              title={isCollapsed ? 'About' : undefined}
              className={`group relative tracking-wide transition-colors duration-1000 ${
                isCollapsed ? 'w-9 text-center text-[10px]' : 'w-fit text-[11px]'
              } ${aboutActive ? activeText : mutedText}`}
            >
              {isCollapsed ? (
                <>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition-all duration-500 group-hover:border-current/20">
                    AB
                  </span>
                  <span className={`pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.24em] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${accentBorder} ${accentSurface} ${accentText}`}>
                    About
                  </span>
                </>
              ) : 'About'}
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${lineColor} ${
                  isCollapsed ? 'opacity-0' : aboutActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
            <Link
              href="/guestbook"
              aria-label="Guestbook"
              title={isCollapsed ? 'Guestbook' : undefined}
              className={`group relative tracking-wide transition-colors duration-1000 ${
                isCollapsed ? 'w-9 text-center text-[10px]' : 'w-fit text-[11px]'
              } ${guestbookActive ? activeText : mutedText}`}
            >
              {isCollapsed ? (
                <>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition-all duration-500 group-hover:border-current/20">
                    GB
                  </span>
                  <span className={`pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.24em] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${accentBorder} ${accentSurface} ${accentText}`}>
                    Guestbook
                  </span>
                </>
              ) : 'Guestbook'}
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${lineColor} ${
                  isCollapsed ? 'opacity-0' : guestbookActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
            <Link
              href="/notes"
              aria-label="Field Notes"
              title={isCollapsed ? 'Field Notes' : undefined}
              className={`group relative tracking-wide transition-colors duration-1000 ${
                isCollapsed ? 'w-9 text-center text-[10px]' : 'w-fit text-[11px]'
              } ${notesActive ? activeText : mutedText}`}
            >
              {isCollapsed ? (
                <>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition-all duration-500 group-hover:border-current/20">
                    FN
                  </span>
                  <span className={`pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.24em] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${accentBorder} ${accentSurface} ${accentText}`}>
                    Field Notes
                  </span>
                </>
              ) : 'Field Notes'}
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${lineColor} ${
                  isCollapsed ? 'opacity-0' : notesActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
            <Link
              href="/map"
              aria-label="Map"
              title={isCollapsed ? 'Map' : undefined}
              className={`group relative tracking-wide transition-colors duration-1000 ${
                isCollapsed ? 'w-9 text-center text-[10px]' : 'w-fit text-[11px]'
              } ${mapActive ? activeText : mutedText}`}
            >
              {isCollapsed ? (
                <>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent transition-all duration-500 group-hover:border-current/20">
                    MP
                  </span>
                  <span className={`pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 whitespace-nowrap border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.24em] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${accentBorder} ${accentSurface} ${accentText}`}>
                    Map
                  </span>
                </>
              ) : 'Map'}
              <span
                className={`absolute -bottom-[3px] left-0 h-[1px] transition-all duration-500 ease-out ${lineColor} ${
                  isCollapsed ? 'opacity-0' : mapActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          </div>
        </nav>

        <div className={`mt-auto pt-10 ${isCollapsed ? 'text-center' : ''}`}>
          <Clock theme={theme} collapsed={isCollapsed} />
          <p
            className={`font-mono text-[8px] tracking-[0.2em] uppercase mt-2 transition-colors duration-1000 ${
              isDarkMode ? 'text-[#444444]' : isOriental ? 'text-[#b8b3a5]' : 'text-[#dddddd]'
            } ${isCollapsed ? 'opacity-0 md:opacity-100 text-[7px]' : ''}`}
          >
            {isCollapsed ? '©' : `© ${new Date().getFullYear()} HuiZzzzi Photography`}
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

function Clock({ theme, collapsed }: { theme?: 'default' | 'dark' | 'oriental'; collapsed?: boolean }) {
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
      } ${collapsed ? 'text-center text-[8px]' : ''}`}
    >
      {collapsed ? time.slice(0, 5) : time}
    </p>
  );
}

function PrivateSidebar({ pathname }: { pathname: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'moments' | 'timeline' | 'notes'>('moments');

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', '236px');
    return () => {
      document.documentElement.style.setProperty('--sidebar-w', '220px');
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sectionIds = ['moments', 'timeline', 'notes'] as const;
    const scroller =
      window.innerWidth < 768 ? document.getElementById('main-scroll-container') : window;

    const updateActiveSection = () => {
      let current: (typeof sectionIds)[number] = 'moments';
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= 180) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    updateActiveSection();
    scroller?.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      scroller?.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const navigateToSection = (id: 'moments' | 'timeline' | 'notes') => {
    const element = document.getElementById(id);
    setMobileMenuOpen(false);
    if (!element) return;

    setActiveSection(id);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navItems: Array<{
    label: string;
    slug: 'moments' | 'timeline' | 'notes' | 'trips-map';
    status?: string;
  }> = [
    { label: 'Moments', slug: 'moments' },
    { label: 'Timeline', slug: 'timeline' },
    { label: 'Notes', slug: 'notes' },
    { label: 'Trips Map', slug: 'trips-map', status: 'Soon' },
  ];

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 border-b border-[#efe7dc] bg-[#fdf9f3]/95 text-[#4f4033] backdrop-blur-md">
        <Link href="/" className="flex flex-col">
          <span className="font-heading text-[15px] font-medium tracking-[0.08em] text-[#7c624a]">
            HUI ZZZI
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#b39b82]">
            Private Archive
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="p-3 -mr-2 outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={mobileMenuOpen ? '关闭私人导航' : '打开私人导航'}
        >
          <div className="w-5 flex flex-col gap-[5px]">
            <span className={`block h-[1px] w-full bg-[#7c624a] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block h-[1px] w-full bg-[#7c624a] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[1px] w-full bg-[#7c624a] transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </div>
        </button>
      </header>

      <aside
        className={`fixed top-0 left-0 h-screen w-[236px] z-40 flex flex-col pt-24 md:pt-12 pb-12 overflow-y-auto border-r border-[#efe7dc] bg-[#fdf9f3] text-[#4f4033] transition-transform duration-700 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } px-8`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,154,91,0.08),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.2),transparent_22%,transparent_82%,rgba(199,172,139,0.05))]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[#eadfce]" />

        <Link href="/" className="relative mb-14 block transition-opacity duration-500 hover:opacity-75">
          <div className="space-y-2">
            <p className="font-heading text-[15px] font-medium tracking-[0.12em] text-[#7c624a]">
              HUI ZZZI
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#b39b82]">
              Private Archive
            </p>
            <p className="text-[11px] italic tracking-[0.04em] text-[#9f8a76]">
              only for us
            </p>
          </div>
        </Link>

        <nav className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#cab9a3]">
              Our Pages
            </span>
            {navItems.map((item) => {
              const isSoon = item.slug === 'trips-map';
              const isActive = !isSoon && activeSection === item.slug;

              if (isSoon) {
                return (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between text-[11px] tracking-wide text-[#bda994]"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#cfb98f]">
                      {item.status}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    if (item.slug !== 'trips-map') {
                      navigateToSection(item.slug);
                    }
                  }}
                  className={`group relative w-fit text-left text-[11px] tracking-wide transition-colors duration-500 ${
                    isActive ? 'text-[#4f4033]' : 'text-[#9f8a76] hover:text-[#6d5846]'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-[3px] left-0 h-[1px] bg-[#b59a5b] transition-all duration-500 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="pt-8 border-t border-[#efe7dc]">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#cab9a3] mb-3">
              Boundary
            </p>
            <Link
              href="/"
              className="group relative w-fit text-[11px] tracking-wide text-[#9f8a76] transition-colors duration-500 hover:text-[#6d5846]"
            >
              Back Home
              <span className="absolute -bottom-[3px] left-0 h-[1px] w-0 bg-[#b59a5b] transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>
        </nav>

        <div className="mt-auto pt-10">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#c9b8a4]">
            PRIVATE MODE
          </p>
          <p className="font-mono text-[8px] tracking-[0.2em] uppercase mt-2 text-[#d6cabd]">
            © {new Date().getFullYear()} HuiZzzzi
          </p>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#2b2118]/25 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

function PrivateEntrySidebar() {
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', '236px');
    return () => {
      document.documentElement.style.setProperty('--sidebar-w', '220px');
    };
  }, []);

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 border-b border-[#efe7dc] bg-[#fdf9f3]/95 text-[#4f4033] backdrop-blur-md">
        <Link href="/" className="flex flex-col">
          <span className="font-heading text-[15px] font-medium tracking-[0.08em] text-[#7c624a]">
            HUI ZZZI
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#b39b82]">
            Private Entry
          </span>
        </Link>
      </header>

      <aside className="fixed top-0 left-0 h-screen w-[236px] z-40 hidden md:flex flex-col pt-12 pb-12 px-8 overflow-y-auto border-r border-[#efe7dc] bg-[#fdf9f3] text-[#4f4033]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,154,91,0.08),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.2),transparent_22%,transparent_82%,rgba(199,172,139,0.05))]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[#eadfce]" />

        <Link href="/" className="relative mb-14 block transition-opacity duration-500 hover:opacity-75">
          <div className="space-y-2">
            <p className="font-heading text-[15px] font-medium tracking-[0.12em] text-[#7c624a]">
              HUI ZZZI
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#b39b82]">
              Private Entry
            </p>
            <p className="text-[11px] italic tracking-[0.04em] text-[#9f8a76]">
              a closed room
            </p>
          </div>
        </Link>

        <div className="relative pt-8 border-t border-[#efe7dc]">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#cab9a3] mb-3">
            Boundary
          </p>
          <Link
            href="/"
            className="group relative w-fit text-[11px] tracking-wide text-[#9f8a76] transition-colors duration-500 hover:text-[#6d5846]"
          >
            Back Home
            <span className="absolute -bottom-[3px] left-0 h-[1px] w-0 bg-[#b59a5b] transition-all duration-500 group-hover:w-full" />
          </Link>
        </div>

        <div className="mt-auto pt-10">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#c9b8a4]">
            PRIVATE MODE
          </p>
          <p className="font-mono text-[8px] tracking-[0.2em] uppercase mt-2 text-[#d6cabd]">
            © {new Date().getFullYear()} HuiZzzzi
          </p>
        </div>
      </aside>
    </>
  );
}
