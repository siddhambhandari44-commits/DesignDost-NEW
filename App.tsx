
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PracticeSelection from './pages/PracticeSelection';
import PracticeSession from './components/PracticeSession';
import GestureFlow from './pages/GestureFlow';
import DrawingPractice from './pages/DrawingPractice';
import TimerBuddy from './pages/TimerBuddy';
import AIReview from './pages/AIReview';
import About from './pages/About';
import Connect from './pages/Connect';
import Flashcards from './pages/Flashcards';
import Exhibit from './pages/Exhibit';
import Onboarding from './components/Onboarding';
import MitraChat from './components/MitraChat';
import RadarMap from './components/RadarMap';
import { SubjectType, SavedSession, SessionResult, ExamType, Question, UserProfile, Badge, QuestionMetric } from './types';
import { generateSessionInsights } from './services/geminiService';
import { Trophy, Clock, Target, Calendar, ArrowRight, AlertCircle, CheckCircle2, BookOpen, ShieldCheck, ChevronRight, User, Award, Zap, MessageSquare, TrendingUp, Sparkles, BrainCircuit, Activity, RotateCcw, Activity as PulseIcon, Map, Info } from 'lucide-react';

const SESSION_STORAGE_KEY = 'designdost_active_session';
const HISTORY_STORAGE_KEY = 'designdost_history';
const USER_STORAGE_KEY = 'designdost_user';

