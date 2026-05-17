import Link from 'next/link';
import { NoteMetadata } from '@/lib/notes';

interface ArticleNavigationProps {
  prevNote: NoteMetadata | null;
  nextNote: NoteMetadata | null;
}

export default function ArticleNavigation({ prevNote, nextNote }: ArticleNavigationProps) {
  if (!prevNote && !nextNote) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#f0f0f0] pt-12 md:pt-16 mt-16 md:mt-24">
      <div>
        {prevNote && (
          <Link href={`/notes/${prevNote.slug}`} className="group block">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#aaaaaa] block mb-3">
              ← Newer
            </span>
            <span className="block text-[15px] md:text-base text-[#111111] font-normal transition-colors group-hover:text-[#666666]">
              {prevNote.title}
            </span>
          </Link>
        )}
      </div>
      <div className="md:text-right">
        {nextNote && (
          <Link href={`/notes/${nextNote.slug}`} className="group block">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#aaaaaa] block mb-3">
              Older →
            </span>
            <span className="block text-[15px] md:text-base text-[#111111] font-normal transition-colors group-hover:text-[#666666]">
              {nextNote.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
