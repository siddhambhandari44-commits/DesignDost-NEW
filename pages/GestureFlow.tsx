
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Image as ImageIcon, CheckCircle, ChevronLeft, RefreshCw, X, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import CognitiveDeconstruction from '../components/CognitiveDeconstruction';

interface GestureFlowProps {
  onBack: () => void;
}

// Curated list of full-body dynamic human poses for gesture drawing
const HUMAN_POSES = [
  'https://images.unsplash.com/photo-1515234503113-d64e6d42654c?q=80&w=1000&auto=format&fit=crop', // Jump/Parkour
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop', // Ballet Stretch
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop', // Fitness Lunge
  'https://images.unsplash.com/photo-1515965885361-f1e0095517ea?q=80&w=1000&auto=format&fit=crop', // Heroic Stance
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop', // Athletic Run
  'https://images.unsplash.com/photo-1507369512168-9b7de6df6fc2?q=80&w=1000&auto=format&fit=crop', // Yoga Balance
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop', // Dancer Arch
  'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop', // Dynamic Running
  'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?q=80&w=1000&auto=format&fit=crop', // Pilates Stretch
  'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?q=80&w=1000&auto=format&fit=crop', // Martial Arts Kick
  'https://images.unsplash.com/photo-1500468770786-91e8bf339994?q=80&w=1000&auto=format&fit=crop', // Leaping
  'https://images.unsplash.com/photo-1541604085-30932c0d60c4?q=80&w=1000&auto=format&fit=crop', // Relaxed Sitting
  'https://images.unsplash.com/photo-1620358872244-1d019d356d48?q=80&w=1000&auto=format&fit=crop', // Dynamic Crouch
  'https://images.unsplash.com/photo-1562916174-54c72877684a?q=80&w=1000&auto=format&fit=crop', // Stretching
  'https://images.unsplash.com/photo-1527933053326-89d1746d76b9?q=80&w=1000&auto=format&fit=crop', // Climber Reach
];

// Simple beep sound for interval switch
const BEEP_SOUND = "data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Short blip

const GestureFlow: React.FC<GestureFlowProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [imagesSeen, setImagesSeen] = useState<number[]>([]);
  const [showCDM, setShowCDM] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(BEEP_SOUND);
    audioRef.current.volume = 0.3;
  }, []);

  const getRandomPoseIndex = () => {
    // Simple randomizer that tries to avoid immediate repeats
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * HUMAN_POSES.length);
    } while (newIndex === currentPoseIndex && HUMAN_POSES.length > 1);
    return newIndex;
  };

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
  };

  const startFlow = () => {
    const firstIndex = getRandomPoseIndex();
    setCurrentPoseIndex(firstIndex);
    setImagesSeen([firstIndex]);
    setTimeLeft(duration);
    setIsActive(true);
    
    // Request fullscreen
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(e => console.log(e));
      }
    }
  };

  const stopFlow = () => {
    setIsActive(false);
    setShowCDM(true); // Trigger reflection
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }
  };

  const nextPose = () => {
    playSound();
    const nextIndex = getRandomPoseIndex();
    setCurrentPoseIndex(nextIndex);
    setImagesSeen(prev => [...prev, nextIndex]);
    setTimeLeft(duration);
  };

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            nextPose();
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, duration]); // We don't depend on currentPoseIndex to avoid resetting interval on render

  // Handle Fullscreen change listeners to sync state if user presses Esc
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {showCDM && (
        <CognitiveDeconstruction 
          taskType="Gesture" 
          onComplete={() => setShowCDM(false)}
        />
      )}

      {/* Configuration View */}
      {!isActive && (
        <>
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all font-bold text-sm group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl border transition-all ${soundEnabled ? 'bg-[#7c9473]/10 border-[#7c9473] text-[#7c9473]' : 'bg-white/5 border-white/10 text-gray-500'}`}
               >
                 {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
               </button>
            </div>
          </div>

          <div className="glass-card p-12 md:p-16 rounded-[60px] border border-white/5 text-center space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
               <Maximize2 size={120} />
            </div>
            
            <div className="w-24 h-24 bg-gradient-to-br from-[#7c9473] to-[#4b5d44] text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl animate-float">
               <ImageIcon size={48} />
            </div>

            <div className="space-y-4 relative">
              <h1 className="text-4xl font-outfit font-extrabold text-white tracking-tighter">Gesture Flow</h1>
              <p className="text-gray-500 max-w-lg mx-auto font-medium">
                Rapid-fire human anatomy references. Capture the line of action, balance, and weight. The system will auto-switch images to force speed.
              </p>
            </div>

            <div className="space-y-6">
               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] block">Interval Duration</span>
               <div className="flex justify-center flex-wrap gap-4">
                  {[15, 30, 60, 90].map(s => (
                    <button 
                      key={s} 
                      onClick={() => { setDuration(s); setTimeLeft(s); }} 
                      className={`px-8 py-4 rounded-[24px] border-2 transition-all font-bold text-sm ${duration === s ? 'bg-white text-gray-900 border-white shadow-xl scale-110' : 'bg-white/[0.03] text-gray-600 border-white/5 hover:border-white/20'}`}
                    >
                      {s}s
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={startFlow} 
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-4 py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl shadow-[0_20px_40px_rgba(124,148,115,0.2)] hover:-translate-y-2 transition-all active:scale-95"
            >
              <Play size={24} fill="currentColor" /> Initialize Flow
            </button>
            
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Note: Enters Fullscreen Mode
            </p>
          </div>
        </>
      )}

      {/* Active Fullscreen View */}
      <div 
        ref={containerRef} 
        className={`fixed inset-0 bg-black z-[2000] flex flex-col items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {isActive && (
          <>
            {/* Main Reference Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10">
              <img 
                key={HUMAN_POSES[currentPoseIndex]} // Key forces re-render for animation
                src={HUMAN_POSES[currentPoseIndex]} 
                alt="Gesture Reference" 
                className="w-full h-full object-contain animate-in fade-in duration-300"
              />
            </div>

            {/* Minimal HUD */}
            <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
               <div className="px-5 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Pose {imagesSeen.length}
               </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button 
                onClick={stopFlow}
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timer Bar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 w-full max-w-md px-6">
               <div className="text-6xl font-outfit font-black text-white/20 select-none pointer-events-none">
                  {timeLeft}
               </div>
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7c9473] transition-all duration-1000 linear"
                    style={{ width: `${(timeLeft / duration) * 100}%` }}
                  ></div>
               </div>
               <div className="flex gap-4">
                  <button onClick={nextPose} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md transition-all">
                     Skip
                  </button>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className={`px-4 py-2 rounded-full text-white/50 hover:text-white transition-all ${soundEnabled ? '' : 'opacity-50'}`}>
                     {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GestureFlow;
