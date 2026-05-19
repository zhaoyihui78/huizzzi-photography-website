'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// 因为 react-three-fiber 包含浏览器特有 API，需要动态导入，禁用 SSR
const AtlasCanvas = dynamic(() => import('@/components/atlas/AtlasCanvas'), { ssr: false });

export default function AtlasPage() {
  return (
    <main className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden text-white">
      
      {/* 顶部返回导航与标题 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-6 pointer-events-none">
        <Link 
          href="/"
          className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.2em] text-[#a89580] hover:text-[#d8c7a3] transition-colors"
        >
          ← Back to Home
        </Link>
        <div className="font-serif text-[13px] tracking-[0.3em] text-[#d8c7a3] opacity-60">
          MEMORY ATLAS
        </div>
      </div>

      {/* 右下角操作提示 */}
      <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#666666] text-right">
          Drag to explore <br/>
          Scroll to zoom
        </p>
      </div>

      <AtlasCanvas />
    </main>
  );
}