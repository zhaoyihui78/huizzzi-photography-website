import Image from 'next/image';

interface FilmFrameProps {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  rotation?: number;
  onClick?: () => void;
}

export default function FilmFrame({ src, alt, label = 'KODAK PORTRA 400', className = '', rotation = 0, onClick }: FilmFrameProps) {
  return (
    <div className={`relative ${className}`} style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }} onClick={onClick}>
      <div className="relative bg-[#121212] p-[12px] pb-[48px] shadow-xl">
        {/* Top sprocket holes */}
        <div className="absolute top-[16px] left-[12px] right-[12px] flex justify-between pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={`top-${i}`} className="w-[5px] h-[3px] bg-[#2a2a2a] rounded-[1px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
          ))}
        </div>

        {/* Bottom sprocket holes */}
        <div className="absolute bottom-[16px] left-[12px] right-[12px] flex justify-between pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={`bottom-${i}`} className="w-[5px] h-[3px] bg-[#2a2a2a] rounded-[1px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
          ))}
        </div>

        <div className="relative overflow-hidden bg-black">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
            unoptimized
          />
        </div>

        {/* Frame number */}
        <div className="absolute bottom-[16px] left-[18px] font-mono text-[8px] text-[#b8a060] tracking-[0.15em] opacity-60">
          47
        </div>
        <div className="absolute bottom-[16px] right-[18px] font-mono text-[8px] text-[#b8a060] tracking-[0.15em] opacity-60">
          48
        </div>

        {/* Edge line simulation */}
        <div className="absolute bottom-[38px] left-[12px] right-[12px] h-px bg-[#2a2a2a] opacity-50" />
      </div>

      {/* Film label */}
      <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 bg-[#121212] px-4 py-[3px]">
        <span className="font-mono text-[8px] text-[#b8a060] tracking-[0.25em] whitespace-nowrap uppercase">
          {label}
        </span>
      </div>

      {/* Subtle shadow underneath */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/5 blur-lg rounded-full -z-10" />
    </div>
  );
}
