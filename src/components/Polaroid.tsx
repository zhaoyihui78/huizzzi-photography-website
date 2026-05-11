import Image from 'next/image';

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  rotation?: number;
}

export default function Polaroid({ src, alt, caption, className = '', rotation = 0 }: PolaroidProps) {
  return (
    <div
      className={`bg-white p-3 pb-16 shadow-md inline-block ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="relative overflow-hidden bg-gray-100">
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          className="w-full h-auto object-cover"
          unoptimized
        />
      </div>
      {caption && (
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <span className="text-sm text-gray-700 font-handwriting" style={{ fontFamily: "'Courier New', cursive" }}>
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}
