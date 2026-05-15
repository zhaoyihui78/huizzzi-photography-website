'use client';

import { useEffect, useRef, useState } from 'react';

export default function GiscusComments() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [session, setSession] = useState('');

  // Mirror @giscus/react session handling so OAuth callbacks work
  useEffect(() => {
    const url = new URL(window.location.href);
    const giscusSession = url.searchParams.get('giscus');
    if (giscusSession) {
      localStorage.setItem('giscus-session', JSON.stringify(giscusSession));
      setSession(giscusSession);
      url.searchParams.delete('giscus');
      url.hash = '';
      history.replaceState(undefined, document.title, url.toString());
    } else {
      try {
        const raw = localStorage.getItem('giscus-session');
        if (raw) setSession(JSON.parse(raw));
      } catch {
        localStorage.removeItem('giscus-session');
      }
    }
  }, []);

  // Debounced resize to avoid layout thrashing while typing
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data?.giscus?.resizeHeight && iframeRef.current) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.style.height = `${event.data.giscus.resizeHeight}px`;
          }
        }, 150);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(timeout);
    };
  }, []);

  const themeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.huizzzi.art';
  const params = new URLSearchParams({
    origin: typeof window !== 'undefined' ? window.location.href : '',
    session,
    theme: `${themeOrigin}/giscus-theme.css`,
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
        style={{ width: '100%', border: 'none', minHeight: '500px' }}
        title="Comments"
        allow="clipboard-write"
      />
    </div>
  );
}
