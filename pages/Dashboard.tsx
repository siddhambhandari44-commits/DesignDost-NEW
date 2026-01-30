
import React, { useEffect, useState } from 'react';
import { SubjectType, SavedSession, UserProfile, ReflectionEntry, SessionResult } from '../types';
import { Brain, Calculator, Globe, PenTool, ClipboardCheck, Trash2, Zap, Orbit, Trophy, Flame, Layers, Lightbulb, Target, BrainCircuit, Activity, Map } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import RadarMap from '../components/RadarMap';

interface DashboardProps {
  onSelect: (type: SubjectType | 'Drawing' | 'Mocks' | 'Flashcards') => void;
  savedSession: SavedSession | null;
  onResume: () => void;
  onClearSaved: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, savedSession, onResume, onClearSaved }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const savedUser = localStorage.getItem('designdost_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedReflections = localStorage.getItem('designdost_reflections');
    if (savedReflections) setReflections(JSON.parse(savedReflections));

    const savedHistory = localStorage.getItem('designdost_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDominantTendencies = () => {
    if (reflections.length === 0) return [];
    
    const counts: Record<string, number> = {};
    reflections.forEach(entry => {
      entry.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);
  };

  const calculateRadarData = (history: SessionResult[]) => {
    if (history.length === 0) return [50, 50, 50, 50, 50]; // Default baseline

    const totalCorrect = history.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = history.reduce((sum, s) => sum + s.total, 0);
    const avgTimePerQ = history.reduce((sum, s) => sum + (s.timeSpent / (s.total || 1)), 0) / history.length;

    const logicSessions = history.filter(s => s.subject === 'Reasoning' || s.subject === 'Math');
    const logicScore = logicSessions.reduce((sum, s) => sum + s.score, 0);
    const logicTotal = logicSessions.reduce((sum, s) => sum + s.total, 0);

    const obsSessions = history.filter(s => s.subject === 'GK' || s.topic.includes('Pattern'));
    const obsScore = obsSessions.reduce((sum, s) => sum + s.score, 0);
    const obsTotal = obsSessions.reduce((sum, s) => sum + s.total, 0);

    const visualCount = history.filter(s => s.subject === 'Drawing' || s.subject === 'GestureFlow').length;

    return [
      Math.min(100, Math.max(25, (totalCorrect / (totalQuestions || 1)) * 100)), // Accuracy
      Math.min(100, Math.max(25, 100 - (avgTimePerQ / 1.5))), // Speed (Inverse of time)
      Math.min(100, Math.max(25, (visualCount / 5) * 100)), // Visualization (Based on usage)
      Math.min(100, Math.max(25, (obsScore / (obsTotal || 1)) * 100)), // Observation
      Math.min(100, Math.max(25, (logicScore / (logicTotal || 1)) * 100)) // Logic
    ];
  };

  const tendencies = getDominantTendencies();
  const radarData = calculateRadarData(history);

  const sections = [
    { id: SubjectType.REASONING, title: 'Reasoning', desc: 'Visual logic and spatial analysis.', icon: Brain, color: '#7c9473' },
    { id: SubjectType.MATH, title: 'Math', desc: 'Quantitative precision.', icon: Calculator, color: '#e89f71' },
    { id: SubjectType.GK, title: 'GK', desc: 'Design heritage & awareness.', icon: Globe, color: '#3b82f6' },
    { id: SubjectType.DESIGN_PRINCIPLES, title: 'Principles', desc: 'Gestalt, hierarchy & color.', icon: Layers, color: '#06b6d4' },
    { id: 'Flashcards', title: 'Flashcards', desc: 'Rapid cognitive recall.', icon: Lightbulb, color: '#f59e0b' },
    { id: 'Drawing', title: 'Studio', desc: 'Ideation & gesture renders.', icon: PenTool, color: '#eab308' },
    { id: 'Mocks', title: 'Mocks', desc: 'Full-scale exam simulations.', icon: ClipboardCheck, color: '#22c55e' },
  ];

  const level = Math.floor((user?.xp || 0) / 100) + 1;

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Stats Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 reveal">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 text-[#7c9473]">
             <Orbit size={18} className="animate-spin-slow" />
             <span className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-80">Command Terminal</span>
          </div>
          <h1 className="text-5xl font-outfit font-extrabold text-white tracking-tighter">Mission Systems</h1>
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                <Target size={14} className="text-[#e89f71]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Exam: <span className="text-white">{user?.targetExam || 'General'}</span></span>
             </div>
             <p className="text-gray-500 text-sm font-medium opacity-70">Initialize a design module to begin synchronization.</p>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-[40px] flex items-center justify-between border-[#7c9473]/20 bg-[#7c9473]/05 hover:bg-[#7c9473]/10 transition-colors">
           <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Design Rank</span>
              <h4 className="text-2xl font-outfit font-bold text-white tracking-tight">Novice Visionary</h4>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#7c9473] shadow-[0_0_10px_#7c9473] transition-all duration-1000 ease-out" 
                  style={{ width: `${(user?.xp || 0) % 100}%` }}
                ></div>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="text-center px-4">
                 <Flame size={20} className="text-[#e89f71] mx-auto mb-1 animate-pulse" />
                 <span className="text-xs font-bold text-white">
                    <AnimatedCounter value={user?.streak || 1} duration={2000} />d
                 </span>
              </div>
              <div className="text-center px-4 border-l border-white/5">
                 <Trophy size={20} className="text-yellow-400 mx-auto mb-1" />
                 <span className="text-xs font-bold text-white">
                    Lvl <AnimatedCounter value={level} duration={1500} />
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* Visual Progress Map & Thinking Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal" style={{ animationDelay: '0.1s' }}>
        
        {/* Radar Map Card */}
        <div className="glass-card p-10 rounded-[48px] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7c9473]/50 to-transparent"></div>
           <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
              <Map size={20} className="text-[#7c9473]" />
              <h3 className="font-outfit font-bold text-white text-xl">Skill Matrix</h3>
           </div>
           
           <div className="w-full h-full flex items-center justify-center mt-6">
              <RadarMap 
                size={windowWidth < 500 ? 280 : 320} 
                data={radarData} 
                labels={['Accuracy', 'Speed', 'Visualization', 'Observation', 'Logic']} 
              />
           </div>
        </div>

        {/* Thinking Profile & Insight */}
        <div className="flex flex-col gap-8">
           {/* Thinking Profile */}
           <div className="glass-card p-10 rounded-[48px] border border-white/5 relative overflow-hidden group flex-1">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                 <BrainCircuit size={100} />
              </div>
              <div className="flex flex-col gap-6 relative z-10 h-full justify-center">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-[#e89f71]" />
                       <h3 className="font-outfit font-bold text-white text-xl">Cognitive Tendencies</h3>
                    </div>
                    {tendencies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                         {tendencies.map(tag => (
                           <div key={tag} className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-bold text-gray-300 uppercase tracking-wider hover:border-[#e89f71]/30 transition-colors cursor-default">
                             {tag}
                           </div>
                         ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Complete practice sessions to generate your thinking profile.</p>
                    )}
                 </div>
                 {tendencies.length > 0 && (
                   <div className="px-6 py-4 bg-[#e89f71]/10 border border-[#e89f71]/20 rounded-[24px]">
                      <p className="text-xs text-gray-300 font-medium leading-relaxed italic">
                        "You rely heavily on <span className="text-white font-bold">{tendencies[0]}</span>. Consider balancing this with structured analysis in your next simulation."
                      </p>
                   </div>
                 )}
              </div>
           </div>

           {/* Saved Session (Mini) */}
           {savedSession && (
             <div className="glass-card p-8 rounded-[40px] border border-[#7c9473]/30 bg-[#7c9473]/10 flex items-center justify-between gap-6 cursor-pointer hover:bg-[#7c9473]/20 transition-all" onClick={onResume}>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#7c9473] rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Zap size={24} />
                   </div>
                   <div>
                      <span className="text-[9px] font-bold text-[#7c9473] uppercase tracking-widest block">In Progress</span>
                      <h4 className="text-lg font-outfit font-bold text-white">{savedSession.topic}</h4>
                   </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onClearSaved(); }} className="p-3 bg-black/20 rounded-xl text-white/50 hover:text-red-400 transition-colors">
                   <Trash2 size={18} />
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => onSelect(section.id as any)}
            className="group relative glass-card p-10 rounded-[48px] text-left overflow-hidden reveal shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,148,115,0.2)] hover:-translate-y-1"
            style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000" style={{ backgroundColor: section.color }}></div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-sm" style={{ color: section.color }}>
              <section.icon size={28} />
            </div>
            <h3 className="text-2xl font-outfit font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">{section.title}</h3>
            <p className="text-gray-500 text-sm font-medium opacity-80 group-hover:opacity-100 mb-8">{section.desc}</p>
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Access</span>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:bg-[#7c9473] group-hover:text-white transition-all shadow-lg group-hover:rotate-[360deg]"><Zap size={16} /></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
    