const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first practice session.', icon: 'Zap', color: '#7c9473' },
  { id: 'sharp_eye', name: 'Sharp Eye', description: 'Achieve 100% accuracy in a session.', icon: 'Target', color: '#e89f71' },
  { id: 'design_scholar', name: 'Design Scholar', description: 'Complete 5 practice sessions.', icon: 'BookOpen', color: '#3b82f6' },
  { id: 'simulation_pro', name: 'Simulation Pro', description: 'Complete a full-scale Mock exam.', icon: 'ShieldCheck', color: '#22c55e' },
  { id: 'community_dost', name: 'Community Dost', description: 'Contribute to the peer network.', icon: 'MessageSquare', color: '#d946ef' },
  { id: 'xp_titan', name: 'XP Titan', description: 'Surpass 500 total Design XP.', icon: 'TrendingUp', color: '#eab308' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [practiceConfig, setPracticeConfig] = useState<{
    subject: SubjectType | 'Mock';
    topic: string;
    count: number;
    difficulty: string;
  } | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ score: number; total: number; timeSpent: number, mistakes: Question[], metrics: QuestionMetric[] } | null>(null);
  const [showMistakesReview, setShowMistakesReview] = useState(false);
  const [selectedDashboardItem, setSelectedDashboardItem] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [aiInsight, setAiInsight] = useState<{ feedback: string; recommendedCount: number; recommendedDifficulty: string } | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Responsive state for charts
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) setUserProfile(JSON.parse(savedUser));

    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) setSavedSession(JSON.parse(saved));
    
    const hist = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (hist) setHistory(JSON.parse(hist));

    return () => window.removeEventListener('resize', handleResize);
  }, [isSessionActive]);

  const handleOnboarding = (name: string, targetExam: string) => {
    const profile: UserProfile = { 
      name, 
      targetExam,
      onboarded: true, 
      xp: 0, 
      streak: 1, 
      lastActive: new Date().toISOString(),
      badges: [],
      sessionsCompleted: 0
    };
    setUserProfile(profile);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  };

  const checkAndAwardBadges = (profile: UserProfile, results?: { score: number, total: number, isMock: boolean }): UserProfile => {
    const updatedBadges = [...profile.badges];
    const earnedIds = new Set(updatedBadges.map(b => b.id));

    const award = (badgeId: string) => {
      if (!earnedIds.has(badgeId)) {
        const def = BADGE_DEFINITIONS.find(d => d.id === badgeId);
        if (def) {
          const badge: Badge = { 
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            color: def.color,
            dateEarned: new Date().toISOString()
          };
          updatedBadges.push(badge);
          setNewBadge(badge);
        }
      }
    };

    if (profile.sessionsCompleted >= 1) award('first_step');
    if (profile.sessionsCompleted >= 5) award('design_scholar');
    if (profile.xp >= 500) award('xp_titan');
    if (results) {
      if (results.score === results.total && results.total > 0) award('sharp_eye');
      if (results.isMock) award('simulation_pro');
    }

    return { ...profile, badges: updatedBadges };
  };

  const startPractice = (topic: string, count: number, difficulty: string) => {
    setPracticeConfig({ subject: selectedDashboardItem as any, topic, count, difficulty });
    setSavedSession(null);
    setIsSessionActive(true);
    setSessionResults(null);
    setShowMistakesReview(false);
    setNewBadge(null);
    setAiInsight(null);
  };

  const finishSession = async (score: number, timeSpent: number, mistakes: Question[], metrics: QuestionMetric[]) => {
    const total = practiceConfig?.count || 0;
    const isMock = practiceConfig?.subject === 'Mock';
    const newResult: SessionResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subject: practiceConfig?.subject || 'Unknown',
      topic: practiceConfig?.topic || 'General',
      score,
      total,
      timeSpent,
      metrics
    };
    
    const updatedHistory = [newResult, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    if (userProfile) {
      const earnedXP = (score * 10) + (total * 2);
      let updatedProfile: UserProfile = { 
        ...userProfile, 
        xp: userProfile.xp + earnedXP,
        sessionsCompleted: userProfile.sessionsCompleted + 1,
        lastActive: new Date().toISOString()
      };
      
      updatedProfile = checkAndAwardBadges(updatedProfile, { score, total, isMock });
      
      setUserProfile(updatedProfile);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
    }

    setSessionResults({ score, total, timeSpent, mistakes, metrics });
    setIsSessionActive(false);
    setSavedSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);

    // Generate AI Insights
    setIsInsightLoading(true);
    try {
      const insights = await generateSessionInsights(
        { topic: practiceConfig?.topic || 'General', score, total, timeSpent, metrics },
        updatedHistory
      );
      setAiInsight(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInsightLoading(false);
    }
  };

  const calculateRadarData = (history: SessionResult[]) => {
    if (history.length === 0) return [50, 50, 50, 50, 50];

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
      Math.min(100, Math.max(25, 100 - (avgTimePerQ / 1.5))), // Speed
      Math.min(100, Math.max(25, (visualCount / 5) * 100)), // Visualization
      Math.min(100, Math.max(25, (obsScore / (obsTotal || 1)) * 100)), // Observation
      Math.min(100, Math.max(25, (logicScore / (logicTotal || 1)) * 100)) // Logic
    ];
  };

  const BadgeIcon = ({ name, color, size = 20 }: { name: string, color: string, size?: number }) => {
    const icons: any = { Zap, Target, BookOpen, ShieldCheck, MessageSquare, TrendingUp };
    const IconComponent = icons[name] || Trophy;
    return <IconComponent size={size} style={{ color }} />;
  };

  const renderContent = () => {
    if (sessionResults) {
      if (showMistakesReview) {
        return (
          <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-[#050608]/80 backdrop-blur-xl py-6 z-10 border-b border-white/5">
              <button onClick={() => setShowMistakesReview(false)} className="flex items-center gap-3 text-[#7c9473] font-bold text-sm group">
                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Results
              </button>
              <h2 className="text-xl font-outfit font-bold text-white tracking-tight">Logic Analysis: {sessionResults.mistakes.length} Nodes</h2>
            </div>
            <div className="space-y-8">
              {sessionResults.mistakes.map((q, idx) => (
                <div key={q.id} className="glass-card p-10 rounded-[48px] border border-red-500/10 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><AlertCircle size={80} /></div>
                  <div className="flex items-start gap-6 relative">
                    <span className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-outfit font-bold flex-shrink-0">{idx + 1}</span>
                    <p className="text-xl font-medium text-white leading-relaxed tracking-tight">{q.text}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pl-16">
                     <div className="flex items-center gap-4 px-8 py-5 rounded-[28px] border border-green-500/20 bg-green-500/5 text-green-400">
                        <CheckCircle2 size={20} />
                        <span className="font-bold tracking-tight">Resolution: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                     </div>
                  </div>
                  <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5 ml-16">
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3"><BookOpen size={16} />Intel Trace</h4>
                    <p className="text-gray-400 leading-relaxed font-medium italic">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setSessionResults(null); setSelectedDashboardItem(null); setActiveTab('dashboard'); }} className="w-full py-6 bg-white text-gray-900 rounded-[32px] font-bold text-lg shadow-xl hover:-translate-y-2 transition-all">Protocol Finalized</button>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] py-10 animate-in zoom-in-95 duration-700">
          <div className="glass-card p-12 md:p-16 rounded-[64px] border border-white/5 text-center space-y-12 max-w-2xl w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7c9473] to-[#e89f71]"></div>
            
            {newBadge && (
              <div className="bg-[#7c9473]/10 border border-[#7c9473]/30 p-6 rounded-[32px] animate-in slide-in-from-top-4 duration-500 flex items-center gap-6 text-left">
                <div className="w-16 h-16 rounded-2xl bg-[#7c9473] flex items-center justify-center shadow-lg">
                  <BadgeIcon name={newBadge.icon} color="white" size={32} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.3em]">Badge Unlocked</span>
                  <h4 className="text-xl font-outfit font-bold text-white tracking-tight">{newBadge.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{newBadge.description}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
               <div className="w-24 h-24 bg-gradient-to-br from-[#7c9473] to-[#4b5d44] rounded-[40px] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(124,148,115,0.3)]"><Trophy size={56} className="text-white" /></div>
               <div>
                 <h2 className="text-4xl font-outfit font-extrabold text-white tracking-tighter">Cycle Optimized</h2>
                 <p className="text-gray-500 mt-2 font-medium">Trajectory expansion initiated, Agent {userProfile?.name}.</p>
               </div>
            </div>

            {/* AI Diagnostics Section */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit size={20} className="text-[#7c9473]" />
                  <h3 className="font-outfit font-bold text-white tracking-tight text-xl">Neural Diagnostic</h3>
               </div>
               
               {isInsightLoading ? (
                 <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] flex flex-col items-center gap-4">
                    <Activity size={32} className="text-[#7c9473] animate-pulse" />
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest animate-pulse">Computing Performance Metrics...</p>
                 </div>
               ) : aiInsight ? (
                 <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="p-8 bg-white/[0.03] border border-[#7c9473]/20 rounded-[40px] text-left relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                          <Target size={64} />
                       </div>
                       <p className="text-gray-300 leading-relaxed font-medium italic text-base">"{aiInsight.feedback}"</p>
                    </div>

                    <div className="glass-card p-10 rounded-[40px] border border-[#e89f71]/20 bg-[#e89f71]/05 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="text-left space-y-1">
                          <span className="text-[10px] font-bold text-[#e89f71] uppercase tracking-[0.3em]">Automated Proposal</span>
                          <h4 className="text-xl font-outfit font-bold text-white tracking-tight">Recommended remedial sprint</h4>
                          <p className="text-xs text-gray-500 font-medium">Topic: {practiceConfig?.topic || 'General'} • {aiInsight.recommendedCount} Units • {aiInsight.recommendedDifficulty}</p>
                       </div>
                       <button 
                         onClick={() => startPractice(practiceConfig?.topic || 'General', aiInsight.recommendedCount, aiInsight.recommendedDifficulty)}
                         className="apple-btn flex items-center gap-3 px-8 py-4 bg-[#e89f71] text-white rounded-[24px] font-bold text-sm shadow-xl group"
                       >
                          <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                          Initiate Now
                       </button>
                    </div>
                 </div>
               ) : null}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-600 block mb-2 tracking-widest">Efficiency</span>
                <span className="text-3xl font-outfit font-extrabold text-white">{sessionResults.score}<span className="text-lg text-gray-700 mx-1">/</span>{sessionResults.total}</span>
              </div>
              <div className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5">
                <span className="text-[10px] uppercase font-bold text-gray-600 block mb-2 tracking-widest">Growth XP</span>
                <span className="text-3xl font-outfit font-extrabold text-[#7c9473]">+{(sessionResults.score * 10) + (sessionResults.total * 2)}</span>
              </div>
            </div>
            <div className="space-y-4">
              {sessionResults.mistakes.length > 0 && (
                <button onClick={() => setShowMistakesReview(true)} className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[32px] font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all group">
                  <AlertCircle size={24} className="text-red-400 group-hover:animate-pulse" />Analyze Discrepancies ({sessionResults.mistakes.length})
                </button>
              )}
              <button onClick={() => { setSessionResults(null); setSelectedDashboardItem(null); setActiveTab('dashboard'); }} className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold shadow-[0_20px_40px_rgba(124,148,115,0.2)] hover:-translate-y-2 transition-all">Return to Mission Control</button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDashboardItem && selectedDashboardItem !== 'Flashcards') {
      return <PracticeSelection subject={selectedDashboardItem as SubjectType} onStart={startPractice} onBack={() => setSelectedDashboardItem(null)} />;
    }

    switch (activeTab) {
      case 'home': return <Home onStart={() => setActiveTab('dashboard')} />;
      case 'dashboard': 
        if (selectedDashboardItem === 'Flashcards') return <Flashcards onBack={() => setSelectedDashboardItem(null)} />;
        return <Dashboard onSelect={(item) => { 
          if (item === 'Mocks') setActiveTab('mocks'); 
          else if (item === 'Drawing') setActiveTab('drawing'); 
          else setSelectedDashboardItem(item); 
        }} savedSession={savedSession} onResume={() => { setPracticeConfig(savedSession as any); setIsSessionActive(true); }} onClearSaved={() => { localStorage.removeItem(SESSION_STORAGE_KEY); setSavedSession(null); }} />;
      case 'drawing': return <div className="space-y-16"><GestureFlow onBack={() => setActiveTab('dashboard')} /><DrawingPractice onBack={() => setActiveTab('dashboard')} /></div>;
      case 'timerbuddy': return <TimerBuddy />;
      case 'review': return <AIReview />;
      case 'exhibit': return <Exhibit />;
      case 'about': return <About />;
      case 'connect': return userProfile ? <Connect user={userProfile} /> : null;
      case 'mocks': return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
          <div className="space-y-4"><h1 className="text-4xl font-outfit font-extrabold text-white tracking-tighter">Simulations</h1><p className="text-gray-500 font-medium">Deploy full-scale environments to benchmark performance.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[ExamType.UCEED, ExamType.CEED, ExamType.NID, ExamType.NIFT].map(exam => (
              <div key={exam} className="glass-card p-10 rounded-[48px] border border-white/5 flex items-center justify-between group hover:border-[#7c9473]/40 transition-all hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={100} /></div>
                <div className="relative z-10"><h3 className="text-3xl font-outfit font-bold text-white tracking-tight">{exam}</h3><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Protocol Alpha • 30 Units</p></div>
                <button onClick={() => { setSelectedDashboardItem('Mock'); setPracticeConfig({ subject: 'Mock', topic: exam, count: 30, difficulty: 'Medium' }); setIsSessionActive(true); }} className="p-5 bg-white/5 rounded-[24px] text-gray-500 group-hover:bg-[#7c9473] group-hover:text-white transition-all shadow-xl relative z-10"><ChevronRight size={24} /></button>
              </div>
            ))}
          </div>
        </div>
      );
      case 'profile':
        const radarData = calculateRadarData(history);
        return (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                <div className="flex-1 space-y-10">
                   <div className="glass-card p-12 rounded-[56px] border border-white/5 flex items-center gap-8 relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 p-10 opacity-5"><User size={120} /></div>
                      <div className="w-24 h-24 bg-gradient-to-br from-[#7c9473] to-[#4b5d44] rounded-[32px] flex items-center justify-center text-5xl shadow-2xl text-white">{userProfile?.name?.charAt(0) || 'D'}</div>
                      <div className="relative z-10">
                         <h2 className="text-3xl font-outfit font-extrabold text-white tracking-tight">Agent {userProfile?.name}</h2>
                         <p className="text-gray-500 font-medium mt-1">Design XP: <span className="text-[#7c9473]">{userProfile?.xp || 0}</span> • Target: <span className="text-[#e89f71]">{userProfile?.targetExam}</span></p>
                         <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2">Streak: {userProfile?.streak || 0}d</p>
                      </div>
                   </div>
                </div>
                
                <div className="lg:w-96 glass-card p-10 rounded-[56px] border border-white/5 space-y-6">
                   <div className="flex items-center justify-between"><h3 className="font-outfit font-bold text-white tracking-tight text-xl">Quick Analytics</h3><Activity size={18} className="text-[#7c9473]" /></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Solved</span>
                        <span className="text-2xl font-outfit font-bold text-white">{history.reduce((a,c)=>a+c.total,0)}</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Correct</span>
                        <span className="text-2xl font-outfit font-bold text-[#7c9473]">{history.reduce((a,c)=>a+c.score,0)}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Visual Progress Map Section */}
             <div className="glass-card p-12 md:p-16 rounded-[64px] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7c9473]/30 to-transparent"></div>
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[#7c9473]">
                         <Map size={18} />
                         <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Design Capability Index</span>
                      </div>
                      <h3 className="text-3xl font-outfit font-bold text-white tracking-tight">Visual Progress Map</h3>
                   </div>
                   <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                      <PulseIcon size={16} className="text-[#e89f71] animate-pulse" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Sync Optimized</span>
                   </div>
                </div>

                <div className="flex flex-col xl:flex-row items-center justify-center gap-20 py-10">
                  <div className="w-full max-w-[500px] flex items-center justify-center">
                    <RadarMap 
                      size={windowWidth < 768 ? 320 : 450} 
                      data={radarData} 
                      labels={['Accuracy', 'Speed', 'Visualization', 'Observation', 'Logic']} 
                    />
                  </div>
                  
                  <div className="flex-1 w-full max-w-xl space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Accuracy', 'Speed', 'Visualization', 'Observation', 'Logic'].map((label, i) => {
                          const value = radarData[i];
                          return (
                            <div key={label} className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 space-y-3 hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                               <div className="flex items-center justify-between relative z-10">
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300">{label}</span>
                                 <span className="text-sm font-outfit font-bold text-white">{Math.round(value)}%</span>
                               </div>
                               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                  <div className="h-full bg-gradient-to-r from-[#7c9473] to-[#a8c69b] transition-all duration-1000 shadow-[0_0_10px_rgba(124,148,115,0.3)]" style={{ width: `${value}%` }}></div>
                               </div>
                               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                  <Sparkles size={40} />
                               </div>
                            </div>
                          );
                        })}
                     </div>
                     <div className="p-8 bg-[#7c9473]/5 border border-[#7c9473]/10 rounded-[32px] flex items-start gap-4">
                        <Info size={20} className="text-[#7c9473] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          Your progress map is dynamically generated based on recent performance logs. <span className="text-[#7c9473]">Visualization</span> scores increase with Studio and Gesture practice sessions.
                        </p>
                     </div>
                  </div>
                </div>
             </div>

             <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-6">
                   <div className="flex items-center gap-4">
                     <Award className="text-[#e89f71]" size={20} />
                     <h3 className="font-outfit font-bold text-white text-xl tracking-tight">Hall of Fame</h3>
                     <div className="flex-1 h-px bg-white/5"></div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                     {BADGE_DEFINITIONS.map(def => {
                       const earned = userProfile?.badges.find(b => b.id === def.id);
                       return (
                         <div key={def.id} className={`glass-card p-6 rounded-[32px] border text-center space-y-3 transition-all relative overflow-hidden group ${earned ? 'border-[#7c9473]/30 bg-[#7c9473]/05' : 'border-white/5 opacity-40 grayscale'}`}>
                           {earned && (
                             <div className="absolute top-0 left-0 w-full h-1 bg-[#7c9473]/50"></div>
                           )}
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-500 ${earned ? 'bg-[#7c9473] text-white shadow-lg group-hover:rotate-12 group-hover:scale-110' : 'bg-white/5 text-gray-700'}`}>
                             <BadgeIcon name={def.icon} color={earned ? 'white' : 'currentColor'} size={28} />
                           </div>
                           <div>
                             <h4 className="font-bold text-white text-xs tracking-tight">{def.name}</h4>
                             <p className="text-[9px] text-gray-600 font-medium leading-tight mt-1">{def.description}</p>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
                
                <div className="lg:w-96 glass-card p-10 rounded-[56px] border border-white/5 space-y-8 h-full">
                   <div className="flex items-center justify-between"><h3 className="font-outfit font-bold text-white tracking-tight text-xl">History Logs</h3><Calendar size={18} className="text-[#7c9473]" /></div>
                   {history.length === 0 ? <p className="text-gray-600 text-sm italic font-medium">System idle.</p> : (
                     <div className="space-y-6">
                        {history.slice(0, 10).map(res => (
                          <div key={res.id} className="flex items-center justify-between py-1 group border-b border-white/5 last:border-0 pb-3">
                             <div><p className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{res.topic}</p><p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-1">{new Date(res.date).toLocaleDateString()}</p></div>
                             <div className="text-right"><span className="text-sm font-outfit font-bold text-[#7c9473]">{res.score}/{res.total}</span></div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
          </div>
        );
      default: return <Home onStart={() => setActiveTab('dashboard')} />;
    }
  };

  return (
    <>
      {!userProfile && <Onboarding onComplete={handleOnboarding} />}
      {isSessionActive && practiceConfig ? (
        <PracticeSession 
          {...practiceConfig} 
          onFinish={finishSession} 
          onExit={() => setIsSessionActive(false)} 
          initialState={savedSession || undefined} 
        />
      ) : (
        <>
          <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedDashboardItem(null); setIsSessionActive(false); setSessionResults(null); }} children={renderContent()} />
          {userProfile && <MitraChat userName={userProfile.name} history={history} />}
        </>
      )}
    </>
  );
};

export default App;
