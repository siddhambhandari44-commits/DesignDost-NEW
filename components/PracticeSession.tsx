
import React, { useState, useEffect, useRef } from 'react';
import { Question, SubjectType, SavedSession, QuestionType, QuestionMetric } from '../types';
import { generateQuestions } from '../services/geminiService';
import { CheckCircle2, ChevronRight, Loader2, Clock, AlertCircle, Timer, Zap, Shield, Cpu, X, HelpCircle, LogOut } from 'lucide-react';
import CognitiveDeconstruction from './CognitiveDeconstruction';

interface PracticeSessionProps {
  subject: SubjectType | 'Mock';
  topic: string;
  count: number;
  difficulty: string;
  onFinish: (score: number, timeSpent: number, mistakes: Question[], metrics: QuestionMetric[]) => void;
  onExit: () => void;
  initialState?: Partial<SavedSession>;
}

const SESSION_STORAGE_KEY = 'designdost_active_session';

const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  subject, 
  topic, 
  count, 
  difficulty, 
  onFinish, 
  onExit,
  initialState 
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialState?.questions || []);
  const [loading, setLoading] = useState(!initialState?.questions);
  const [currentIndex, setCurrentIndex] = useState(initialState?.currentIndex || 0);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [natValue, setNatValue] = useState<string>("");
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(initialState?.score || 0);
  const [timer, setTimer] = useState(initialState?.timer || 0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [metrics, setMetrics] = useState<QuestionMetric[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // CDM State
  const [showCDM, setShowCDM] = useState(false);

  const stateRef = useRef({ currentIndex, score, timer, questions });
  
  // Enter Fullscreen on Mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed. Proceeding normally.", err);
      }
    };
    enterFullscreen();

    // Exit Fullscreen on Unmount
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Exit fullscreen error", err));
      }
    };
  }, []);

  useEffect(() => {
    stateRef.current = { currentIndex, score, timer, questions };
  }, [currentIndex, score, timer, questions]);

  useEffect(() => {
    if (!initialState?.questions) {
      const fetchQuestions = async () => {
        const data = await generateQuestions(subject, topic, count, difficulty);
        setQuestions(data);
        setLoading(false);
      };
      fetchQuestions();
    }
  }, [subject, topic, count, difficulty, initialState]);

  useEffect(() => {
    if (loading || !questions.length) return;
    const interval = setInterval(() => {
      setTimer(t => t + 1);
      setQuestionTimer(qt => qt + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, questions, showCDM]); // Pause timer when CDM is showing

  const saveProgress = () => {
    const { currentIndex: ci, score: s, timer: t, questions: q } = stateRef.current;
    if (q.length > 0) {
      const sessionData: SavedSession = {
        subject,
        topic,
        count,
        difficulty,
        currentIndex: ci,
        score: s,
        timer: t,
        questions: q
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
  };

  useEffect(() => {
    if (!loading && questions.length > 0) saveProgress();
  }, [currentIndex, score, questions.length, loading]);

  const checkAnswer = () => {
    const currentQ = questions[currentIndex];
    let isCorrect = false;

    if (currentQ.type === QuestionType.MCQ) {
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === QuestionType.MSQ) {
      const correctArr = Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer : [currentQ.correctAnswer];
      isCorrect = selectedOptions.length === correctArr.length && 
                  selectedOptions.every(o => correctArr.includes(o));
    } else if (currentQ.type === QuestionType.NAT) {
      isCorrect = natValue.trim() === String(currentQ.correctAnswer).trim();
    }

    const metric: QuestionMetric = {
      topic: currentQ.topic,
      isCorrect,
      timeSpent: questionTimer
    };
    setMetrics(prev => [...prev, metric]);

    if (!isCorrect) {
      setMistakes(prev => [...prev, currentQ]);
    } else {
      setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setQuestionTimer(0);
      setSelectedOption(null);
      setSelectedOptions([]);
      setNatValue("");
      setShowExplanation(false);
    } else {
      // Trigger Cognitive Deconstruction Mode instead of immediate finish
      setShowCDM(true);
    }
  };

  const handleCDMComplete = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setShowCDM(false);
    onFinish(score, timer, mistakes, metrics);
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#050608] z-[999] flex flex-col items-center justify-center space-y-16">
      <div className="relative group scale-125">
        <div className="absolute inset-0 bg-[#7c9473]/30 blur-[60px] animate-pulse"></div>
        <Loader2 size={100} className="animate-spin text-[#7c9473] relative z-10" />
      </div>
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
           <Cpu size={14} className="text-[#7c9473] animate-pulse" />
           Design Engine Initialization
        </div>
        <h3 className="text-4xl font-outfit font-extrabold text-white tracking-tighter">Synthesizing Session...</h3>
        <p className="text-gray-500 max-w-sm mx-auto text-base font-medium opacity-70">Fetching spatial logic protocols and visual geometry matrices from core archives.</p>
      </div>
    </div>
  );

  const currentQ = questions[currentIndex];
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#050608] z-[999] overflow-y-auto custom-scrollbar">
      {/* CDM Overlay */}
      {showCDM && (
        <CognitiveDeconstruction 
          taskType="Reasoning" 
          onComplete={handleCDMComplete}
        />
      )}

      {/* Distraction-free Container */}
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12 pb-48 relative">
        
        {/* Top Exit Control */}
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="fixed top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all z-[1001]"
        >
          <X size={24} />
        </button>

        {/* Header Bar */}
        <div className="flex items-center justify-between glass-card p-8 rounded-[32px] border border-white/10 reveal">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#7c9473] group hover:scale-110 transition-transform">
               <Zap size={28} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                 <span className="text-[10px] font-bold text-black bg-[#7c9473] px-2.5 py-0.5 rounded tracking-widest uppercase">{currentQ.type}</span>
                 <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest opacity-80">{topic}</span>
              </div>
              <h2 className="text-xl font-outfit font-bold text-white tracking-tight">Sequence {currentIndex + 1} of {questions.length}</h2>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 group transition-all hover:bg-white/10">
              <Timer size={18} className="text-[#7c9473] group-hover:scale-110 transition-transform" />
              <span className="font-mono text-white font-bold text-lg tracking-tighter">{formatTime(questionTimer)}</span>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 transition-all hover:bg-white/10">
              <Clock size={18} className="text-gray-500" />
              <span className="font-mono text-gray-400 font-bold text-lg tracking-tighter">{formatTime(timer)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10 p-[2px] reveal">
          <div 
            className="bg-gradient-to-r from-[#7c9473] via-[#a8c69b] to-[#7c9473] h-full transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_0_20px_rgba(124,148,115,0.4)] rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Main Question Card */}
        <div className="glass-card p-12 md:p-20 rounded-[64px] border border-white/10 space-y-12 relative overflow-hidden group reveal">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none transition-all duration-1000 group-hover:opacity-[0.05] group-hover:scale-125">
             <Shield size={260} />
          </div>
          
          <div className="space-y-10 relative">
            <p className="text-2xl md:text-3xl leading-tight text-white font-outfit font-semibold tracking-tight whitespace-pre-wrap">{currentQ.text}</p>
          </div>

          {currentQ.type === QuestionType.NAT ? (
            <div className="space-y-8 max-w-md relative reveal" style={{ animationDelay: '0.1s' }}>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.35em] block ml-4 opacity-70">Numerical Response Interface</label>
              <input 
                type="text"
                value={natValue}
                onChange={(e) => setNatValue(e.target.value)}
                disabled={showExplanation}
                placeholder="0.0"
                className="w-full px-12 py-10 rounded-[32px] border border-white/10 bg-white/5 text-5xl font-outfit font-extrabold text-[#7c9473] focus:border-[#7c9473] focus:bg-white/10 transition-all duration-500 outline-none text-center shadow-inner focus:scale-[1.03]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative stagger-reveal">
              {currentQ.options?.map((option, idx) => {
                const isSelected = currentQ.type === QuestionType.MSQ 
                  ? selectedOptions.includes(option)
                  : selectedOption === option;
                const isCorrect = Array.isArray(currentQ.correctAnswer)
                  ? currentQ.correctAnswer.includes(option)
                  : option === currentQ.correctAnswer;

                return (
                  <button
                    key={option}
                    disabled={showExplanation}
                    onClick={() => {
                      if (currentQ.type === QuestionType.MSQ) {
                        setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
                      } else {
                        setSelectedOption(option);
                      }
                    }}
                    className={`
                      flex items-center gap-6 px-8 py-6 rounded-[32px] border-2 transition-all duration-500 text-left relative group/opt
                      ${!showExplanation ? 'hover:border-white/30 hover:bg-white/[0.04] hover:scale-[1.01] active:scale-[0.98]' : ''}
                      ${isSelected && !showExplanation ? 'border-[#7c9473] bg-[#7c9473]/10 shadow-[0_10px_30px_rgba(124,148,115,0.1)]' : 'border-white/5 bg-white/[0.01]'}
                      ${showExplanation && isCorrect ? 'border-green-500/50 bg-green-500/10' : ''}
                      ${showExplanation && isSelected && !isCorrect ? 'border-red-500/50 bg-red-500/10' : ''}
                    `}
                    style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
                  >
                    <div className={`
                      w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-700 flex-shrink-0
                      ${isSelected ? 'border-[#7c9473] bg-[#7c9473] shadow-[0_0_15px_rgba(124,148,115,0.4)] scale-110' : 'border-white/10 group-hover/opt:scale-110'}
                      ${showExplanation && isCorrect ? 'border-green-500 bg-green-500' : ''}
                      ${showExplanation && isSelected && !isCorrect ? 'border-red-500 bg-red-500' : ''}
                    `}>
                      {isSelected && !showExplanation && <div className="w-2 h-2 bg-white rounded-sm animate-in zoom-in-50" />}
                      {showExplanation && (isCorrect || isSelected) && <CheckCircle2 className="text-white animate-in zoom-in-50" size={18} />}
                    </div>
                    <span className={`text-base font-bold tracking-tight transition-all duration-500 ${isSelected ? 'text-white' : 'text-gray-400'} ${showExplanation && isCorrect ? 'text-green-400' : ''}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showExplanation && (
            <div className="reveal glass-card p-10 rounded-[40px] border border-[#7c9473]/30 bg-[#7c9473]/10 hover:bg-[#7c9473]/15 transition-all duration-700">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#7c9473] flex items-center justify-center text-black group hover:rotate-12 transition-transform">
                     <AlertCircle size={20} />
                  </div>
                  <h4 className="font-outfit font-bold text-white tracking-tight text-xl">Intel Trace</h4>
               </div>
               <p className="text-gray-200 leading-relaxed font-medium text-lg italic opacity-90">{currentQ.explanation}</p>
            </div>
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-2xl px-10 flex gap-6 z-[70] reveal" style={{ animationDelay: '0.4s' }}>
           {!showExplanation ? (
             <button
              disabled={(currentQ.type === QuestionType.MCQ && !selectedOption) || 
                       (currentQ.type === QuestionType.MSQ && selectedOptions.length === 0) ||
                       (currentQ.type === QuestionType.NAT && !natValue)}
              onClick={checkAnswer}
              className="apple-btn flex-1 py-7 bg-white text-gray-900 rounded-[36px] font-bold text-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] disabled:opacity-20 active:scale-95"
             >
               Confirm Node
             </button>
           ) : (
             <button
              onClick={handleNext}
              className="apple-btn flex-1 flex items-center justify-center gap-4 py-7 bg-gradient-to-r from-[#7c9473] to-[#4b5d44] text-white rounded-[36px] font-bold text-2xl shadow-[0_25px_60px_rgba(124,148,115,0.3)] group"
             >
               {currentIndex === questions.length - 1 ? 'Terminate Cycle' : 'Next Cycle'}
               <ChevronRight size={28} className="transition-transform duration-500 group-hover:translate-x-2" />
             </button>
           )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#050608]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card p-12 rounded-[56px] border border-white/10 max-w-md w-full text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"></div>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
              <HelpCircle size={40} />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-outfit font-extrabold text-white tracking-tighter">Abort Protocol?</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Active synchronization will be terminated. Do you want to quit the test?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onExit}
                className="w-full py-6 bg-red-500 text-white rounded-[32px] font-bold text-xl shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <LogOut size={20} />
                Quit Simulation
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-5 bg-white/5 border border-white/10 text-gray-400 rounded-[32px] font-bold text-sm hover:text-white hover:bg-white/10 transition-all"
              >
                Resume Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeSession;
