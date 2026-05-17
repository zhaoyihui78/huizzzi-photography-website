'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NoteBackButton({ isGlossary }: { isGlossary: boolean }) {
  const router = useRouter();

  if (isGlossary) {
    return (
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[#aaaaaa] hover:text-[#111111] transition-colors mb-12"
      >
        <span>← Back to Article</span>
      </button>
    );
  }

  return (
    <Link 
      href="/notes" 
      className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[#aaaaaa] hover:text-[#111111] transition-colors mb-12"
    >
      <span>← Back to Notes</span>
    </Link>
  );
}
