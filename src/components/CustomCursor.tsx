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
        className="custom-cursor fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
        data-hover="default"
        style={{
          width: 10,
          height: 10,
          border: '1px solid rgba(255,255,255,0.7)',
          transition: 'width 0.2s ease, height 0.2s ease, border-radius 0.2s ease',
          willChange: 'transform',
        }}
      >
        <span className="font-mono text-[7px] text-white tracking-[0.15em] uppercase opacity-0 transition-opacity duration-200"
          style={{ pointerEvents: 'none' }}
        >
          View
        </span>
      </div>
      <style jsx global>{`
        .custom-cursor[data-hover="view"] {
          width: 48px !important;
          height: 48px !important;
        }
        .custom-cursor[data-hover="view"] span {
          opacity: 1 !important;
        }
        .custom-cursor[data-hover="link"] {
          width: 6px !important;
          height: 6px !important;
          border-width: 0 !important;
          background: rgba(255,255,255,0.8) !important;
        }
        .custom-cursor[data-hover="link"] span {
          opacity: 0 !important;
        }
      `}</style>
    </>
  );
}
