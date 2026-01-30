
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Sparkles, Loader2, RefreshCw, CheckCircle2, AlertCircle, Play, Trash2, Zap } from 'lucide-react';
import { SubjectType, Flashcard, SavedFlashcardSession } from '../types';
import { TOPICS } from '../constants';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardsProps {
  onBack: () => void;
}

const FLASHCARDS_STORAGE_KEY = 'designdost_saved_flashcards';

const Flashcards: React.FC<FlashcardsProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(SubjectType.DESIGN_PRINCIPLES);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[SubjectType.DESIGN_PRINCIPLES][0]);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [savedSession, setSavedSession] = useState<SavedFlashcardSession | null>(null);

  // Load saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (saved) {
      try {
        setSavedSession(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved flashcards", e);
      }
    }
  }, []);

  // Save progress whenever relevant state changes
  useEffect(() => {
    if (isStarted && cards.length > 0) {
      const session: SavedFlashcardSession = {
        subject: selectedSubject,
        topic: selectedTopic,
        cards,
        currentIndex,
        masteredIds: Array.from(masteredIds)
      };
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(session));
      setSavedSession(session);
    }
  }, [isStarted, currentIndex, masteredIds, cards, selectedSubject, selectedTopic]);

  const subjects = [
    SubjectType.DESIGN_PRINCIPLES,
    SubjectType.REASONING,
    SubjectType.GK,
    SubjectType.MATH,
    SubjectType.ENGLISH
  ];

  const handleStart = async () => {
    setIsLoading(true);
    const generatedCards = await generateFlashcards(selectedSubject, selectedTopic, 10);
    setCards(generatedCards);
    setCurrentIndex(0);
    setMasteredIds(new Set());
    setIsStarted(true);
    setIsLoading(false);
  };

  const handleResume = () => {
    if (savedSession) {
      setSelectedSubject(savedSession.subject);
      setSelectedTopic(savedSession.topic);
      setCards(savedSession.cards);
      setCurrentIndex(savedSession.currentIndex);
      setMasteredIds(new Set(savedSession.masteredIds));
      setIsStarted(true);
    }
  };

  const handleClearSaved = () => {
    localStorage.removeItem(FLASHCARDS_STORAGE_KEY);
    setSavedSession(null);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleMastered = (id: string) => {
    const next = new Set(masteredIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMasteredIds(next);
  };

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-4xl font-outfit font-extrabold text-white tracking-tighter">Cognitive Recall</h1>
        </div>

        {savedSession && (
          <div className="relative group animate-in slide-in-from-bottom-4 duration-700">
            <div className="absolute inset-0 bg-[#f59e0b]/10 blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
            <div className="relative glass-card border border-[#f59e0b]/30 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8 text-left">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center text-white shadow-2xl transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">
                  <Zap size={32} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-4 py-1 bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">Active Memory Trace</span>
                  <h3 className="text-2xl font-outfit font-bold text-white tracking-tight">Resume {savedSession.topic}</h3>
                  <p className="text-gray-500 font-medium text-sm">Card {savedSession.currentIndex + 1} of {savedSession.cards.length} • {savedSession.masteredIds.length} Mastered</p>
                </div>
              </div>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <button 
                  onClick={handleResume} 
                  className="apple-btn flex-1 md:flex-none flex items-center justify-center gap-4 px-12 py-5 bg-[#f59e0b] text-white rounded-2xl font-bold text-lg shadow-xl"
                >
                  Re-engage
                </button>
                <button 
                  onClick={handleClearSaved} 
                  className="apple-btn p-5 bg-white/5 text-gray-500 hover:text-red-400 rounded-2xl border border-white/10"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-8">
            <div className="flex items-center gap-3 text-[#f59e0b]">
              <Lightbulb size={24} />
              <h3 className="font-outfit font-bold text-white text-xl">Module Selection</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4 ml-2">Protocol Layer</label>
                <div className="grid grid-cols-1 gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSubject(s);
                        setSelectedTopic(TOPICS[s as SubjectType][0]);
                      }}
                      className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all text-left flex items-center justify-between ${selectedSubject === s ? 'bg-[#7c9473]/10 border-[#7c9473] text-white shadow-lg' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20'}`}
                    >
                      {s}
                      {selectedSubject === s && <div className="w-1.5 h-1.5 rounded-full bg-[#7c9473] shadow-[0_0_10px_#7c9473]"></div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-8">
            <div className="flex items-center gap-3 text-[#7c9473]">
              <Sparkles size={24} />
              <h3 className="font-outfit font-bold text-white text-xl">Specific Trace</h3>
            </div>

            <div className="space-y-6">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4 ml-2">Focused Concept</label>
               <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {TOPICS[selectedSubject as SubjectType].map(t => (
                   <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all text-left ${selectedTopic === t ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.01] border-white/5 text-gray-600 hover:text-gray-400'}`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
            </div>

            <button
              disabled={isLoading}
              onClick={handleStart}
              className="w-full py-6 bg-[#f59e0b] text-white rounded-[32px] font-bold text-xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} fill="currentColor" />}
              {isLoading ? 'Synthesizing...' : 'Initialize New Deck'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <button onClick={() => setIsStarted(false)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-sm font-bold group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Config
        </button>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{currentIndex + 1} / {cards.length}</span>
        </div>
      </div>

      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-[#f59e0b] transition-all duration-500 shadow-[0_0_10px_#f59e0b]" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}></div>
      </div>

      {/* Flashcard Container */}
      <div 
        className="relative perspective-[1500px] w-full aspect-[4/3] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`
          relative w-full h-full transition-all duration-700 preserve-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}>
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden glass-card p-12 rounded-[56px] border-2 border-white/5 flex flex-col items-center justify-center text-center space-y-8 bg-[#10131a] shadow-2xl">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-[#f59e0b] border border-white/10 group-hover:scale-110 transition-transform">
                <Lightbulb size={40} />
             </div>
             <p className="text-3xl font-outfit font-extrabold text-white tracking-tight leading-tight px-4">{currentCard?.front}</p>
             <div className="absolute bottom-10 text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em]">Tap to flip</div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-12 rounded-[56px] border-2 border-[#7c9473]/30 flex flex-col items-center justify-center text-center space-y-8 bg-[#0a100d] shadow-2xl">
             <div className="w-20 h-20 bg-[#7c9473]/10 rounded-3xl flex items-center justify-center text-[#7c9473] border border-[#7c9473]/20">
                <Sparkles size={40} />
             </div>
             <div className="space-y-4">
               <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest block">{currentCard?.topic}</span>
               <p className="text-xl font-medium text-gray-300 leading-relaxed px-4">{currentCard?.back}</p>
             </div>
             <div className="absolute bottom-10 text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em]">Tap to flip back</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 justify-between pt-4">
        <button onClick={handlePrev} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
          <ChevronLeft size={28} />
        </button>

        <div className="flex-1 flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMastered(currentCard?.id); }}
            className={`flex-1 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all ${masteredIds.has(currentCard?.id) ? 'bg-[#7c9473] text-white shadow-lg' : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'}`}
          >
            {masteredIds.has(currentCard?.id) ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {masteredIds.has(currentCard?.id) ? 'Mastered' : 'Hard?'}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleStart(); }}
            className="px-6 bg-white/5 text-gray-600 hover:text-white rounded-3xl transition-all"
            title="Refresh Deck"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <button onClick={handleNext} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
          <ChevronRight size={28} />
        </button>
      </div>

      <style>
        {`
          .perspective-1500 { perspective: 1500px; }
          .preserve-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}
      </style>
    </div>
  );
};

export default Flashcards;
