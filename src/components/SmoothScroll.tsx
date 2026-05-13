'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check if we are on mobile device
    const isMobile = window.innerWidth < 768;
    
    // On mobile, target the specific scroll container instead of the window
    const wrapper = isMobile ? document.getElementById('main-scroll-container') : window;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      wrapper: wrapper as HTMLElement | Window, // Attach to the specific scrollable element on mobile
      content: isMobile ? document.querySelector('#main-scroll-container > div') as HTMLElement : document.body
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Setup ResizeObserver to update Lenis when the body height changes
    // due to lazy loaded images or dynamic content
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    // FIX: Add lenis class to html element so fixed elements (like mobile nav) 
    // work correctly with smooth scrolling
    document.documentElement.classList.add('lenis');

    return () => {
      document.documentElement.classList.remove('lenis');
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}