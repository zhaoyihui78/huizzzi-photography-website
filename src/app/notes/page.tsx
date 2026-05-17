import Link from 'next/link';
import Image from 'next/image';
import { getNotes } from '@/lib/notes';
import { getImageUrl } from '@/config/images';
import FadeIn from '@/components/FadeIn';

export const metadata = {
  title: 'Field Notes | HUI ZZZI',
  description: 'Photography notes, thoughts, and techniques.',
};

export default function NotesPage() {
  const allNotes = getNotes();
  // Filter out glossary entries from the main list
  const notes = allNotes.filter(note => note.type !== 'glossary');

  return (
    <main className="min-h-full px-6 md:px-10 py-10 md:py-14 max-w-[1400px] mx-auto">
      <FadeIn delay={0}>
        <div className="mb-16">
          <h1 className="font-heading text-[15px] font-normal tracking-[0.2em] text-[#111111] uppercase mb-3">
            Field Notes
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#888888]">
            摄影手记 / Thoughts & Techniques
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {notes.map((note, index) => (
          <FadeIn key={note.slug} delay={index * 0.1}>
            <Link href={`/notes/${note.slug}`} className="group flex flex-col gap-5 block h-full">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f9f9f9] border border-[#f0f0f0]">
                {note.cover && (
                  <Image
                    src={getImageUrl(note.cover)}
                    alt={note.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[#aaaaaa]">
                  <span>{note.category}</span>
                  <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
                  <span>{note.date.replace(/-/g, '.')}</span>
                </div>
                <h2 className="text-[15px] text-[#111111] font-light leading-snug tracking-wide group-hover:underline underline-offset-4 decoration-[#e0e0e0] transition-all">
                  {note.title}
                </h2>
                <p className="text-[12px] text-[#888888] leading-relaxed line-clamp-2 mt-1">
                  {note.excerpt}
                </p>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </main>
  );
}
