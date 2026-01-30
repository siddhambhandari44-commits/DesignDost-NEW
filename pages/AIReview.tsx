
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, RefreshCcw, Send, AlertCircle, CheckCircle2, BrainCircuit, Target, Star, Bookmark, BookmarkCheck, Sliders, Cpu } from 'lucide-react';
import { analyzeDrawing } from '../services/geminiService';
import { ExhibitItem } from '../types';

const EXHIBIT_STORAGE_KEY = 'designdost_exhibit';

const AIReview: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  
  const [temperature, setTemperature] = useState(0.7);
  const [showTuning, setShowTuning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasFullscreenRef = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size exceeds 10MB. Please upload a smaller file.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setFeedback(null);
      setIsPinned(false);

      if (wasFullscreenRef.current) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn("Failed to restore fullscreen:", err);
        });
        wasFullscreenRef.current = false;
      }
    }
  };

  const handleUploadClick = () => {
    wasFullscreenRef.current = !!document.fullscreenElement;
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setFeedback(null);
    setError(null);
    setUserPrompt('');
    setIsPinned(false);
  };

  const handleSubmit = async () => {
    if (!previewUrl) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = previewUrl.split(',')[1];
      const mimeType = previewUrl.split(';')[0].split(':')[1];
      const result = await analyzeDrawing(base64Data, mimeType, userPrompt);
      setFeedback(result);
    } catch (err) {
      setError("Failed to analyze the drawing. Creative connection unstable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePinToExhibit = () => {
    if (!feedback || !previewUrl || isPinned) return;

    const scoreMatch = feedback.match(/SCORE ESTIMATE: (.*?)\//);
    const score = scoreMatch ? scoreMatch[1] : 'N/A';

    const newItem: ExhibitItem = {
      id: Date.now().toString(),
      imageUrl: previewUrl,
      prompt: userPrompt || 'General Practice',
      critique: feedback,
      score: score,
      date: new Date().toISOString()
    };

    const saved = localStorage.getItem(EXHIBIT_STORAGE_KEY);
    const exhibit = saved ? JSON.parse(saved) : [];
    localStorage.setItem(EXHIBIT_STORAGE_KEY, JSON.stringify([newItem, ...exhibit]));
    setIsPinned(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white font-outfit tracking-tight">AI Art Intel</h1>
          <p className="text-gray-500">Upload sketches for high-precision design critique.</p>
        </div>
        <button 
          onClick={() => setShowTuning(!showTuning)}
          className={`p-4 rounded-2xl border transition-all ${showTuning ? 'bg-[#7c9473] text-white border-[#7c9473]' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'}`}
          title="Neural Parameters"
        >
          <Sliders size={20} />
        </button>
      </div>

      {showTuning && (
        <div className="glass-card p-8 rounded-[32px] border border-[#7c9473]/20 bg-[#7c9473]/05 animate-in slide-in-from-top-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={14} /> Creativity Temp
                 </span>
                 <span className="text-xs font-bold text-white">{temperature}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={temperature} 
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7c9473]"
              />
              <p className="text-[9px] text-gray-600 leading-relaxed italic">Higher values result in more diverse, abstract critique nodes.</p>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest flex items-center gap-2">
                    <BrainCircuit size={14} /> Model Protocol
                 </span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs font-bold text-gray-500 flex items-center justify-between">
                 <span>gemini-3-pro-preview</span>
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              </div>
              <p className="text-[9px] text-gray-600 leading-relaxed italic">Currently utilizing the highest-fidelity vision model for spatial analysis.</p>
           </div>
        </div>
      )}

      {!feedback ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8 h-full flex flex-col">
            <div 
              onClick={handleUploadClick}
              className={`
                flex-1 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer
                ${previewUrl ? 'border-[#7c9473] bg-[#7c9473]/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}
              `}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-64 rounded-2xl shadow-lg object-contain" />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 text-gray-500">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-400">Scan Sketch Surface</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {previewUrl && (
              <button 
                onClick={handleReset}
                className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <RefreshCcw size={12} />
                Refresh Data
              </button>
            )}
          </div>

          <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Contextual Instruction</span>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe the target scenario or perspective (e.g., 'A person sitting on a chair in a garden')..."
                  className="w-full h-40 px-6 py-5 rounded-[24px] bg-white/[0.03] border border-white/10 text-gray-300 text-sm focus:ring-4 focus:ring-[#7c9473]/10 transition-all outline-none resize-none"
                />
              </label>
            </div>

            <button
              disabled={!previewUrl || isAnalyzing}
              onClick={handleSubmit}
              className="w-full py-5 bg-[#7c9473] text-white rounded-[24px] font-bold text-lg shadow-[0_15px_30px_rgba(124,148,115,0.3)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-20 flex flex-col items-center justify-center gap-1"
            >
              {isAnalyzing ? (
                <>
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-outfit">Creative Processing...</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] opacity-60">Thinking Mode Active (Pro v3)</span>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <BrainCircuit size={24} />
                  <span className="font-outfit">Initiate Deep Analysis</span>
                </div>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-10">
              <div className="glass-card p-6 rounded-[40px] border border-white/5">
                 <img src={previewUrl!} alt="Source Data" className="w-full rounded-[24px] shadow-sm border border-white/10" />
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handlePinToExhibit}
                  disabled={isPinned}
                  className={`w-full py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-xl transition-all ${isPinned ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-[#e89f71] text-white hover:-translate-y-1'}`}
                >
                  {isPinned ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  {isPinned ? 'Pinned to Exhibit' : 'Pin to Exhibit'}
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 rounded-[24px] font-bold flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all"
                >
                  <RefreshCcw size={18} />
                  New Analysis
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 glass-card p-10 md:p-14 rounded-[50px] border border-white/5 space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                 <div className="w-12 h-12 bg-[#7c9473]/10 rounded-2xl flex items-center justify-center text-[#7c9473] border border-[#7c9473]/20">
                   <BrainCircuit size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold text-white font-outfit tracking-tight">Intel Report</h2>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Official Exam Evaluation Protocol</p>
                 </div>
              </div>

              <div className="text-gray-400 leading-relaxed space-y-6 text-lg font-medium">
                {feedback.split('\n').map((line, i) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;

                  if (trimmedLine.includes(':') && trimmedLine.includes('/10') && !trimmedLine.includes('SCORE ESTIMATE')) {
                    const [category, score] = trimmedLine.split(':');
                    return (
                      <div key={i} className="mt-8 mb-4 flex items-center justify-between border-b border-white/5 pb-2">
                         <div className="flex items-center gap-3">
                           <Target size={16} className="text-[#7c9473]" />
                           <span className="text-xs font-bold text-[#7c9473] uppercase tracking-[0.2em]">{category}</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Star size={14} className="text-[#e89f71] fill-[#e89f71]" />
                           <span className="text-lg font-outfit font-bold text-white">{score.trim()}</span>
                         </div>
                      </div>
                    );
                  }

                  if (trimmedLine.startsWith('-')) {
                    return (
                      <div key={i} className="flex gap-4 mb-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <div className="mt-1.5"><CheckCircle2 size={16} className="text-[#7c9473] group-hover:scale-110 transition-transform" /></div>
                        <p className="flex-1 text-base text-gray-300">{trimmedLine.replace('-', '').trim()}</p>
                      </div>
                    );
                  }

                  if (trimmedLine.includes('SCORE ESTIMATE')) {
                    const score = trimmedLine.split(':')[1]?.trim();
                    return (
                      <div key={i} className="mt-12 p-10 bg-gradient-to-br from-[#7c9473]/20 via-[#7c9473]/05 to-transparent rounded-[40px] border border-[#7c9473]/30 shadow-2xl relative overflow-hidden">
                         <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                           <Star size={160} className="text-white" />
                         </div>
                         <div className="relative z-10">
                           <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.4em] block mb-3">Aggregate Exam Grade</span>
                           <div className="flex items-baseline gap-2">
                             <span className="text-6xl font-outfit font-extrabold text-white tracking-tighter">{score}</span>
                           </div>
                           <p className="text-xs text-gray-500 font-medium mt-4 uppercase tracking-widest">Based on cumulative UCEED/CEED difficulty scaling</p>
                         </div>
                      </div>
                    );
                  }

                  return <p key={i} className="text-gray-400">{trimmedLine}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReview;
