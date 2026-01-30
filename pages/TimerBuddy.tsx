
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Zap, Bell, History, Hourglass, Infinity, Flag, ChevronDown } from 'lucide-react';

const TimerBuddy: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'focus' | 'velocity'>('focus');

  // Stopwatch States
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer States
  const [timerInputMinutes, setTimerInputMinutes] = useState(25);
  const [timerTotal, setTimerTotal] = useState(25 * 60);
  const [timerRemaining, setTimerRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- LOGIC ---

  // Stopwatch Logic
  useEffect(() => {
    if (swRunning) {
      swIntervalRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    } else if (swIntervalRef.current) {
      clearInterval(swIntervalRef.current);
    }
    return () => { if (swIntervalRef.current) clearInterval(swIntervalRef.current); };
  }, [swRunning]);

  const handleSwStartStop = () => setSwRunning(!swRunning);
  const handleSwReset = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };
  const handleSwLap = () => {
    setLaps(prev => [swTime, ...prev]);
  };

  const formatSwTime = (time: number) => {
    const mins = Math.floor(time / 60000);
    const secs = Math.floor((time % 60000) / 1000);
    const ms = Math.floor((time % 1000) / 10);
    return {
      main: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      sub: `.${String(ms).padStart(2, '0')}`
    };
  };

  // Timer Logic
  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0 && timerRunning) {
      setTimerRunning(false);
      setTimerFinished(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning, timerRemaining]);

  const handleTimerStartStop = () => {
    if (timerFinished) {
      handleTimerReset();
      return;
    }
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerFinished(false);
    setTimerRemaining(timerInputMinutes * 60);
  };

  const setTimerPreset = (mins: number) => {
    setTimerInputMinutes(mins);
    setTimerTotal(mins * 60);
    setTimerRemaining(mins * 60);
    setTimerRunning(false);
    setTimerFinished(false);
  };

  const formatTimerTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
       return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- VISUALS ---

  // Circular Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = activeMode === 'focus' 
    ? (timerRemaining / timerTotal) * 100 
    : 100; // Stopwatch always full ring or pulsing
  
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 relative">
      
      {/* Background Ambience */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000 pointer-events-none opacity-20 ${
        (timerRunning || swRunning) ? 'bg-[#7c9473] scale-110' : 'bg-[#7c9473]/50 scale-100'
      }`}></div>

      {/* Header & Mode Switcher */}
      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        <div className="text-center space-y-2">
           <div className="inline-flex items-center gap-2 text-[#7c9473] mb-2">
              <Hourglass size={16} className={timerRunning || swRunning ? 'animate-spin-slow' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Chronos Interface</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-white tracking-tighter">Temporal Control</h1>
        </div>

        <div className="glass-card p-1.5 rounded-[24px] border border-white/10 flex gap-2">
           <button 
             onClick={() => setActiveMode('focus')}
             className={`px-8 py-3 rounded-[20px] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeMode === 'focus' ? 'bg-[#7c9473] text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
           >
             <Timer size={16} /> Focus
           </button>
           <button 
             onClick={() => setActiveMode('velocity')}
             className={`px-8 py-3 rounded-[20px] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeMode === 'velocity' ? 'bg-[#e89f71] text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`}
           >
             <Infinity size={16} /> Velocity
           </button>
        </div>
      </div>

      {/* Main Orb Interface */}
      <div className="relative flex flex-col items-center justify-center py-10">
         
         {/* The Orb */}
         <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className={`absolute inset-0 rounded-full border border-white/5 transition-all duration-1000 ${timerRunning || swRunning ? 'scale-110 opacity-100 border-[#7c9473]/30' : 'scale-100 opacity-20'}`}></div>
            <div className={`absolute inset-4 rounded-full border border-white/5 transition-all duration-1000 delay-75 ${timerRunning || swRunning ? 'scale-105 opacity-100 border-[#7c9473]/20' : 'scale-100 opacity-20'}`}></div>

            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(124,148,115,0.3)]">
               {/* Track */}
               <circle
                 cx="50%" cy="50%" r={radius}
                 fill="none"
                 stroke="#ffffff"
                 strokeWidth="2"
                 strokeOpacity="0.05"
               />
               {/* Progress Indicator */}
               <circle
                 cx="50%" cy="50%" r={radius}
                 fill="none"
                 stroke={activeMode === 'focus' ? '#7c9473' : '#e89f71'}
                 strokeWidth="6"
                 strokeLinecap="round"
                 strokeDasharray={circumference}
                 strokeDashoffset={strokeDashoffset}
                 className="transition-[stroke-dashoffset] duration-1000 linear"
               />
            </svg>

            {/* Central Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
               {activeMode === 'focus' ? (
                 <>
                   <span className={`font-mono text-6xl md:text-8xl font-bold tracking-tighter text-white transition-all ${timerFinished ? 'animate-pulse text-red-400' : ''}`}>
                     {formatTimerTime(timerRemaining)}
                   </span>
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-4">
                     {timerFinished ? 'Cycle Complete' : timerRunning ? 'Session Active' : 'Ready to Start'}
                   </span>
                 </>
               ) : (
                 <>
                   <div className="flex items-baseline text-white">
                      <span className="font-mono text-6xl md:text-8xl font-bold tracking-tighter">
                        {formatSwTime(swTime).main}
                      </span>
                      <span className="font-mono text-2xl md:text-3xl text-[#e89f71] font-bold w-12 text-left">
                        {formatSwTime(swTime).sub}
                      </span>
                   </div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-4">
                     Precision Metrics
                   </span>
                 </>
               )}
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-8 mt-12 relative z-20">
            <button 
              onClick={activeMode === 'focus' ? handleTimerReset : handleSwReset}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center hover:rotate-180 duration-500"
            >
               <RotateCcw size={24} />
            </button>

            <button 
              onClick={activeMode === 'focus' ? handleTimerStartStop : handleSwStartStop}
              className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group ${
                activeMode === 'focus' 
                  ? (timerRunning ? 'bg-[#e89f71]' : 'bg-[#7c9473]') 
                  : (swRunning ? 'bg-[#e89f71]' : 'bg-[#7c9473]')
              }`}
            >
               {(activeMode === 'focus' ? timerRunning : swRunning) ? (
                 <Pause size={32} fill="currentColor" />
               ) : (
                 <Play size={32} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />
               )}
            </button>

            {activeMode === 'velocity' ? (
               <button 
                 onClick={handleSwLap}
                 disabled={!swRunning}
                 className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-[#e89f71] hover:bg-white/10 transition-all flex items-center justify-center disabled:opacity-30"
               >
                  <Flag size={24} />
               </button>
            ) : (
               <div className="w-16 h-16"></div> // Spacer
            )}
         </div>
      </div>

      {/* Mode Specific Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
         
         {/* LEFT PANEL: Presets or Laps */}
         <div className="glass-card p-8 rounded-[40px] border border-white/5 h-[320px] flex flex-col">
            {activeMode === 'focus' ? (
              <>
                <div className="flex items-center gap-3 mb-6 text-gray-400">
                   <Zap size={18} />
                   <h3 className="text-sm font-bold uppercase tracking-widest">Rapid Presets</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2">
                   {[
                     { m: 5, l: 'Quick Sketch', t: 'Gesture Warmup' },
                     { m: 25, l: 'Pomodoro', t: 'Standard Focus' },
                     { m: 45, l: 'Deep Dive', t: 'Complex Problem' },
                     { m: 60, l: 'Studio Hour', t: 'Rendering' },
                     { m: 180, l: 'Full Mock', t: 'Exam Sim' }
                   ].map((preset) => (
                     <button
                       key={preset.m}
                       onClick={() => setTimerPreset(preset.m)}
                       className={`p-4 rounded-[24px] border text-left transition-all group ${timerInputMinutes === preset.m ? 'bg-[#7c9473]/20 border-[#7c9473]' : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}
                     >
                        <span className={`block text-2xl font-outfit font-bold mb-1 ${timerInputMinutes === preset.m ? 'text-[#7c9473]' : 'text-white'}`}>{preset.m}m</span>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-300">{preset.l}</span>
                     </button>
                   ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 text-gray-400">
                   <History size={18} />
                   <h3 className="text-sm font-bold uppercase tracking-widest">Lap Velocity</h3>
                </div>
                {laps.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-2">
                     <Flag size={24} className="opacity-20" />
                     <p className="text-xs font-medium">No markers recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
                     {laps.map((lap, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-[20px] border border-white/5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mark {laps.length - i}</span>
                          <span className="font-mono font-bold text-[#e89f71]">{formatSwTime(lap).main}{formatSwTime(lap).sub}</span>
                       </div>
                     ))}
                  </div>
                )}
              </>
            )}
         </div>

         {/* RIGHT PANEL: Stats / Info */}
         <div className="glass-card p-8 rounded-[40px] border border-white/5 h-[320px] flex flex-col justify-center items-center text-center space-y-6">
            {activeMode === 'focus' ? (
               <>
                  <div className="w-16 h-16 rounded-2xl bg-[#7c9473]/10 flex items-center justify-center text-[#7c9473] border border-[#7c9473]/20 animate-float">
                     <Bell size={32} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white font-outfit">Acoustic Signal</h3>
                     <p className="text-sm text-gray-500 max-w-xs mx-auto">A gentle chime will sound when the cycle completes. Designed to break hyperfocus without shock.</p>
                  </div>
                  <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#7c9473] animate-pulse"></div>
                     <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest">System Ready</span>
                  </div>
               </>
            ) : (
               <>
                  <div className="w-16 h-16 rounded-2xl bg-[#e89f71]/10 flex items-center justify-center text-[#e89f71] border border-[#e89f71]/20 animate-float">
                     <Zap size={32} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold text-white font-outfit">Speed Drills</h3>
                     <p className="text-sm text-gray-500 max-w-xs mx-auto">Use Velocity mode for rapid gesture drawing (30s) or solving NAT questions under pressure.</p>
                  </div>
               </>
            )}
         </div>

      </div>
    </div>
  );
};

export default TimerBuddy;
