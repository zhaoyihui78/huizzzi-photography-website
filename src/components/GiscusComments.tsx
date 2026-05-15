'use client';

import Giscus from '@giscus/react';

export default function GiscusComments() {
  return (
    <div className="giscus w-full">
      <Giscus
        repo="zhaoyihui78/huizzzi-photography-website"
        repoId="R_kgDOSaa2rQ"
        category="General"
        categoryId="DIC_kwDOSaa2rc4C9CSF"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="https://cdn.jsdelivr.net/gh/zhaoyihui78/huizzzi-photography-website@main/public/giscus-theme.css"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
