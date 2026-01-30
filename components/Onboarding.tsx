
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Cpu, Target, ChevronLeft, ShieldCheck, Zap, Maximize, Minimize } from 'lucide-react';
import { COLORS } from '../constants';
import { ExamType } from '../types';

interface OnboardingProps {
  onComplete: (name: string, exam: string) => void;
}

const EXAMS = [
  { id: ExamType.UCEED, name: 'UCEED', full: 'UG Common Entrance for Design' },
  { id: ExamType.CEED, name: 'CEED', full: 'Common Entrance for Design (PG)' },
  { id: ExamType.NID, name: 'NID DAT', full: 'Design Aptitude Test' },
  { id: ExamType.NIFT, name: 'NIFT', full: 'Fashion Technology' },
  { id: ExamType.JEE_BARCH, name: 'JEE B.Arch', full: 'Architecture Entrance' },
  { id: ExamType.NATA, name: 'NATA', full: 'Aptitude Test in Architecture' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleFinish = () => {
    if (name.trim() && selectedExam) {
      onComplete(name.trim(), selectedExam);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#07080a] animate-in fade-in duration-700 overflow-y-auto overflow-x-hidden custom-scrollbar">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7c9473]/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#e89f71]/05 blur-[120px]"></div>
      </div>

      {/* Floating Controls (Always available) */}
      <div className="fixed top-8 right-8 z-[110] flex items-center gap-4 reveal">
        <button 
          onClick={toggleFullscreen}
          className="p-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl text-gray-500 hover:text-[#7c9473] hover:border-[#7c9473]/40 transition-all flex items-center gap-3 group shadow-2xl"
          title={isFullscreen ? 'Exit Immersive' : 'Immersive Mode'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
            {isFullscreen ? 'Exit Interface' : 'Immersive Protocol'}
          </span>
        </button>
      </div>

      <div className="min-h-full flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-4xl w-full py-12">
          {step === 1 ? (
            <div className="max-w-md mx-auto space-y-12 text-center animate-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7c9473] to-[#4b5d44] text-white rounded-[40px] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(124,148,115,0.3)] animate-float">
                  <Cpu size={48} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-5xl font-outfit font-extrabold text-white tracking-tighter">Welcome, Dost.</h1>
                  <p className="text-gray-400 font-medium leading-relaxed">
                    DesignDost is your digital haven for exam mastery. <br />
                    Identify yourself to initialize the neural link.
                  </p>
                </div>
              </div>

              <form onSubmit={handleNextStep} className="space-y-8">
                <div className="space-y-4">
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent designation..."
                    className="w-full px-10 py-8 rounded-[32px] border border-white/5 bg-white/[0.03] text-3xl font-outfit font-bold text-[#7c9473] text-center focus:border-[#7c9473]/30 focus:ring-4 focus:ring-[#7c9473]/5 transition-all outline-none placeholder:text-gray-700 shadow-inner"
                  />
                  
                  {/* Integrated Immersive Toggle for Identity Section */}
                  <button 
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-xl text-gray-600 hover:text-[#7c9473] hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                  >
                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    {isFullscreen ? 'Exit Immersive Mode' : 'Go Immersive for Best Experience'}
                  </button>
                </div>
                
                <button
                  disabled={!name.trim()}
                  type="submit"
                  className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl shadow-[0_20px_40px_rgba(124,148,115,0.2)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-10 flex items-center justify-center gap-4 group"
                >
                  Access System
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-12 animate-in zoom-in-95 duration-700">
              <div className="text-center space-y-4">
                <button 
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest mb-4"
                >
                  <ChevronLeft size={14} /> Back to Identity
                </button>
                <h2 className="text-4xl md:text-5xl font-outfit font-extrabold text-white tracking-tighter">Define Your Trajectory</h2>
                <p className="text-gray-500 font-medium">Identify your target design protocol to calibrate the curriculum.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {EXAMS.map((exam, idx) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`
                      group relative glass-card p-8 rounded-[40px] text-left border transition-all duration-500 hover:-translate-y-2
                      ${selectedExam === exam.id 
                        ? 'border-[#7c9473] bg-[#7c9473]/10 shadow-[0_0_30px_rgba(124,148,115,0.2)]' 
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'}
                    `}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedExam === exam.id ? 'bg-[#7c9473] text-white' : 'bg-white/5 text-gray-600'}`}>
                        <Target size={24} />
                      </div>
                      {selectedExam === exam.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#7c9473] shadow-[0_0_10px_#7c9473] animate-pulse"></div>
                      )}
                    </div>
                    <h3 className="text-2xl font-outfit font-bold text-white tracking-tight mb-1">{exam.name}</h3>
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-snug">{exam.full}</p>
                  </button>
                ))}
              </div>

              <div className="max-w-md mx-auto pt-6">
                <button
                  disabled={!selectedExam}
                  onClick={handleFinish}
                  className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl shadow-[0_20px_40px_rgba(124,148,115,0.2)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-10 flex flex-col items-center justify-center gap-1 group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={24} />
                    <span>Protocol Initialized</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-50">Syncing Creative Core</span>
                </button>
              </div>

              <div className="pt-8 flex justify-center gap-6 opacity-40">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Protocol Alpha</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Habit Engine</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Visual Logic</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
