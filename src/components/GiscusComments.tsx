'use client';

import { useEffect, useRef } from 'react';

export default function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'zhaoyihui78/huizzzi-photography-website');
    script.setAttribute('data-repo-id', 'R_kgDOSaa2rQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOSaa2rc4C9CSF');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    // Giscus 服务器需要能抓取到的绝对 URL，data URI 无法被服务端抓取
    const themeUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/giscus-theme.css`
      : 'https://huizzzi.com/giscus-theme.css';
    script.setAttribute('data-theme', themeUrl);
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }, []);

  return <div ref={containerRef} className="giscus w-full" />;
}
