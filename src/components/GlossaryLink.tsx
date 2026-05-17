'use client';

import Link from 'next/link';

interface GlossaryLinkProps {
  term: string;
  slug: string;
  description?: string;
}

export default function GlossaryLink({ term, slug, description }: GlossaryLinkProps) {
  return (
    <Link
      href={`/notes/${slug}`}
      className="relative inline-block font-normal text-[#111111] group"
    >
      <span className="relative z-10">{term}</span>
      <span className="absolute left-0 right-0 bottom-[2px] h-[4px] bg-[#e0e0e0] -z-10 transition-all duration-300 group-hover:h-full group-hover:bg-[#f0f0f0]" />
      
      {/* Popover / Tooltip hint */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[240px] bg-[#111111] text-white text-[12px] font-light leading-relaxed px-4 py-3 rounded-sm opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-50 shadow-xl">
        <span className="block font-medium mb-1">{term} ↗</span>
        {description && <span className="block text-[#cccccc] text-[11px] whitespace-normal text-left">{description}</span>}
      </span>
    </Link>
  );
}
