import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoteBySlug, getNotes } from '@/lib/notes';
import { getImageUrl } from '@/config/images';
import FadeIn from '@/components/FadeIn';
import GlossaryLink from '@/components/GlossaryLink';

export async function generateStaticParams() {
  const notes = getNotes();
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const note = getNoteBySlug(resolvedParams.slug);
  if (!note) return {};
  return {
    title: `${note.metadata.title} | Field Notes | HUI ZZZI`,
    description: note.metadata.excerpt,
  };
}

const components = {
  h2: (props: any) => <h2 className="text-lg font-normal text-[#111111] mt-12 mb-6 tracking-wide" {...props} />,
  h3: (props: any) => <h3 className="text-base font-normal text-[#111111] mt-8 mb-4 tracking-wide" {...props} />,
  p: (props: any) => <p className="text-[14px] text-[#666666] leading-[2.2] mb-6 font-light" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-[2px] border-[#e0e0e0] pl-6 py-1 my-8 text-[13px] text-[#888888] italic tracking-wide" {...props} />
  ),
  strong: (props: any) => <strong className="font-normal text-[#333333]" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mb-6 text-[14px] text-[#666666] leading-[2.2] font-light marker:text-[#cccccc]" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  Glossary: GlossaryLink,
};

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const note = getNoteBySlug(resolvedParams.slug);

  if (!note) {
    notFound();
  }

  const { metadata, content } = note;

  return (
    <main className="min-h-full px-6 md:px-10 py-10 md:py-16 max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
      {/* Left / Main Content */}
      <article className="flex-1 max-w-[720px]">
        <FadeIn delay={0}>
          <Link href="/notes" className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] text-[#aaaaaa] hover:text-[#111111] transition-colors mb-12">
            <span>← Back to Notes</span>
          </Link>
          
          <header className="mb-14">
            <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[#aaaaaa] mb-5">
              <span>{metadata.type === 'glossary' ? 'Glossary' : metadata.category}</span>
              <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
              <span>{metadata.date.replace(/-/g, '.')}</span>
              <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
              <span>{metadata.readingTime} read</span>
            </div>
            <h1 className="text-[22px] md:text-[26px] font-light text-[#111111] leading-snug tracking-wide mb-4">
              {metadata.title}
            </h1>
            {metadata.subtitle && (
              <p className="text-[14px] text-[#888888] font-light tracking-wide">
                {metadata.subtitle}
              </p>
            )}
          </header>

          {metadata.cover && metadata.type !== 'glossary' && (
            <div className="relative w-full aspect-[3/2] mb-16 bg-[#f9f9f9]">
              <Image
                src={getImageUrl(metadata.cover)}
                alt={metadata.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 720px"
                unoptimized
                priority
              />
            </div>
          )}

          <div className="prose-custom">
            <MDXRemote source={content} components={components} />
          </div>
        </FadeIn>
      </article>

      {/* Right / Sticky Sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0">
        <div className="sticky top-24 pt-12 border-t border-[#f0f0f0]">
          <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#cccccc] mb-6">
            Metadata
          </h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="block text-[10px] text-[#aaaaaa] mb-1">Tags</span>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span key={tag} className="text-[11px] text-[#666666] bg-[#f9f9f9] px-2.5 py-1 rounded-sm border border-[#f0f0f0]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
