'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    x: -100,
    y: -100,
    hover: 'default' as 'default' | 'view' | 'link',
    visible: false,
  });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId: number;

    const update = () => {
      const s = stateRef.current;
      if (cursor) {
        cursor.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`;
        cursor.dataset.hover = s.hover;
        cursor.style.opacity = s.visible ? '1' : '0';
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    const onMove = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
      stateRef.current.visible = true;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        stateRef.current.hover = 'link';
      } else if (target.closest('.cursor-pointer') || target.closest('[data-cursor="view"]')) {
        stateRef.current.hover = 'view';
      } else {
        stateRef.current.hover = 'default';
      }
    };

    const onLeave = () => {
      stateRef.current.visible = false;
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        * { cursor: none !important; }
        @media (pointer: coarse) {
          * { cursor: auto !important; }
          .custom-cursor { display: none !important; }
        }
      `}</style>
      <div
        ref={cursorRef}
        className="custom-cursor fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center transition-[width,height,border,background,opacity] duration-300 ease-out"
        data-hover="default"
        style={{
          width: 14,
          height: 14,
          backgroundColor: '#ffffff',
          willChange: 'transform',
        }}
      >
        <span className="font-mono text-[7px] text-[#0a0a0a] tracking-[0.15em] uppercase opacity-0 transition-opacity duration-300 font-medium scale-90"
          style={{ pointerEvents: 'none' }}
        >
          View
        </span>
      </div>
      <style jsx global>{`
        .custom-cursor[data-hover="view"] {
          width: 56px !important;
          height: 56px !important;
          background-color: #ffffff !important;
          border: none !important;
          mix-blend-mode: normal !important;
        }
        .custom-cursor[data-hover="view"] span {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
        .custom-cursor[data-hover="link"] {
          width: 48px !important;
          height: 48px !important;
          background-color: transparent !important;
          border: 1px solid rgba(255,255,255,0.4) !important;
          mix-blend-mode: difference !important;
        }
        .custom-cursor[data-hover="link"] span {
          opacity: 0 !important;
        }
      `}</style>
    </>
  );
}
