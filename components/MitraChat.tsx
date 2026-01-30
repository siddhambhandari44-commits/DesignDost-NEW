import React, { useState, useRef, useEffect } from 'react';
import { X, Send, BrainCircuit, ToggleLeft, ToggleRight } from 'lucide-react';
import { ChatMessage, SessionResult } from '../types';
import { chatWithMitra } from '../services/geminiService';
import MitraMascot from './MitraMascot';

interface MitraChatProps {
  userName: string;
  history: SessionResult[];
}

const MitraChat: React.FC<MitraChatProps> = ({ userName, history }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [introState, setIntroState] = useState<'idle' | 'flying-in' | 'waving' | 'docking' | 'docked'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger intro animation on mount
  useEffect(() => {
    setIntroState('flying-in');
    
    // Sequence:
    // 1. Flight to center (0.8s)
    const flightTimer = setTimeout(() => setIntroState('waving'), 800);
    // 2. Wave (1.5s duration)
    const waveTimer = setTimeout(() => setIntroState('docking'), 2300);
    // 3. Docking to corner (0.8s duration)
    const dockTimer = setTimeout(() => setIntroState('docked'), 3100);

    return () => {
      clearTimeout(flightTimer);
      clearTimeout(waveTimer);
      clearTimeout(dockTimer);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithMitra(userName, history, messages, input, useThinking);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Liaison link disrupted. Attempting to re-establish connection..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const initialGreeting = () => {
    if (messages.length === 0) {
      const greeting = history.length > 0 
        ? `Performance metrics analyzed. I've optimized your trajectory, ${userName}. Ready to advance?`
        : `Interface connection established. I am Mitra, your design study liaison. Shall we map out your creative evolution, ${userName}?`;
      setMessages([{ role: 'model', text: greeting }]);
    }
  };

  // Determine styles for the mascot button based on intro state
  const getIntroStyles = () => {
    if (introState === 'flying-in') {
      return { top: '-20%', left: '-20%', transform: 'scale(1.5)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' };
    }
    if (introState === 'waving') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(2)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' };
    }
    if (introState === 'docking') {
      return { bottom: '2.5rem', right: '2.5rem', transform: 'scale(1)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' };
    }
    return {}; // Docked or Idle uses fixed bottom-right classes
  };

  const isAnimatingIntro = introState !== 'docked' && introState !== 'idle';

  return (
    <div className={`fixed z-[60] ${!isAnimatingIntro ? 'bottom-6 right-6 md:bottom-10 md:right-10' : ''}`} style={isAnimatingIntro ? getIntroStyles() : {}}>
      {/* Floating Mascot Button */}
      <button
        onClick={() => {
          if (isAnimatingIntro) return; // Disable clicking during intro
          setIsOpen(!isOpen);
          if (!isOpen) initialGreeting();
        }}
        className={`w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95 group relative ${isOpen ? 'bg-white shadow-2xl' : 'bg-transparent'}`}
      >
        {!isOpen && (
           <div className="absolute inset-0 bg-[#7c9473]/10 rounded-[32px] blur-2xl group-hover:bg-[#7c9473]/20 transition-all duration-700"></div>
        )}
        
        {isOpen ? (
          <X size={32} className="text-gray-900" />
        ) : (
          <MitraMascot 
            size={window.innerWidth < 768 ? 72 : 88} 
            isThinking={isTyping} 
            isOpen={isOpen} 
            isWaving={introState === 'waving'} 
          />
        )}

        {!isOpen && messages.length === 0 && introState === 'docked' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full border-4 border-[#07080a] animate-bounce shadow-lg"></div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[calc(100vw-3rem)] md:w-[480px] h-[500px] md:h-[700px] max-h-[80vh] glass-card rounded-[40px] md:rounded-[48px] border border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#7c9473] via-[#5a6b53] to-[#4b5d44] p-6 md:p-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
            {/* Ambient Background Glow in Header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full"></div>
            
            <div className="flex items-center gap-4 md:gap-6 relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-inner">
                <MitraMascot size={window.innerWidth < 768 ? 40 : 52} isThinking={isTyping} isOpen={true} />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-xl md:text-2xl tracking-tighter">Mitra AI</h3>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_12px_#4ade80]"></div>
                   <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Connected</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setUseThinking(!useThinking)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500 relative z-10 ${useThinking ? 'bg-white/20 border-white/40 text-white shadow-lg' : 'bg-black/20 border-white/10 text-white/40 hover:text-white/70'}`}
            >
              <BrainCircuit size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Deep Think</span>
              {useThinking ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-[#07080a]/40">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} reveal`} style={{ animationDelay: '0.1s' }}>
                <div className={`max-w-[90%] p-5 md:p-6 rounded-[24px] md:rounded-[32px] text-sm md:text-base leading-relaxed transition-all shadow-sm whitespace-pre-wrap break-words ${
                  msg.role === 'user' 
                    ? 'bg-white text-gray-900 font-bold rounded-tr-none shadow-xl' 
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[24px] md:rounded-[32px] rounded-tl-none flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7c9473] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#7c9473] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#7c9473] rounded-full animate-bounce delay-200"></div>
                  {useThinking && <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest ml-2 animate-pulse">Computing...</span>}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-6 md:p-8 bg-[#07080a]/60 border-t border-white/5 flex gap-3 md:gap-4 backdrop-blur-xl flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={useThinking ? "Deep query..." : "Ask Mitra..."}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-[20px] md:rounded-[24px] px-6 py-4 text-sm text-white focus:ring-4 focus:ring-[#7c9473]/10 focus:border-[#7c9473]/30 transition-all outline-none placeholder:text-gray-600"
            />
            <button
              disabled={!input.trim() || isTyping}
              type="submit"
              className="apple-btn w-12 h-12 md:w-16 md:h-16 bg-white text-gray-900 rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-xl disabled:opacity-10"
            >
              <Send size={20} className="text-gray-900" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MitraChat;