
import React, { useState, useEffect } from 'react';
import { CountdownData } from '../types';

interface TimerProps {
  exam: CountdownData;
}

const CountdownTimer: React.FC<TimerProps> = ({ exam }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(exam.date) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [exam.date]);

  if (!timeLeft) return (
    <div className="glass-card p-8 rounded-[32px] border border-white/5 flex flex-col items-center justify-center min-h-[160px]">
       <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{exam.name}</span>
       <span className="font-bold text-gray-400 mt-2 text-sm uppercase">Sim Complete</span>
    </div>
  );

  return (
    <div className="glass-card p-8 rounded-[32px] border border-white/5 transition-all hover:-translate-y-2 hover:border-[#7c9473]/30 group relative">
      <div className="absolute top-4 right-4 w-1 h-1 rounded-full bg-[#7c9473]/50"></div>
      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 group-hover:text-[#7c9473] transition-colors">{exam.name}</h3>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-outfit font-extrabold text-white tracking-tighter">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">D</span>
        </div>
        <div className="text-2xl font-light text-gray-700 self-start mt-0.5">:</div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-outfit font-extrabold text-white tracking-tighter">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">H</span>
        </div>
        <div className="text-2xl font-light text-gray-700 self-start mt-0.5">:</div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-outfit font-extrabold text-white tracking-tighter">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">M</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
