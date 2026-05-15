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
    // 使用 jsDelivr 托管 CSS，Giscus 服务器和 iframe 都能稳定加载
    script.setAttribute('data-theme', 'https://cdn.jsdelivr.net/gh/zhaoyihui78/huizzzi-photography-website@main/public/giscus-theme.css');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }, []);

  return <div ref={containerRef} className="giscus w-full" />;
}
