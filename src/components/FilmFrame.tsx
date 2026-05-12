import Image from 'next/image';

interface FilmFrameProps {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  dimmed?: boolean;
  highlighted?: boolean;
  frameStyle?: 'thick' | 'thin' | 'standard';
  onClick?: () => void;
}

export default function FilmFrame({
  src,
  alt,
  label = 'KODAK PORTRA 400',
  className = '',
  dimmed = false,
  highlighted = false,
  frameStyle = 'standard',
  onClick,
}: FilmFrameProps) {
  const framePadding = {
    thick: 'p-[6px] pb-[24px]',
    thin: 'p-[2px] pb-[14px]',
    standard: 'p-[4px] pb-[20px]',
  };

  const frameShadow = {
    thick: 'shadow-2xl',
    thin: 'shadow-sm',
    standard: 'shadow-lg',
  };

  const sprocketCount = frameStyle === 'thin' ? 16 : 24;
  const sprocketSize = frameStyle === 'thin' ? 'w-[2px] h-[1.5px]' : 'w-[3px] h-[2px]';
  const holeOffset = frameStyle === 'thin' ? '4px' : '4px';
  const holeTop = frameStyle === 'thin' ? '4px' : '6px';
  const holeBottom = frameStyle === 'thin' ? '4px' : '6px';
  const labelY = frameStyle === 'thin' ? '-3px' : '-4px';
  const labelTextSize = frameStyle === 'thin' ? 'text-[5px]' : 'text-[6px]';
  const numberTextSize = frameStyle === 'thin' ? 'text-[5px]' : 'text-[6px]';
  const numberOpacity = frameStyle === 'thin' ? 'opacity-30' : 'opacity-40';
  const numberBottom = frameStyle === 'thin' ? '4px' : '6px';
  const numberLeft = frameStyle === 'thin' ? '6px' : '10px';
  const numberRight = frameStyle === 'thin' ? '6px' : '10px';
  const edgeBottom = frameStyle === 'thin' ? '12px' : '16px';

  return (
    <div
      className={`relative cursor-pointer group transition-all duration-700 ease-out ${
        dimmed
          ? 'brightness-[0.4] saturate-[0.5] scale-[0.98]'
          : highlighted
          ? 'brightness-110 scale-[1.02] z-10'
          : 'brightness-[0.88] saturate-[0.92]'
      } ${className}`}
      onClick={onClick}
    >
      <div
        className={`relative bg-[#1a1a1a] ${framePadding[frameStyle]} ${frameShadow[frameStyle]} transition-all duration-700`}
      >
        {/* Top sprocket holes */}
        <div
          className="absolute flex justify-between pointer-events-none"
          style={{ top: holeTop, left: holeOffset, right: holeOffset }}
        >
          {Array.from({ length: sprocketCount }).map((_, i) => (
            <div key={`top-${i}`} className={`${sprocketSize} bg-[#333333]`} />
          ))}
        </div>

        {/* Bottom sprocket holes */}
        <div
          className="absolute flex justify-between pointer-events-none"
          style={{ bottom: holeBottom, left: holeOffset, right: holeOffset }}
        >
          {Array.from({ length: sprocketCount }).map((_, i) => (
            <div key={`bottom-${i}`} className={`${sprocketSize} bg-[#333333]`} />
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
        <div
          className={`absolute font-mono ${numberTextSize} text-[#b8a060] tracking-[0.15em] ${numberOpacity}`}
          style={{ bottom: numberBottom, left: numberLeft }}
        >
          47
        </div>
        <div
          className={`absolute font-mono ${numberTextSize} text-[#b8a060] tracking-[0.15em] ${numberOpacity}`}
          style={{ bottom: numberBottom, right: numberRight }}
        >
          48
        </div>

        {/* Edge line simulation */}
        <div
          className="absolute left-[4px] right-[4px] h-px bg-[#333333] opacity-30"
          style={{ bottom: edgeBottom }}
        />
      </div>

      {/* Film label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-2 py-[1px]"
        style={{ top: labelY }}
      >
        <span
          className={`font-mono ${labelTextSize} tracking-[0.25em] whitespace-nowrap uppercase transition-colors duration-700 ${
            highlighted ? 'text-[#e8d088]' : 'text-[#b8a060]'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
