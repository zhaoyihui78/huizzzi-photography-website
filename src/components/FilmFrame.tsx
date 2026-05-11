import Image from 'next/image';

interface FilmFrameProps {
  src: string;
  alt: string;
  label?: string;
  className?: string;
}

export default function FilmFrame({ src, alt, label = 'KODAK PORTRA 400', className = '' }: FilmFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-[#1a1a1a] p-[10px] pb-[42px] rounded-[2px]">
        {/* Sprocket holes */}
        <div className="absolute top-[14px] left-0 right-0 flex justify-between px-1 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-[6px] h-[4px] bg-[#2a2a2a] rounded-[1px]" />
          ))}
        </div>
        <div className="absolute bottom-[14px] left-0 right-0 flex justify-between px-1 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-[6px] h-[4px] bg-[#2a2a2a] rounded-[1px]" />
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

        {/* Frame number simulation */}
        <div className="absolute bottom-[14px] left-[14px] text-[8px] text-[#d4af37] font-mono tracking-wider">
          47
        </div>
        <div className="absolute bottom-[14px] right-[14px] text-[8px] text-[#d4af37] font-mono tracking-wider">
          48
        </div>
      </div>

      {/* Film label */}
      <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-3 py-[2px]">
        <span className="text-[9px] text-[#d4af37] font-mono tracking-[0.2em] whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}
