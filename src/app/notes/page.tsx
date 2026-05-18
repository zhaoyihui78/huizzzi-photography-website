import Link from 'next/link';
import Image from 'next/image';
import { getNotes } from '@/lib/notes';
import { getImageUrl } from '@/config/images';
import FadeIn from '@/components/FadeIn';

export const metadata = {
  title: '摄影手记 | HUI ZZZI',
  description: 'Photography notes, thoughts, and techniques.',
};

export default function NotesPage() {
  const allNotes = getNotes();
  const essays = allNotes.filter((note) => note.type !== 'glossary');
  const glossary = allNotes.filter((note) => note.type === 'glossary');

  return (
    <main className="min-h-full px-6 md:px-12 py-10 md:py-16 max-w-[1200px] mx-auto">
      {/* 高级感头部：收紧间距，强化中英排版 */}
      <FadeIn delay={0}>
        <header className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#f0f0f0] pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] md:text-[26px] font-light tracking-[0.1em] text-[#111111]">
              摄影手记
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#aaaaaa]">
              Field Notes & Observations
            </p>
          </div>
          <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#cccccc] flex items-center gap-4">
            <span>{essays.length} 篇手记</span>
            <span className="w-px h-3 bg-[#e0e0e0]" />
            <span>{glossary.length} 个术语</span>
          </div>
        </header>
      </FadeIn>

      {/* 长文区：紧凑的杂志图文排版 */}
      <section className="mb-24 md:mb-32 flex flex-col gap-20 md:gap-28">
        {essays.map((note, index) => {
          const isEven = index % 2 !== 0;
          return (
            <FadeIn key={note.slug} delay={0.1} direction="up">
              <article className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center group`}>
                
                {/* 封面图：限制最大宽度，不让图片过于巨大失控 */}
                <Link href={`/notes/${note.slug}`} className="w-full md:w-[55%] shrink-0 relative">
                  {/* 装饰性背景框，增加层次感 */}
                  <div className="absolute -inset-3 bg-[#fdfdfd] border border-[#f5f5f5] -z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#f9f9f9] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    {note.cover && (
                      <Image
                        src={getImageUrl(note.cover)}
                        alt={note.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 55vw"
                        unoptimized
                      />
                    )}
                  </div>
                </Link>

                {/* 文本区：紧贴图片，精致排版 */}
                <div className={`w-full md:w-[45%] flex flex-col justify-center ${isEven ? 'md:pr-8' : 'md:pl-8'}`}>
                  
                  {/* 顶栏元信息 */}
                  <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.25em] text-[#bbbbbb] mb-5">
                    <span className="text-[#888888]">{note.category}</span>
                    <span className="w-4 h-px bg-[#d0d0d0]" />
                    <span>{note.date.replace(/-/g, '.')}</span>
                  </div>
                  
                  {/* 标题 */}
                  <Link href={`/notes/${note.slug}`} className="block mb-4">
                    <h2 className="text-[19px] md:text-[22px] text-[#111111] font-light leading-[1.4] tracking-[0.03em] group-hover:text-[#777777] transition-colors duration-500">
                      {note.title}
                    </h2>
                  </Link>

                  {/* 摘要：缩小字号，增加行高，突出段落图形感 */}
                  <p className="text-[12px] md:text-[13px] text-[#888888] font-light leading-[2.2] mb-8 text-justify">
                    {note.excerpt}
                  </p>

                  {/* 阅读按钮：更考究的线条设计 */}
                  <Link
                    href={`/notes/${note.slug}`}
                    className="w-fit text-[9px] font-mono uppercase tracking-[0.25em] text-[#111111] flex items-center gap-4 hover:gap-6 transition-all duration-500 group/btn"
                  >
                    <span className="opacity-70 group-hover/btn:opacity-100 transition-opacity">Read</span>
                    <span className="w-8 h-[1px] bg-[#111111] origin-left scale-x-75 group-hover/btn:scale-x-100 transition-transform duration-500" />
                  </Link>
                </div>
              </article>
            </FadeIn>
          );
        })}
      </section>

      {/* 词条区：像展览画册的最后附录 */}
      {glossary.length > 0 && (
        <FadeIn delay={0.2}>
          <section className="pt-16 border-t border-[#f0f0f0]">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="text-[15px] font-light tracking-[0.1em] text-[#111111]">
                术语索引
              </h2>
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#aaaaaa]">
                Glossary & Appendix
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-2">
              {glossary.map((item) => (
                <Link
                  key={item.slug}
                  href={`/notes/${item.slug}`}
                  className="group flex items-baseline justify-between py-3 border-b border-[#f9f9f9] hover:border-[#e0e0e0] transition-colors duration-500"
                >
                  <h3 className="text-[13px] text-[#666666] font-light tracking-[0.05em] group-hover:text-[#111111] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <span className="font-mono text-[8px] text-[#dddddd] group-hover:text-[#aaaaaa] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    ↗
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </FadeIn>
      )}
    </main>
  );
}
