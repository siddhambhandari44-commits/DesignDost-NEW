
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, Zap, Target, CheckCircle2, XCircle, ScanLine, AlertCircle, ChevronLeft, Grid, Aperture, Maximize2, Layers, BookOpen, Search, Loader2, ArrowRight } from 'lucide-react';
import { generateLensMission, analyzeLensCapture, LensMission } from '../services/geminiService';

const WorldLens: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mission, setMission] = useState<LensMission | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Study'>('Medium');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; feedback: string; xp: number; score: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Enable permissions to capture, but you can still read the mission below.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const initMission = async (forcedDifficulty?: 'Easy' | 'Medium' | 'Hard' | 'Study') => {
    setIsGenerating(true);
    const levelToUse = forcedDifficulty || difficulty;
    
    setMission(null);
    setResult(null);
    setCapturedImage(null);
    setError(null);
    setIsCameraActive(false);
    
    const newMission = await generateLensMission(levelToUse);
    setMission(newMission);
    setIsGenerating(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const analyze = async () => {
    if (!capturedImage || !mission) return;
    setIsAnalyzing(true);
    
    const base64Data = capturedImage.split(',')[1];
    const analysis = await analyzeLensCapture(base64Data, mission);
    
    setResult(analysis);
    setIsAnalyzing(false);
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  // 1. Loading State
  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050608] flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in overflow-hidden w-full h-full">
        <div className="relative">
           <div className="absolute inset-0 bg-[#7c9473]/20 blur-2xl rounded-full animate-pulse"></div>
           <Loader2 size={64} className="text-[#7c9473] animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2 max-w-sm mx-auto">
           <h2 className="text-2xl font-outfit font-bold text-white tracking-tight">Acquiring Target...</h2>
           <p className="text-gray-500 text-sm">Synthesizing visual directive from design matrix.</p>
        </div>
      </div>
    );
  }

  // 2. Landing State (No Mission) - Use scrollable container to prevent clipping
  if (!mission) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050608] overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
        <div className="min-h-full w-full flex flex-col items-center justify-center p-6 md:p-12">
          <div className="max-w-xl w-full space-y-12 relative">
            <button 
              onClick={onBack} 
              className="absolute top-0 left-0 -translate-y-[140%] flex items-center gap-2 text-gray-500 hover:text-white transition-colors py-2"
            >
              <ChevronLeft size={20} /> Abort
            </button>

            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-[#7c9473]/10 rounded-full flex items-center justify-center mx-auto border border-[#7c9473]/30 shadow-[0_0_30px_rgba(124,148,115,0.2)]">
                <Aperture size={48} className="text-[#7c9473] animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-white tracking-tighter">World Lens</h1>
                <p className="text-gray-500 font-medium mt-3 text-lg">Calibrate your visual sensors.<br/>Select your clearance level.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-6 rounded-[24px] border transition-all duration-300 relative overflow-hidden group ${difficulty === level ? 'bg-[#7c9473] border-[#7c9473] text-white shadow-xl scale-105' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                  >
                    <div className="relative z-10 text-center space-y-2">
                       <span className="text-xs font-bold uppercase tracking-widest block">{level === 'Easy' ? 'Cadet' : level === 'Medium' ? 'Scout' : 'Visionary'}</span>
                       <div className="text-xs opacity-60 font-mono">Lvl {level === 'Easy' ? '1' : level === 'Medium' ? '2' : '3'}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => initMission('Study')}
                className="w-full p-6 bg-white/[0.03] border border-white/10 rounded-[24px] flex items-center justify-between group hover:bg-[#7c9473]/10 hover:border-[#7c9473]/30 transition-all"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#7c9473] group-hover:bg-[#7c9473]/20 transition-all">
                       <BookOpen size={24} />
                    </div>
                    <div className="text-left">
                       <span className="text-sm font-bold text-white block group-hover:text-[#7c9473] transition-colors">Scan Study Environment</span>
                       <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Desk Object Hunt</span>
                    </div>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#7c9473] group-hover:text-white transition-all">
                    <Search size={18} />
                 </div>
              </button>
            </div>

            <button
              onClick={() => initMission()}
              className="w-full py-6 bg-white text-[#050608] rounded-[32px] font-bold text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              <ScanLine size={24} /> Initialize Lens
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Briefing State
  if (mission && !isCameraActive && !capturedImage && !error) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050608] overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
        <div className="min-h-full w-full flex flex-col items-center justify-center p-6 md:p-12">
          <div className="max-w-md w-full space-y-10 relative">
            <button onClick={() => setMission(null)} className="absolute top-0 left-0 -translate-y-[140%] flex items-center gap-2 text-gray-500 hover:text-white transition-colors py-2">
              <ChevronLeft size={20} /> Abort
            </button>

            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    mission.difficulty === 'Study' ? 'bg-[#7c9473]/10 border-[#7c9473]/30 text-[#7c9473]' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    {mission.difficulty} Clearance
                  </div>
                  <div className="flex items-center gap-2 text-[#e89f71]">
                     <Target size={14} className="animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Target Locked</span>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-4xl font-outfit font-extrabold text-white tracking-tighter leading-none">{mission.title}</h1>
                  <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-2xl">
                     <p className="text-xl text-gray-200 font-medium leading-relaxed">"{mission.brief}"</p>
                  </div>
               </div>

               <div className="p-4 bg-[#7c9473]/5 border border-[#7c9473]/20 rounded-2xl flex items-start gap-3">
                  <Search size={20} className="text-[#7c9473] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                     <span className="text-white font-bold block mb-1">Directive:</span>
                     Locate this object in your environment. When you are ready to capture, engage the lens.
                  </p>
               </div>
            </div>

            <button
              onClick={startCamera}
              className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(124,148,115,0.3)] flex items-center justify-center gap-4 group"
            >
              <ScanLine size={24} /> 
              Engage Lens
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Viewport
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden w-full h-full">
      {/* ---------------- VIEWPORT (Bottom Layer) ---------------- */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#1a1c23] z-0">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`absolute inset-0 w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {capturedImage && (
           <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" />
        )}

        {isAnalyzing && (
           <div className="absolute inset-0 z-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#7c9473] shadow-[0_0_50px_#7c9473] animate-scan-laser"></div>
              <div className="absolute inset-0 bg-[#7c9473]/10"></div>
              <div className="absolute center-absolute flex flex-col items-center gap-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <div className="w-16 h-16 border-t-2 border-l-2 border-[#7c9473] animate-spin rounded-full"></div>
                 <span className="bg-black/60 px-4 py-1 rounded-full text-[#7c9473] text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Analyzing Geometry</span>
              </div>
           </div>
        )}
      </div>

      {/* ---------------- HUD OVERLAY (Top Layer) ---------------- */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
        
        <div className="flex items-start justify-between pointer-events-auto">
           <button onClick={() => { setMission(null); stopCamera(); }} className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </button>
           
           <div className="flex items-start gap-4">
              <div className="hidden md:flex flex-col items-end text-[10px] font-mono text-[#7c9473] gap-1 opacity-80">
                 <span>ISO 800</span>
                 <span>f/2.4</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">REC</span>
                 </div>
                 <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{mission?.category}</span>
                 </div>
              </div>
           </div>
        </div>

        {isCameraActive && !capturedImage && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {showGrid && (
                 <div className="absolute inset-0 w-full h-full opacity-20">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
                    <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white"></div>
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
                    <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white"></div>
                 </div>
              )}
              
              <div className="relative w-64 h-64 border border-white/30 rounded-lg animate-pulse-slow">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#7c9473]"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#7c9473]"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#7c9473]"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#7c9473]"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="text-white/50" size={24} />
                 </div>
              </div>
           </div>
        )}

        <div className="pointer-events-auto space-y-6 w-full max-w-md mx-auto relative z-30">
           {mission && !capturedImage && !error && (
             <div className="glass-card p-6 rounded-[24px] border-l-4 border-l-[#7c9473] bg-black/80 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-700 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                   <p className="text-[9px] text-[#7c9473] font-bold uppercase tracking-[0.2em]">Active Directive</p>
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{mission.difficulty}</p>
                </div>
                <h3 className="text-xl font-bold text-white font-outfit leading-tight mb-2">{mission.title}</h3>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">"{mission.brief}"</p>
             </div>
           )}

           <div className="flex items-center justify-center gap-8">
             {!capturedImage && (
               <>
                 <button onClick={() => setShowGrid(!showGrid)} className="p-3 bg-black/40 rounded-full text-white/70 hover:text-white border border-white/10 backdrop-blur-md">
                   <Grid size={20} />
                 </button>
                 {!error && (
                   <button 
                    onClick={captureImage}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] bg-white/10 backdrop-blur-sm"
                   >
                      <div className="w-16 h-16 bg-white rounded-full"></div>
                   </button>
                 )}
                 <button className="p-3 bg-black/40 rounded-full text-white/70 border border-white/10 opacity-50 cursor-not-allowed backdrop-blur-md">
                   <Layers size={20} />
                 </button>
               </>
             )}

             {capturedImage && !result && (
                <div className="flex gap-4 w-full animate-in slide-in-from-bottom-4">
                   <button 
                    onClick={reset}
                    disabled={isAnalyzing}
                    className="flex-1 py-4 bg-black/60 backdrop-blur-md rounded-[24px] font-bold text-white border border-white/10 hover:bg-white/10 transition-all"
                   >
                      Retake
                   </button>
                   <button 
                    onClick={analyze}
                    disabled={isAnalyzing}
                    className="flex-1 py-4 bg-[#7c9473] rounded-[24px] font-bold text-white shadow-xl hover:bg-[#6b8263] transition-all flex items-center justify-center gap-2"
                   >
                      {isAnalyzing ? <RefreshCcw className="animate-spin" size={20} /> : <Zap size={20} />}
                      {isAnalyzing ? 'Processing...' : 'Analyze Intel'}
                   </button>
                </div>
             )}
           </div>
        </div>
      </div>

      {error && mission && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 space-y-8 pointer-events-auto bg-black/80 backdrop-blur-sm">
           <div className="text-red-400 flex flex-col items-center gap-4 p-6 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-sm text-center shadow-2xl backdrop-blur-xl">
              <AlertCircle size={48} /> 
              <span className="font-bold text-sm">{error}</span>
           </div>
           <div className="glass-card p-8 rounded-[32px] border-l-4 border-l-[#7c9473] bg-[#050608] shadow-2xl max-w-sm w-full">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[10px] text-[#7c9473] font-bold uppercase tracking-[0.2em]">Active Directive</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{mission.difficulty}</p>
                </div>
                <h3 className="text-2xl font-bold text-white font-outfit leading-tight mb-3">{mission.title}</h3>
                <p className="text-base text-gray-300 font-medium leading-relaxed">"{mission.brief}"</p>
                <div className="mt-6 pt-6 border-t border-white/10">
                   <p className="text-xs text-gray-500 italic">"Camera functionality is optional for training observation skills."</p>
                </div>
           </div>
           <button onClick={onBack} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-all">Return to Base</button>
        </div>
      )}

      {result && (
         <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-500 overflow-y-auto">
            <div className="glass-card max-w-md w-full p-8 md:p-10 rounded-[48px] border border-white/10 text-center space-y-8 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <div className="absolute top-0 right-0 p-10 opacity-5"><Maximize2 size={120} /></div>
               <div className="relative">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${result.success ? 'bg-green-500/10 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
                    {result.success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
                 </div>
                 {result.success && (
                   <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Target Acquired</div>
                 )}
               </div>
               <div className="space-y-3">
                  <h2 className="text-4xl font-outfit font-extrabold text-white tracking-tight">{result.score}<span className="text-lg text-gray-500">/100</span></h2>
                  <p className="text-gray-300 text-sm leading-relaxed font-medium border-t border-white/10 pt-4">"{result.feedback}"</p>
               </div>
               {result.success && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="py-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">XP Gained</span>
                        <span className="text-xl font-outfit font-bold text-[#7c9473]">+{result.xp}</span>
                     </div>
                     <div className="py-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Accuracy</span>
                        <span className="text-xl font-outfit font-bold text-white">High</span>
                     </div>
                  </div>
               )}
               <div className="flex flex-col gap-3 pt-4">
                  <button onClick={() => initMission()} className="w-full py-4 bg-white text-gray-900 rounded-[28px] font-bold shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest">Next Mission</button>
                  <button onClick={onBack} className="w-full py-4 bg-white/5 text-gray-500 rounded-[28px] font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Return to Base</button>
               </div>
            </div>
         </div>
      )}

      <style>{`
        @keyframes scan-laser { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-laser { animation: scan-laser 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default WorldLens;
