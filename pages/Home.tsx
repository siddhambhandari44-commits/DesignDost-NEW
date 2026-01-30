
import React, { useState, useEffect } from 'react';
import { EXAM_DATES } from '../constants';
import CountdownTimer from '../components/CountdownTimer';
import { ArrowRight, Terminal, Cpu, Zap, Sparkles, Activity, HelpCircle, Eye } from 'lucide-react';

const Home: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [dailyTip, setDailyTip] = useState("Observation is the primary tool of a designer. Look for the 'why' in every product.");
  const [showRiddle, setShowRiddle] = useState(false);

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="stagger-reveal">
          <div style={{ animationDelay: '0.1s' }} className="flex flex-col items-start gap-4 mb-12">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 group cursor-default hover:border-[#7c9473]/30 transition-colors">
              <Cpu size={14} className="text-[#7c9473] animate-pulse group-hover:scale-125 transition-transform" />
              <span className="opacity-80 group-hover:opacity-100 transition-opacity">Protocol v3.5 Interface Active</span>
            </div>
            <p className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.45em] ml-1 opacity-70">
              Designed for students. By a student.
            </p>
          </div>

          <h1 style={{ animationDelay: '0.2s' }} className="text-7xl md:text-9xl font-outfit font-extrabold leading-[0.85] mb-10 tracking-tighter group cursor-default">
            Evolve Your <br />
            <span className="gradient-text glitch-text group-hover:opacity-90" data-text="Perspective.">Perspective.</span>
          </h1>

          <div style={{ animationDelay: '0.3s' }} className="max-w-xl space-y-8 text-gray-400 text-xl leading-relaxed mb-16">
            <p className="opacity-80 hover:opacity-100 transition-opacity duration-500">
              A peer-engineered cognitive suite for India's design aspirants.
              <span className="text-white font-medium"> DesignDost</span> is where logic meets visual intelligence.
            </p>
          </div>

          <div style={{ animationDelay: '0.4s' }} className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={onStart}
              className="apple-btn flex items-center justify-center gap-4 px-12 py-6 bg-[#7c9473] text-white rounded-2xl font-bold text-lg shadow-[0_20px_40px_rgba(124,148,115,0.25)] hover:shadow-[0_25px_50px_rgba(124,148,115,0.4)] group transition-all hover:scale-[1.02]"
            >
              Initiate Interface
              <ArrowRight size={22} className="transition-transform duration-500 group-hover:translate-x-2" />
            </button>
            
            <div className="flex items-center gap-5 px-10 py-6 border border-white/10 bg-white/[0.02] rounded-2xl transition-all hover:bg-white/[0.05] hover:border-white/20 cursor-default group">
               <Activity size={20} className="text-[#e89f71] group-hover:scale-110 transition-transform" />
               <span className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest">System Sync: Stable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spatial Pulse & Daily Intel Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal" style={{ animationDelay: '0.5s' }}>
        {/* Daily Intel Stripe */}
        <div className="glass-card p-10 rounded-[40px] border-l-4 border-l-[#7c9473] flex items-center gap-8 shadow-2xl relative overflow-hidden group hover:bg-white/[0.07] transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={80} />
          </div>
          <div className="w-16 h-16 bg-[#7c9473]/10 rounded-2xl flex items-center justify-center text-[#7c9473] flex-shrink-0 shadow-inner group-hover:rotate-12 transition-transform">
             <Terminal size={32} />
          </div>
          <div className="space-y-1">
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] mb-1 block">Liaison Daily Intel</span>
             <p className="text-xl font-medium text-white italic leading-snug tracking-tight">"{dailyTip}"</p>
          </div>
        </div>

        {/* Spatial Pulse Challenge */}
        <div className="glass-card p-10 rounded-[40px] border border-[#e89f71]/20 flex items-center gap-8 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-[#e89f71]/40 transition-all" onClick={() => setShowRiddle(!showRiddle)}>
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <HelpCircle size={80} />
           </div>
           <div className="w-16 h-16 bg-[#e89f71]/10 rounded-2xl flex items-center justify-center text-[#e89f71] flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
              <Eye size={32} />
           </div>
           <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] mb-1 block">Spatial Pulse Challenge</span>
              {showRiddle ? (
                <div className="animate-in fade-in duration-500">
                  <p className="text-lg font-bold text-white tracking-tight">Count the faces of an octahedron that are not visible when resting on a base.</p>
                  <p className="text-[10px] text-[#e89f71] font-bold uppercase tracking-widest mt-2 animate-pulse">Solution: 1 base face + obscured sides.</p>
                </div>
              ) : (
                <p className="text-xl font-medium text-gray-400 leading-snug tracking-tight group-hover:text-white transition-colors">Tap to initialize the daily spatial logic riddle.</p>
              )}
           </div>
        </div>
      </section>

      {/* Countdown Grid */}
      <section className="relative reveal" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-center gap-6 mb-12">
           <h2 className="text-3xl font-outfit font-bold tracking-tight text-white">Simulated Deadlines</h2>
           <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {EXAM_DATES.map((exam, i) => (
            <div key={exam.id} className="reveal" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
              <CountdownTimer exam={exam} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
