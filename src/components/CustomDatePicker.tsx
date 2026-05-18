'use client';

import { useEffect, useRef, useState } from 'react';

interface CustomDatePickerProps {
  value: string; // ISO string
  onChange: (val: string) => void;
  onClose: () => void;
}

export default function CustomDatePicker({ value, onChange, onClose }: CustomDatePickerProps) {
  const [date, setDate] = useState(() => value ? new Date(value) : new Date());
  const [viewMonth, setViewMonth] = useState(() => value ? new Date(value) : new Date());
  const panelRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(viewMonth.getFullYear());
    newDate.setMonth(viewMonth.getMonth());
    newDate.setDate(day);
    if (newDate < new Date()) return; // Prevent past dates
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: 'h' | 'm', val: string) => {
    const num = parseInt(val, 10) || 0;
    const newDate = new Date(date);
    if (type === 'h') newDate.setHours(num);
    if (type === 'm') newDate.setMinutes(num);
    if (newDate < new Date()) return;
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!panelRef.current) return;
      const target = event.target;
      if (target instanceof Node && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [onClose]);

  return (
    <div ref={panelRef} className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-sm border border-[#e5d8c8] bg-[#fdfcf9] p-4 text-[#4f4033] shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-[#a89580] hover:text-[#4f4033] px-2 py-1">←</button>
        <span className="font-serif text-[15px] tracking-widest">{viewMonth.getFullYear()}年 {viewMonth.getMonth() + 1}月</span>
        <button onClick={nextMonth} className="text-[#a89580] hover:text-[#4f4033] px-2 py-1">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <span key={d} className="font-mono text-[10px] text-[#baa48a] py-1">{d}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = date.getDate() === day && date.getMonth() === viewMonth.getMonth() && date.getFullYear() === viewMonth.getFullYear();
          const iterDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, 23, 59, 59);
          const isPast = iterDate < new Date();
          
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isPast}
              className={`py-1.5 text-[13px] font-mono rounded-sm transition-colors ${
                isSelected ? 'bg-[#d9c0a1] text-white' : 
                isPast ? 'text-[#d0c2b2] cursor-not-allowed' : 'hover:bg-[#f2ebe0]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-[#f2ebe0]">
        <input 
          type="number" 
          min="0" max="23" 
          value={String(date.getHours()).padStart(2, '0')}
          onChange={(e) => handleTimeChange('h', e.target.value)}
          className="w-12 bg-transparent border-b border-[#d9c0a1] text-center font-mono text-[14px] focus:outline-none"
        />
        <span>:</span>
        <input 
          type="number" 
          min="0" max="59" 
          value={String(date.getMinutes()).padStart(2, '0')}
          onChange={(e) => handleTimeChange('m', e.target.value)}
          className="w-12 bg-transparent border-b border-[#d9c0a1] text-center font-mono text-[14px] focus:outline-none"
        />
      </div>

      <div className="flex justify-between mt-4 pt-2">
        <button onClick={() => { onChange(''); onClose(); }} className="text-[10px] font-mono text-[#a89580] hover:text-[#4f4033] uppercase tracking-wider">Clear</button>
        <button onClick={onClose} className="text-[10px] font-mono text-[#d9c0a1] hover:text-[#c89c54] uppercase tracking-wider">Done</button>
      </div>
    </div>
  );
}
