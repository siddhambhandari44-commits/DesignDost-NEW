
import React, { useState, useEffect } from 'react';
import { generateDrawingPrompt } from '../services/geminiService';
import { PenTool, RefreshCcw, Clock, Sparkles, ChevronLeft, Target, Bookmark, BookmarkCheck, LayoutGrid, Brain } from 'lucide-react';
import CognitiveDeconstruction from '../components/CognitiveDeconstruction';

interface DrawingPracticeProps {
  onBack: () => void;
}

const DRAWING_SAVE_KEY = 'designdost_saved_drawing_prompt';

const DrawingPractice: React.FC<DrawingPracticeProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(30);
  const [isSaved, setIsSaved] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [showCDM, setShowCDM] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAWING_SAVE_KEY);
    if (saved) {
      setHasSavedSession(true);
    }
  }, []);

  const getNewPrompt = async () => {
    setLoading(true);
    const text = await generateDrawingPrompt();
    setPrompt(text);
    setIsSaved(false);
    setLoading(false);
  };

  const handleSavePrompt = () => {
    if (prompt) {
      localStorage.setItem(DRAWING_SAVE_KEY, JSON.stringify({ prompt, duration }));
      setIsSaved(true);
      setHasSavedSession(true);
    }
  };

  const handleResumeSaved = () => {
    const saved = localStorage.getItem(DRAWING_SAVE_KEY);
    if (saved) {
      const { prompt: savedPrompt, duration: savedDuration } = JSON.parse(saved);
      setPrompt(savedPrompt);
      setDuration(savedDuration);
      setIsSaved(true);
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem(DRAWING_SAVE_KEY);
    setHasSavedSession(false);
  };

  const renderStructuredPrompt = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-6 text-left">
        {lines.map((line, idx) => {
          const [label, ...content] = line.split(':');
          if (!content.length) return <p key={idx} className="text-gray-400">{line}</p>;
          return (
            <div key={idx} className="flex flex-col gap-2 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.3em]">{label.trim()}</span>
              <p className="text-xl font-outfit font-semibold text-white leading-tight tracking-tight">{content.join(':').trim()}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {showCDM && (
        <CognitiveDeconstruction 
          taskType="Drawing" 
          onComplete={() => setShowCDM(false)} 
        />
      )}

      <div className="flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all font-bold text-sm group">
           <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
           <span>Dashboard</span>
         </button>
         <div className="flex items-center gap-3">
            <LayoutGrid size={18} className="text-[#7c9473]" />
            <h1 className="text-xl font-outfit font-bold text-white tracking-tight uppercase tracking-widest">Part B Engine</h1>
         </div>
      </div>

      <div className="glass-card p-12 rounded-[60px] border border-white/5 space-y-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <PenTool size={120} />
        </div>

        <div className="space-y-4 relative">
           <div className="w-16 h-16 bg-[#7c9473]/10 text-[#7c9473] rounded-3xl flex items-center justify-center mx-auto border border-[#7c9473]/20 shadow-inner">
              <PenTool size={32} />
           </div>
           <h2 className="text-3xl font-outfit font-extrabold text-white tracking-tighter">Scenario Generator</h2>
           <p className="text-gray-500 max-w-sm mx-auto font-medium text-sm">Synthesizing UCEED/CEED style environmental challenges for visualization practice.</p>
        </div>

        {!prompt ? (
          <div className="flex flex-col gap-6 max-w-xs mx-auto relative">
            <button
              onClick={getNewPrompt}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-lg shadow-[0_20px_40px_rgba(124,148,115,0.2)] disabled:opacity-20 transition-all hover:-translate-y-2 group"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : <Sparkles size={24} />}
              Generate Protocol
            </button>
            
            {hasSavedSession && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResumeSaved}
                  className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-[28px] font-bold text-xs hover:border-[#7c9473] hover:text-[#7c9473] transition-all flex items-center justify-center gap-2"
                >
                  <Bookmark size={16} />
                  Restore Fragment
                </button>
                <button 
                  onClick={handleClearSaved}
                  className="text-[9px] font-bold text-gray-700 uppercase hover:text-red-400/50 transition-colors tracking-widest"
                >
                  Clear Buffer
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-in zoom-in-95 duration-500">
             <div className="p-10 bg-black/20 rounded-[40px] border border-white/5 relative overflow-hidden shadow-inner">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7c9473] shadow-[0_0_15px_#7c9473]"></div>
               <div className="absolute top-6 right-6">
                  <button 
                    onClick={handleSavePrompt}
                    title={isSaved ? "Saved" : "Save Fragment"}
                    className={`p-3 rounded-2xl transition-all ${isSaved ? 'text-[#7c9473] bg-[#7c9473]/10 border border-[#7c9473]/20' : 'text-gray-600 hover:text-white hover:bg-white/10'}`}
                  >
                    {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
               </div>
               {renderStructuredPrompt(prompt)}
             </div>

             <div className="space-y-8">
                <div className="flex items-center justify-center gap-12">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-4 tracking-[0.2em]">Practice Focus</span>
                    <div className="flex gap-2">
                       <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase">Geometry</span>
                       <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase">Atmosphere</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-4 tracking-[0.2em]">Duration</span>
                    <div className="flex gap-1 bg-white/[0.03] p-1 rounded-full border border-white/5">
                      <button onClick={() => setDuration(30)} className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all ${duration === 30 ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-600'}`}>30m</button>
                      <button onClick={() => setDuration(60)} className={`px-5 py-2 rounded-full text-[10px] font-bold transition-all ${duration === 60 ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-600'}`}>60m</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 max-w-md mx-auto">
                   <button
                    onClick={getNewPrompt}
                    disabled={loading}
                    className="flex-1 py-5 bg-white/5 border border-white/10 text-gray-400 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all"
                   >
                     {loading ? <RefreshCcw size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                     Another
                   </button>
                   <button
                    onClick={() => setShowCDM(true)}
                    className="flex-1 py-5 bg-[#7c9473] text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:-translate-y-2 transition-all active:scale-95"
                   >
                     <Brain size={20} />
                     Finish & Reflect
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="glass-card p-10 rounded-[50px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
         <h4 className="font-outfit font-bold text-white mb-6 flex items-center gap-3">
           <Target size={20} className="text-[#7c9473]" />
           Neural Evaluation Criteria
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.2em]">Space Logic</span>
               <p className="text-gray-500 font-medium leading-relaxed">Structural integrity of vanishing points and horizon placement.</p>
            </div>
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.2em]">Unit Scale</span>
               <p className="text-gray-500 font-medium leading-relaxed">Relative proportions between human figures and environment.</p>
            </div>
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.2em]">Material Intel</span>
               <p className="text-gray-500 font-medium leading-relaxed">Authentic rendering of textures, lighting, and surface behavior.</p>
            </div>
            <div className="space-y-2">
               <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.2em]">Narrative flow</span>
               <p className="text-gray-500 font-medium leading-relaxed">Clarity of the action sequence and emotional resonance.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DrawingPractice;
