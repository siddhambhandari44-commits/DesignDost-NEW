
import React from 'react';
import { Info, User, Target, Heart, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in duration-1000 pb-20">
      {/* Header Section */}
      <section className="text-center space-y-6 reveal">
        <div className="inline-flex items-center gap-3 bg-[#7c9473]/10 border border-[#7c9473]/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] text-[#7c9473] mb-4">
          <Info size={14} />
          Mission Protocol
        </div>
        <h1 className="text-5xl md:text-7xl font-outfit font-extrabold text-white tracking-tighter leading-none">
          Inside <br />
          <span className="gradient-text">DesignDost.</span>
        </h1>
        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
          A peer-to-peer connection designed to simplify the design entrance journey.
        </p>
      </section>

      {/* Origin Story Card */}
      <section className="relative group reveal" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-[64px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative glass-card p-12 md:p-20 rounded-[64px] border border-white/5 space-y-12">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-16 h-16 bg-[#7c9473] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-12 transition-transform">
              < Zap size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-outfit font-bold text-white tracking-tight">The Maker's Philosophy</h2>
              <p className="text-[#7c9473] text-[10px] font-bold uppercase tracking-widest mt-1">Student-to-Student Initiative</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg leading-relaxed font-medium text-gray-400">
            <div className="space-y-6">
              <p>
                Design prep shouldn't feel like navigating a black hole. As a student who faced the chaos of UCEED preparation, I realized most tools were either legacy systems or overpriced archives.
              </p>
              <p>
                <span className="text-white">DesignDost</span> was born out of a simple necessity: a clean, high-precision environment where logic and creativity coexist.
              </p>
            </div>
            <div className="space-y-6">
              <p>
                Every feature—from the <span className="text-[#7c9473]">Mitra AI</span> liaison to the <span className="text-[#e89f71]">Chronos Module</span>—is engineered by a peer who understands the pressure of the 180-minute simulation.
              </p>
              <div className="pt-6 border-t border-white/5">
                <blockquote className="italic text-white/60 text-base">
                  "Built by someone who's exactly where you are, for everyone who wants to go where they dream."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal" style={{ animationDelay: '0.4s' }}>
        <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-6 hover:border-[#7c9473]/30 transition-all">
          <Target className="text-[#7c9473]" size={32} />
          <h3 className="font-outfit font-bold text-white text-xl">Precision</h3>
          <p className="text-sm text-gray-500 font-medium">Focusing on high-yield visual logic and spatial reasoning protocols that actually appear in exams.</p>
        </div>
        <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-6 hover:border-[#e89f71]/30 transition-all">
          <Heart className="text-[#e89f71]" size={32} />
          <h3 className="font-outfit font-bold text-white text-xl">Empathy</h3>
          <p className="text-sm text-gray-500 font-medium">Designed with student eye-comfort and mental flow in mind. No clutter, just core preparation.</p>
        </div>
        <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-6 hover:border-blue-400/30 transition-all">
          <Sparkles className="text-blue-400" size={32} />
          <h3 className="font-outfit font-bold text-white text-xl">Intelligence</h3>
          <p className="text-sm text-gray-500 font-medium">Leveraging the latest AI models to provide instant, expert-level drawing critique and logic trace.</p>
        </div>
      </section>

      {/* Footer Identity */}
      <section className="text-center pt-10 reveal" style={{ animationDelay: '0.6s' }}>
         <div className="inline-flex items-center gap-4 bg-white/[0.03] px-8 py-4 rounded-3xl border border-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7c9473] to-[#4b5d44] rounded-lg flex items-center justify-center text-white">
               <User size={16} />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Designed for students. By a student.</span>
         </div>
      </section>
    </div>
  );
};

export default About;
