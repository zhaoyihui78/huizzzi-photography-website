'use client';

import Link from 'next/link';

interface GlossaryLinkProps {
  term: string;
  slug: string;
}

export default function GlossaryLink({ term, slug }: GlossaryLinkProps) {
  return (
    <Link
      href={`/notes/${slug}`}
      className="relative inline-block font-normal text-[#111111] group"
    >
      <span className="relative z-10">{term}</span>
      <span className="absolute left-0 right-0 bottom-[2px] h-[4px] bg-[#e0e0e0] -z-10 transition-all duration-300 group-hover:h-full group-hover:bg-[#f0f0f0]" />
      
      {/* Popover / Tooltip hint */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-[#111111] text-white text-[11px] font-mono tracking-wider px-3 py-2 rounded-sm opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-50">
        Glossary Entry ↗
      </span>
    </Link>
  );
}
