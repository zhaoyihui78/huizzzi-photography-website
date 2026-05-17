'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { meetings as initialMeetings, photos, cnNumerals } from '../data';

export default function EditPage() {
  const [assignments, setAssignments] = useState<Record<number, string[]>>(() => {
    const map: Record<number, string[]> = {};
    for (const m of initialMeetings) {
      map[m.nth] = [...m.photoNums];
    }
    return map;
  });
  const [draggedNum, setDraggedNum] = useState<string | null>(null);
  const [dragOverNth, setDragOverNth] = useState<number | null>(null);
  const [names, setNames] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const m of initialMeetings) {
      map[m.nth] = m.name || '';
    }
    return map;
  });
  const [editingNth, setEditingNth] = useState<number | null>(null);

  const movePhoto = useCallback((num: string, targetNth: number) => {
    setAssignments((prev) => {
      const next: Record<number, string[]> = {};
      for (const nth of Object.keys(prev).map(Number)) {
        const list = prev[nth].filter((n) => n !== num);
        next[nth] = list;
      }
      next[targetNth] = [...next[targetNth], num];
      // Sort by photo num
      next[targetNth].sort((a, b) => parseInt(a) - parseInt(b));
      return next;
    });
  }, []);

  const exportConfig = useCallback(() => {
    const config = initialMeetings.map((m) => {
      const obj: Record<string, unknown> = {
        nth: m.nth,
        daysAgo: m.daysAgo,
        date: m.date,
        photoNums: assignments[m.nth] || [],
      };
      if (names[m.nth]?.trim()) {
        obj.name = names[m.nth].trim();
      }
      return obj;
    });
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'we-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [assignments, names]);

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-heading text-xl font-light tracking-wide text-stone-800">
              照片分组编辑器
            </h1>
            <p className="text-[11px] text-stone-400 mt-1">
              拖拽照片到不同的见面区块中，调整完成后导出配置
            </p>
          </div>
          <button
            onClick={exportConfig}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-lg text-sm tracking-wide hover:bg-stone-700 transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出配置
          </button>
        </div>

        <div className="space-y-4">
          {initialMeetings.map((meeting, mi) => {
            const nums = assignments[meeting.nth] || [];
            const isOver = dragOverNth === meeting.nth;
            return (
              <motion.div
                key={meeting.nth}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mi * 0.03 }}
                className={`rounded-xl border transition-colors duration-200 ${
                  isOver
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverNth(meeting.nth);
                }}
                onDragLeave={() => setDragOverNth(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverNth(null);
                  if (draggedNum) {
                    movePhoto(draggedNum, meeting.nth);
                    setDraggedNum(null);
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isOver ? 'bg-amber-400' : 'bg-stone-300'}`} />
                    {editingNth === meeting.nth ? (
                      <input
                        autoFocus
                        type="text"
                        value={names[meeting.nth] || ''}
                        onChange={(e) => setNames((prev) => ({ ...prev, [meeting.nth]: e.target.value }))}
                        onBlur={() => setEditingNth(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingNth(null);
                        }}
                        placeholder={`第${cnNumerals[meeting.nth - 1]}次见面`}
                        className="font-heading text-[15px] font-light tracking-wide bg-transparent border-b border-stone-300 focus:border-stone-500 focus:outline-none px-0 py-0.5 w-48"
                        style={{ color: '#5c4a3a' }}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingNth(meeting.nth)}
                        className="font-heading text-[15px] font-light tracking-wide hover:opacity-70 transition-opacity"
                        style={{ color: '#5c4a3a' }}
                      >
                        {names[meeting.nth]?.trim() || `第${cnNumerals[meeting.nth - 1]}次见面`}
                      </button>
                    )}
                    <span className="text-[10px] text-stone-400 font-mono">
                      {meeting.date}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono bg-white border border-stone-200 rounded-full px-2 py-0.5">
                    {nums.length} 张
                  </span>
                </div>

                {/* Photos */}
                <div className="p-3 flex flex-wrap gap-2 min-h-[60px]">
                  {nums.map((num) => {
                    const photo = photos.find((p) => p.num === num)!;
                    return (
                      <div
                        key={num}
                        draggable
                        onDragStart={() => setDraggedNum(num)}
                        onDragEnd={() => setDraggedNum(null)}
                        className="relative group cursor-grab active:cursor-grabbing"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-sm group-hover:shadow-md group-hover:border-stone-300 transition-all">
                          <Image
                            src={photo.thumb}
                            alt={num}
                            width={photo.width}
                            height={photo.height}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-stone-400 font-mono bg-white px-1 rounded">
                          {num}
                        </span>
                      </div>
                    );
                  })}
                  {nums.length === 0 && (
                    <p className="text-[11px] text-stone-300 italic py-2">拖拽照片到此处</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating export button (mobile) */}
      <button
        onClick={exportConfig}
        className="fixed bottom-6 right-6 w-12 h-12 bg-stone-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-700 transition-colors md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </main>
  );
}
