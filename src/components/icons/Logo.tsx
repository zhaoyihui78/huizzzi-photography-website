'use client';

interface LogoProps {
  className?: string;
  color?: string;
}

export default function Logo({ className = '', color = 'currentColor' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HZ"
    >
      <g fill={color}>
        {/* H left vertical stroke */}
        <path d="M28 18 L28 122 L38 122 L38 74 L82 74 L82 122 L92 122 L92 18 L82 18 L82 66 L38 66 L38 18 Z" />
        {/* H top left serif */}
        <path d="M18 18 L42 18 L40 22 L20 22 Z" />
        {/* H top right serif */}
        <path d="M78 18 L102 18 L100 22 L80 22 Z" />
        {/* H bottom left serif */}
        <path d="M18 118 L42 118 L40 122 L20 122 Z" />
        {/* H bottom right serif */}
        <path d="M78 118 L102 118 L100 122 L80 122 Z" />

        {/* Z body */}
        <path d="M82 66 L82 74 L158 74 L108 122 L162 122 L162 114 L124 114 L174 66 L174 58 L92 58 L92 66 Z" />
        {/* Z top left serif */}
        <path d="M80 58 L104 58 L102 62 L82 62 Z" />
        {/* Z bottom right serif */}
        <path d="M160 118 L184 118 L182 122 L162 122 Z" />
      </g>
    </svg>
  );
}
