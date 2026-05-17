'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    let frameId = 0;
    let elements: HTMLElement[] = [];

    const collectHeadings = () => {
      elements = Array.from(
        document.querySelectorAll<HTMLElement>('.prose-custom [data-note-heading]')
      );
      const items: TocItem[] = elements.map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: Number(el.dataset.noteHeading) || 2,
      }));

      setHeadings(items);
      return elements;
    };

    const updateActiveHeading = (elements: HTMLElement[]) => {
      if (elements.length === 0) return;

      const offset = 140;
      let current = elements[0].id;

      for (const element of elements) {
        if (element.getBoundingClientRect().top - offset <= 0) {
          current = element.id;
        } else {
          break;
        }
      }

      setActiveId(current);
    };

    const handleScroll = () => updateActiveHeading(elements);

    frameId = window.requestAnimationFrame(() => {
      collectHeadings();
      updateActiveHeading(elements);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32">
      <h4 className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#b19a5f] mb-6">
        Contents
      </h4>
      <nav className="flex flex-col gap-2.5">
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(heading.id);
              if (el) {
                // Smooth scroll to the element with a little offset
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className={`
              group relative block border-l transition-all duration-300
              ${heading.level === 3 ? 'ml-4 pl-4 py-1.5 text-[11px] border-transparent' : 'pl-4 py-2 text-[12px] border-transparent'}
              ${
                activeId === heading.id
                  ? 'text-[#111111] border-[#b19a5f]'
                  : 'text-[#999999] hover:text-[#111111] hover:border-[#d7c79f]'
              }
            `}
          >
            {heading.text}
          </Link>
        ))}
      </nav>
    </div>
  );
}
