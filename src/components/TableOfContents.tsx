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
    // Query all h2 and h3 inside the article content
    const elements = Array.from(document.querySelectorAll('article h2, article h3'));
    
    const items: TocItem[] = elements.map((el, index) => {
      // Add id if it doesn't exist
      if (!el.id) {
        // Slugify the text content
        const text = el.textContent || '';
        const id = text.toLowerCase().replace(/[\s\W-]+/g, '-') || `heading-${index}`;
        el.id = id;
      }
      
      return {
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      };
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(items);

    // Set up IntersectionObserver to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -40% 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32">
      <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#aaaaaa] mb-6">
        Contents
      </h4>
      <nav className="flex flex-col gap-3">
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
              text-[12px] transition-colors duration-300
              ${heading.level === 3 ? 'ml-4' : ''}
              ${
                activeId === heading.id
                  ? 'text-[#111111] font-medium'
                  : 'text-[#999999] hover:text-[#111111]'
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
