'use client';

import Giscus from '@giscus/react';

export default function GiscusComments() {
  const themeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.huizzzi.art';

  return (
    <div className="giscus w-full" style={{ minHeight: '500px' }}>
      <Giscus
        repo="zhaoyihui78/huizzzi-photography-website"
        repoId="R_kgDOSaa2rQ"
        category="General"
        categoryId="DIC_kwDOSaa2rc4C9CSF"
        mapping="specific"
        term="guestbook/"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={`${themeOrigin}/giscus-theme.css`}
        lang="zh-CN"
        loading="eager"
      />
    </div>
  );
}
