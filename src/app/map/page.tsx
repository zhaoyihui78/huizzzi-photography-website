'use client';

import { useState } from 'react';
import FadeIn from '@/components/FadeIn';
import PhotoMap from '@/components/PhotoMap';
import MapLocationPanel from '@/components/MapLocationPanel';
import { type Location } from '@/data/locations';

export default function MapPage() {
  const [selected, setSelected] = useState<Location | null>(null);

  return (
    <main className="h-screen flex flex-col bg-white">
      {/* Header */}
      <section className="px-6 md:px-10 pt-14 pb-4 shrink-0">
        <FadeIn delay={0}>
          <h1 className="font-heading text-[15px] font-normal tracking-tight text-[#3a2a1a] mb-2">
            摄影地图
          </h1>
          <p className="font-mono text-[9px] text-[#a08060] tracking-[0.25em] uppercase">
            Photo Map · 北京拍摄机位
          </p>
        </FadeIn>
      </section>

      {/* Map */}
      <section className="flex-1 min-h-0 px-4 md:px-10 pb-4">
        <FadeIn delay={0.1}>
          <div className="w-full h-full border border-[#d6c8b0] relative shadow-sm">
            <PhotoMap onSelect={setSelected} />
          </div>
        </FadeIn>
      </section>

      {/* Detail Panel */}
      <MapLocationPanel
        location={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
