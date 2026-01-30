import React, { useState } from 'react';
import { SubjectType } from '../types';
import { TOPICS, COLORS } from '../constants';
import { ChevronRight, Settings2, PlayCircle, Target, ArrowLeft } from 'lucide-react';

interface PracticeSelectionProps {
  subject: SubjectType;
  onStart: (topic: string, count: number, difficulty: string) => void;
  onBack: () => void;
}

const PracticeSelection: React.FC<PracticeSelectionProps> = ({ subject, onStart, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[subject][0]);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const counts = [5, 10, 20, 30];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
      <div className="flex items-center gap-6 reveal" style={{ animationDelay: '0.1s' }}>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all group tactile">
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.3em]">Module Selected</span>
          </div>
          <h1 className="text-3xl font-outfit font-extrabold text-white tracking-tighter">{subject} Protocols</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 reveal" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card rounded-[40px] p-10 border border-white/5 space-y-8 transition-all hover:border-white/10">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
               <Target size={24} className="text-[#7c9473] animate-pulse" />
               <h3 className="text-xl font-outfit font-bold text-white tracking-tight">System Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOPICS[subject].map((topic, idx) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`
                    w-full text-left px-6 py-5 rounded-[24px] transition-all border-2 flex items-center justify-between group
                    ${selectedTopic === topic 
                      ? 'bg-[#7c9473]/10 border-[#7c9473] text-white shadow-[0_10px_30px_rgba(124,148,115,0.1)] scale-[1.02]' 
                      : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300 hover:scale-[1.01]'}
                    active:scale-[0.98]
                  `}
                  style={{ transitionDelay: `${idx * 0.05}s` }}
                >
                  <span className="font-bold text-sm tracking-wide">{topic}</span>
                  {selectedTopic === topic && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7c9473] shadow-[0_0_12px_#7c9473] animate-scale-in"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 reveal" style={{ animationDelay: '0.3s' }}>
          <section className="glass-card p-10 rounded-[40px] border border-white/5 space-y-10 hover:border-white/10 transition-all">
             <div className="flex items-center gap-3 mb-2">
                <Settings2 size={20} className="text-[#7c9473] transition-transform group-hover:rotate-45" />
                <h3 className="font-outfit font-bold text-white tracking-tight">Configuration</h3>
             </div>

             <div className="space-y-6">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block">Intensity Layer</span>
               <div className="flex flex-col gap-2">
                 {difficulties.map((d) => (
                   <button
                     key={d}
                     onClick={() => setDifficulty(d)}
                     className={`
                       w-full py-4 rounded-2xl border text-xs font-bold transition-all uppercase tracking-widest tactile
                       ${difficulty === d 
                         ? 'bg-white text-gray-900 border-white shadow-xl scale-105 z-10' 
                         : 'bg-white/[0.03] border-white/5 text-gray-500 hover:bg-white/5'}
                     `}
                   >
                     {d}
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-6">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block">Unit Quantity</span>
               <div className="grid grid-cols-4 gap-2">
                 {counts.map((c) => (
                   <button
                     key={c}
                     onClick={() => setCount(c)}
                     className={`
                       py-3 rounded-xl border text-xs font-bold transition-all tactile
                       ${count === c 
                         ? 'bg-[#7c9473] text-white border-[#7c9473] shadow-lg shadow-[#7c9473]/20 scale-110' 
                         : 'bg-white/[0.03] border-white/5 text-gray-500 hover:bg-white/5'}
                     `}
                   >
                     {c}
                   </button>
                 ))}
               </div>
             </div>
          </section>

          <button
            onClick={() => onStart(selectedTopic, count, difficulty)}
            className="w-full flex items-center justify-center gap-4 py-6 bg-gradient-to-r from-[#7c9473] to-[#4b5d44] text-white rounded-[32px] font-bold text-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[#7c9473]/40 transition-all hover:-translate-y-2 hover:scale-[1.02] group active:scale-95"
          >
            <PlayCircle size={28} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
            Engage System
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeSelection;