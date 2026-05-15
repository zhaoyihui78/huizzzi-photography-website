'use client';

import { useEffect, useRef } from 'react';

export default function GiscusComments() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data?.giscus?.resizeHeight && iframeRef.current) {
        iframeRef.current.style.height = `${event.data.giscus.resizeHeight}px`;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.href : '';
  const params = new URLSearchParams({
    origin,
    session: '',
    theme: 'https://cdn.jsdelivr.net/gh/zhaoyihui78/huizzzi-photography-website@main/public/giscus-theme.css',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'bottom',
    repo: 'zhaoyihui78/huizzzi-photography-website',
    repoId: 'R_kgDOSaa2rQ',
    category: 'General',
    categoryId: 'DIC_kwDOSaa2rc4C9CSF',
    strict: '0',
    term: 'guestbook/',
  });

  return (
    <div className="giscus w-full">
      <iframe
        ref={iframeRef}
        src={`https://giscus.app/zh-CN/widget?${params.toString()}`}
        className="giscus-frame"
        style={{ width: '100%', border: 'none', minHeight: '200px' }}
        title="Comments"
        allow="clipboard-write"
      />
    </div>
  );
}
