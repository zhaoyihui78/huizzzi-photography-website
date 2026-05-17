import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoteBySlug, getNotes } from '@/lib/notes';
import { getImageUrl } from '@/config/images';
import FadeIn from '@/components/FadeIn';
import GlossaryLink from '@/components/GlossaryLink';
import NoteBackButton from '@/components/NoteBackButton';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import ArticleNavigation from '@/components/ArticleNavigation';

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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
  h2: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugifyHeading(text);
    return (
      <h2
        id={id}
        data-note-heading="2"
        className="scroll-mt-28 text-[19px] md:text-lg font-normal text-[#111111] mt-10 md:mt-12 mb-5 md:mb-6 tracking-[0.01em] md:tracking-wide"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugifyHeading(text);
    return (
      <h3
        id={id}
        data-note-heading="3"
        className="scroll-mt-28 text-[17px] md:text-base font-normal text-[#111111] mt-7 md:mt-8 mb-3.5 md:mb-4 tracking-[0.01em] md:tracking-wide"
        {...props}
      >
        {children}
      </h3>
    );
  },
  p: (props: any) => <p className="text-[15px] md:text-[14px] text-[#666666] leading-[2] md:leading-[2.2] mb-5 md:mb-6 font-light" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-[2px] border-[#e0e0e0] pl-4 md:pl-6 py-1 my-7 md:my-8 text-[13px] text-[#888888] italic tracking-wide" {...props} />
  ),
  strong: (props: any) => <strong className="font-normal text-[#333333]" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mb-5 md:mb-6 text-[15px] md:text-[14px] text-[#666666] leading-[2] md:leading-[2.2] font-light marker:text-[#cccccc]" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  img: ({ src = '', alt = '', ...props }: any) => (
    <img
      src={typeof src === 'string' ? getImageUrl(src) : src}
      alt={alt}
      loading="lazy"
      {...props}
    />
  ),
  Glossary: GlossaryLink,
};

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const note = getNoteBySlug(resolvedParams.slug);

  if (!note) {
    notFound();
  }

  const { metadata, content } = note;

  // Calculate prev/next notes (excluding glossary)
  const allNotes = getNotes().filter((n) => n.type !== 'glossary');
  const currentIndex = allNotes.findIndex((n) => n.slug === resolvedParams.slug);
  
  // Since allNotes is sorted by date descending (newest first):
  // "Previous" usually means newer (index - 1)
  // "Next" usually means older (index + 1)
  const prevNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const nextNote = currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  return (
    <>
      <ReadingProgress />
      <main className="min-h-full px-5 md:px-10 py-8 md:py-16 max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10 md:gap-12 lg:gap-24">
        {/* Left / Main Content */}
        <article className="flex-1 max-w-[720px] min-w-0">
          <FadeIn delay={0}>
            <NoteBackButton isGlossary={metadata.type === 'glossary'} />

            <header className="mb-10 md:mb-14">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-mono uppercase tracking-[0.16em] md:tracking-[0.2em] text-[#aaaaaa] mb-4 md:mb-5">
                <span>{metadata.type === 'glossary' ? 'Glossary' : metadata.category}</span>
                <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
                <span>{metadata.date.replace(/-/g, '.')}</span>
                <span className="w-1 h-1 rounded-full bg-[#e0e0e0]" />
                <span>{metadata.readingTime} read</span>
              </div>
              <h1 className="text-[24px] md:text-[26px] font-light text-[#111111] leading-[1.45] md:leading-snug tracking-[0.01em] md:tracking-wide mb-3 md:mb-4 text-balance">
                {metadata.title}
              </h1>
              {metadata.subtitle && (
                <p className="text-[14px] md:text-[14px] text-[#888888] font-light tracking-[0.01em] md:tracking-wide leading-[1.8] md:leading-relaxed max-w-[38rem]">
                  {metadata.subtitle}
                </p>
              )}

              {metadata.tags.length > 0 && (
                <div className="lg:hidden flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#f3f3f3]">
                  {metadata.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-[#666666] bg-[#f9f9f9] px-2.5 py-1 rounded-sm border border-[#f0f0f0]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {metadata.cover && metadata.type !== 'glossary' && (
              <div className="relative w-full aspect-[4/3] md:aspect-[3/2] mb-10 md:mb-16 bg-[#f9f9f9]">
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

            {metadata.type !== 'glossary' && (
              <ArticleNavigation prevNote={prevNote} nextNote={nextNote} />
            )}
          </FadeIn>
        </article>

        {/* Right / Sticky Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-24 pt-12 border-t border-[#f0f0f0]">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#cccccc] mb-6">
              Metadata
            </h3>
            <div className="flex flex-col gap-8">
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

              {metadata.type !== 'glossary' && (
                <div className="pt-8 border-t border-[#f0f0f0]">
                  <TableOfContents />
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
