'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { beijingLocations, type Location } from '@/data/locations';

interface PhotoMapProps {
  onSelect: (location: Location) => void;
}

function BreathingDot({
  cx,
  cy,
  isHovered,
  label,
}: {
  cx: number;
  cy: number;
  isHovered: boolean;
  label: string;
}) {
  return (
    <g>
      {/* Invisible hit area */}
      <circle cx={cx} cy={cy} r={24} fill="transparent" />

      {/* Breathing outer ring */}
      {!isHovered && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={6}
          fill="none"
          stroke="#a08060"
          strokeWidth={0.8}
          animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.8, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Hover glow */}
      {isHovered && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={10}
          fill="none"
          stroke="#3a2a1a"
          strokeWidth={0.5}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.5, 2] }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      {/* Core dot */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={isHovered ? 5 : 3.5}
        fill={isHovered ? '#3a2a1a' : '#7a6a5a'}
        className="transition-colors duration-300"
      />

      {/* Label */}
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fill={isHovered ? '#3a2a1a' : '#7a6a5a'}
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="0.08em"
        opacity={isHovered ? 1 : 0.55}
        className="pointer-events-none"
      >
        {label}
      </text>
    </g>
  );
}

function VintageCompass() {
  return (
    <g transform="translate(920, 60)" opacity="0.2">
      <circle cx="0" cy="0" r="28" fill="none" stroke="#b8956a" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="24" fill="none" stroke="#b8956a" strokeWidth="0.3" strokeDasharray="2 3" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = Math.cos(angle) * 22;
        const y1 = Math.sin(angle) * 22;
        const x2 = Math.cos(angle) * 26;
        const y2 = Math.sin(angle) * 26;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b8956a" strokeWidth="0.5" />
        );
      })}
      <polygon points="0,-18 -3,8 0,5 3,8" fill="#b8956a" opacity="0.6" />
      <polygon points="0,18 -3,-5 0,-8 3,-5" fill="#b8956a" opacity="0.3" />
      <text x="0" y="-32" textAnchor="middle" fill="#b8956a" fontSize="8" fontFamily="monospace" letterSpacing="0.15em">
        N
      </text>
    </g>
  );
}

export default function PhotoMap({ onSelect }: PhotoMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const hoveredLocation = beijingLocations.find((l) => l.id === hoveredId);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setTransform((prev) => {
        const delta = -e.deltaY * 0.001;
        const nextScale = Math.min(Math.max(prev.scale + delta, 0.8), 4);
        return { ...prev, scale: nextScale };
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'circle' && (e.target as HTMLElement).getAttribute('fill') === 'transparent') return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: transform.x,
        ty: transform.y,
      };
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTransform((prev) => ({
        ...prev,
        x: dragStartRef.current.tx + dx,
        y: dragStartRef.current.ty + dy,
      }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          x: transform.x,
          y: transform.y,
          scale: transform.scale,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {/* Beijing map background — no default title text */}
          <image
            href="/maps/beijing-parchment.png"
            x="0"
            y="0"
            width="1000"
            height="1000"
            preserveAspectRatio="xMidYMid meet"
            opacity="0.7"
          />

          {/* Elegant map title overlay — fades out on zoom */}
          <g
            textAnchor="middle"
            style={{
              opacity: transform.scale <= 1.0 ? 1 : Math.max(0, 1 - (transform.scale - 1.0) / 0.5),
              transition: 'opacity 0.4s ease',
            }}
          >
            <text
              x="500"
              y="440"
              fill="#5c4a3a"
              fontSize="52"
              fontFamily="var(--font-heading), 'Noto Serif SC', 'Songti SC', serif"
              fontWeight="400"
              letterSpacing="0.35em"
              style={{ fontFamily: 'var(--font-heading), "Noto Serif SC", "Songti SC", serif' }}
            >
              北京
            </text>
            <line x1="430" y1="465" x2="570" y2="465" stroke="#a08060" strokeWidth="0.5" opacity="0.5" />
            <text
              x="500"
              y="490"
              fill="#7a6a5a"
              fontSize="12"
              fontFamily="var(--font-heading), 'Noto Serif SC', 'Songti SC', serif"
              letterSpacing="0.4em"
              style={{ fontFamily: 'var(--font-heading), "Noto Serif SC", "Songti SC", serif' }}
            >
              中国
            </text>
            <text
              x="500"
              y="515"
              fill="#a08060"
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="0.12em"
            >
              39.9057° N / 116.3913° E
            </text>
          </g>

          {/* Vintage compass */}
          <VintageCompass />

          {/* Location markers */}
          {beijingLocations.map((loc, index) => {
            const isHovered = hoveredId === loc.id;
            return (
              <motion.g
                key={loc.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.8 + index * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                onMouseEnter={() => setHoveredId(loc.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(loc);
                }}
                className="cursor-pointer"
              >
                <BreathingDot
                  cx={loc.x}
                  cy={loc.y}
                  isHovered={isHovered}
                  label={loc.name}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      {/* Postcard hover card */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 15, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            exit={{ opacity: 0, y: 15, rotate: -2 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-6 right-6 bg-white p-2 pb-3 shadow-2xl pointer-events-none z-20"
            style={{
              width: '168px',
              boxShadow: '3px 6px 20px rgba(60,40,20,0.18)',
            }}
          >
            {/* Red airmail dot */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#c44]" />
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e0d0] mb-2">
              <Image
                src={hoveredLocation.cover}
                alt={hoveredLocation.name}
                fill
                className="object-cover"
                sizes="168px"
              />
            </div>
            <p className="font-mono text-[10px] text-[#3a2a1a] tracking-wide text-center">
              {hoveredLocation.name}
            </p>
            {hoveredLocation.subtitle && (
              <p className="font-mono text-[8px] text-[#a08060] tracking-wider text-center mt-0.5">
                {hoveredLocation.subtitle}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-20 bg-white/90 border border-[#d6c8b0] px-3 py-2.5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="3.5" fill="#7a6a5a" />
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="#a08060" strokeWidth="0.8" opacity="0.5" />
          </svg>
          <span className="font-mono text-[8px] text-[#7a6a5a] tracking-[0.1em]">Video</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="3.5" fill="#7a6a5a" />
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="#a08060" strokeWidth="0.8" opacity="0.5" />
            <polygon points="10,3 11.5,3 11.5,4 10,4" fill="#c9a96e" />
          </svg>
          <span className="font-mono text-[8px] text-[#7a6a5a] tracking-[0.1em]">Photo</span>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#a08060] tracking-[0.15em] pointer-events-none z-20">
        滚动缩放 · 拖拽平移 · 点击标记
      </div>
    </div>
  );
}
